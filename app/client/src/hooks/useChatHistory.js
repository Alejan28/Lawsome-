import { useState, useEffect, useRef } from 'react';
import { db, storage } from '../InitApp/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const useChatHistory = (userId) => {
    const [conversations, setConversations] = useState([]);
    const [currentConversationId, setCurrentConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usingLocal, setUsingLocal] = useState(false);
    
    // Ref to track current conversation ID across async operations and stale closures
    const conversationIdRef = useRef(null);

    // Sync ref with state
    useEffect(() => {
        conversationIdRef.current = currentConversationId;
    }, [currentConversationId]);

    // 1. Load Conversations List
    useEffect(() => {
        if (!userId) {
            setConversations([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'users', userId, 'conversations'),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const convs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setConversations(convs);
            setLoading(false);
            setUsingLocal(false);
        }, (error) => {
            console.warn("Firestore access failed. Falling back to localStorage.", error);
            setUsingLocal(true);
            try {
                const localConvs = JSON.parse(localStorage.getItem(`conversations_${userId}`) || "[]");
                setConversations(localConvs);
            } catch (e) { console.error(e); }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    // 2. Load Messages for Current Conversation
    useEffect(() => {
        if (!userId || !currentConversationId) {
            setMessages([]);
            return;
        }

        if (usingLocal) {
            try {
                const localMsgs = JSON.parse(localStorage.getItem(`messages_${currentConversationId}`) || "[]");
                setMessages(localMsgs);
            } catch (e) { console.error(e); }
            return;
        }

        const q = query(
            collection(db, 'users', userId, 'conversations', currentConversationId, 'messages'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [userId, currentConversationId, usingLocal]);

    // 3. Start New Conversation
    const startNewConversation = async (title = "Conversație Nouă", mode = "generation") => {
        if (!userId) return;
        
        const newConv = {
            title,
            mode,
            createdAt: usingLocal ? Date.now() : serverTimestamp(),
            updatedAt: usingLocal ? Date.now() : serverTimestamp(),
            lastMessage: "Început de conversație"
        };

        if (usingLocal) {
            const id = "local_" + Date.now();
            const updatedConvs = [{ id, ...newConv, createdAt: Date.now(), updatedAt: Date.now() }, ...conversations];
            localStorage.setItem(`conversations_${userId}`, JSON.stringify(updatedConvs));
            setConversations(updatedConvs);
            
            setCurrentConversationId(id);
            conversationIdRef.current = id; // Update ref immediately
            return id;
        } else {
            try {
                const docRef = await addDoc(collection(db, 'users', userId, 'conversations'), newConv);
                setCurrentConversationId(docRef.id);
                conversationIdRef.current = docRef.id; // Update ref immediately
                return docRef.id;
            } catch (e) {
                console.error("Error creating conversation, switching to local", e);
                setUsingLocal(true);
                // Retry locally
                return startNewConversation(title, mode);
            }
        }
    };

    // 4. Send Message
    const saveMessage = async (message, mode = "generation") => {
        if (!userId) return;

        // Use ref to get the latest ID, avoiding stale closure issues
        let activeId = conversationIdRef.current;
        
        if (!activeId) {
            // Auto-create conversation if none selected
            const title = message.text.substring(0, 30) + (message.text.length > 30 ? "..." : "");
            activeId = await startNewConversation(title, mode);
            // startNewConversation updates the ref, so we are good
        }

        let fileUrl = null;
        if (message.fileBlob && !usingLocal) {
             try {
                const storageRef = ref(storage, `chat_files/${userId}/${Date.now()}_document.docx`);
                await uploadBytes(storageRef, message.fileBlob);
                fileUrl = await getDownloadURL(storageRef);
            } catch (e) { console.error("File upload failed", e); }
        }

        const msgData = {
            text: message.text,
            sender: message.sender,
            timestamp: usingLocal ? Date.now() : serverTimestamp(),
            fileUrl: fileUrl || null
        };

        if (usingLocal) {
            const localMsgs = JSON.parse(localStorage.getItem(`messages_${activeId}`) || "[]");
            const newMsgs = [...localMsgs, { ...msgData, timestamp: Date.now() }];
            localStorage.setItem(`messages_${activeId}`, JSON.stringify(newMsgs));
            setMessages(newMsgs);

            const updatedConvs = conversations.map(c => 
                c.id === activeId ? { ...c, lastMessage: message.text, updatedAt: Date.now() } : c
            );
            localStorage.setItem(`conversations_${userId}`, JSON.stringify(updatedConvs));
            setConversations(updatedConvs);
        } else {
            try {
                await addDoc(collection(db, 'users', userId, 'conversations', activeId, 'messages'), msgData);
                await updateDoc(doc(db, 'users', userId, 'conversations', activeId), {
                    lastMessage: message.text,
                    updatedAt: serverTimestamp()
                });
            } catch (e) {
                console.error("Error sending message", e);
            }
        }
    };

    const selectConversation = (id) => {
        setCurrentConversationId(id);
        conversationIdRef.current = id;
    };

    const deleteConversation = async (conversationId) => {
        if (!userId) return;

        if (usingLocal) {
            const updatedConvs = conversations.filter(c => c.id !== conversationId);
            localStorage.setItem(`conversations_${userId}`, JSON.stringify(updatedConvs));
            setConversations(updatedConvs);
            localStorage.removeItem(`messages_${conversationId}`);
        } else {
            try {
                // Delete messages subcollection (client-side manual delete)
                const messagesRef = collection(db, 'users', userId, 'conversations', conversationId, 'messages');
                const snapshot = await getDocs(messagesRef);
                const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
                await Promise.all(deletePromises);

                // Delete conversation doc
                await deleteDoc(doc(db, 'users', userId, 'conversations', conversationId));
            } catch (error) {
                console.error("Error deleting conversation:", error);
            }
        }

        // If the deleted conversation was active, reset
        if (currentConversationId === conversationId) {
            setCurrentConversationId(null);
            conversationIdRef.current = null;
            setMessages([]);
        }
    };

    return { 
        conversations, 
        currentConversationId, 
        messages, 
        loading, 
        saveMessage, 
        startNewConversation, 
        selectConversation,
        deleteConversation
    };
};