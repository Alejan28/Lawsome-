import React, { useEffect, useRef, useState } from "react";
import { ChatFlow } from "./ChatFlow";
import { DOCUMENT_TYPES } from "./models/documentTypes";
import { downloadDocx } from "./fileUtils";
import { useAuth } from "../../auth/AuthContext";
import { useChatHistory } from "../../hooks/useChatHistory";
import ChatHistorySidebar from "./ChatHistorySidebar";

// Create ONE flow instance (acts like a controller)
const chatFlow = new ChatFlow(DOCUMENT_TYPES);

const ChatUI = ({ messageService }) => {
    const { user } = useAuth();
    const { 
        conversations, 
        messages: historyMessages, 
        loading: historyLoading, 
        saveMessage, 
        startNewConversation, 
        selectConversation,
        deleteConversation
    } = useChatHistory(user?.uid);

    const [mode, setMode] = useState("generation"); // generation | analysis | qa
    
    const [localMessages, setLocalMessages] = useState([
        {
            sender: "bot",
            text: "👋 Salut! Ce tip de document dorești să generezi?\n(cerere / contract / procura)"
        }
    ]);

    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    // If historyMessages are loaded (meaning a conversation is selected), use them.
    // Otherwise, use localMessages (for new/unauthenticated sessions).
    const messages = (user && historyMessages.length > 0) ? historyMessages : localMessages;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // When a conversation is selected, we might want to switch mode if we stored it.
    const handleSelectConversation = (id) => {
        selectConversation(id);
        const conv = conversations.find(c => c.id === id);
        if (conv && conv.mode) {
            setMode(conv.mode);
        }
        setIsHistoryOpen(false);
    };

    const handleNewConversation = () => {
        // When starting new, we keep the CURRENT mode selected by the user
        startNewConversation("Conversație Nouă", mode);
        
        let initialText = "";
        if (mode === "generation") initialText = "👋 Salut! Ce tip de document dorești să generezi?\n(cerere / contract / procura)";
        else if (mode === "analysis") initialText = "👋 Salut! Încarcă un document PDF pentru analiză.";
        else if (mode === "qa") initialText = "👋 Salut! Cu ce problemă legală te pot ajuta?";

        setLocalMessages([{
            sender: "bot",
            text: initialText
        }]);
        
        if (mode === "generation") chatFlow.reset();
        setIsHistoryOpen(false);
    };

    // Switch mode handler (resets current view if it's a new session)
    const handleModeChange = (newMode) => {
        setMode(newMode);
        
        let initialText = "";
        if (newMode === "generation") initialText = "👋 Salut! Ce tip de document dorești să generezi?\n(cerere / contract / procura)";
        else if (newMode === "analysis") initialText = "👋 Salut! Încarcă un document PDF pentru analiză.";
        else if (newMode === "qa") initialText = "👋 Salut! Cu ce problemă legală te pot ajuta?";

        setLocalMessages([{ sender: "bot", text: initialText }]);
        
        if (user) {
            selectConversation(null); 
        }
        
        if (newMode === "generation") chatFlow.reset();
    };

    const addMsg = async (msg) => {
        setLocalMessages(prev => [...prev, msg]);
        if (user) {
            await saveMessage(msg, mode);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Ensure greeting is saved if this is a new conversation
        if (user && historyMessages.length === 0) {
            let initialText = "👋 Salut! Încarcă un document PDF pentru analiză.";
            await saveMessage({ sender: "bot", text: initialText }, mode);
        }

        await addMsg({ sender: "user", text: `📎 Am încărcat: ${file.name}` });
        setIsLoading(true);

        try {
            const response = await messageService.analyzeDocument(file);
            // Extract the text from the response object
            // The backend seems to return { "response": "..." } based on the user's log
            const resultText = response.response || response.explanation || response.result || JSON.stringify(response);
            
            await addMsg({ sender: "bot", text: `✅ Analiză completă:\n\n${resultText}` });
        } catch (error) {
            console.error(error);
            await addMsg({ sender: "bot", text: "❌ Eroare la analizarea documentului." });
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userInput = input.trim();
        setInput("");

        // Ensure greeting is saved if this is a new conversation
        if (user && historyMessages.length === 0) {
            let initialText = "";
            if (mode === "generation") initialText = "👋 Salut! Ce tip de document dorești să generezi?\n(cerere / contract / procura)";
            else if (mode === "analysis") initialText = "👋 Salut! Încarcă un document PDF pentru analiză.";
            else if (mode === "qa") initialText = "👋 Salut! Cu ce problemă legală te pot ajuta?";
            
            await saveMessage({ sender: "bot", text: initialText }, mode);
        }

        await addMsg({ sender: "user", text: userInput });

        try {
            if (mode === "generation") {
                // --- GENERATION LOGIC ---
                if (!chatFlow.isDocumentSelected()) {
                    const question = chatFlow.selectDocument(userInput.toLowerCase());
                    await addMsg({ sender: "bot", text: question });
                    return;
                }
                const result = chatFlow.handleAnswer(userInput);
                if (!result.done) {
                    await addMsg({ sender: "bot", text: result.nextQuestion });
                    return;
                }
                setIsLoading(true);
                const blob = await messageService.sendMessage(result.payload);
                await addMsg({ sender: "bot", text: "📄 Documentul este gata!", fileBlob: blob });
                await addMsg({ sender: "bot", text: "Vrei să generezi un alt document?" });
                chatFlow.reset();
                setIsLoading(false);

            } else if (mode === "qa") {
                // --- Q&A LOGIC ---
                setIsLoading(true);
                const response = await messageService.askQuestion(userInput);
                const answerText = response.answer || response.response || response.result || JSON.stringify(response);
                await addMsg({ sender: "bot", text: answerText });
                setIsLoading(false);

            } else if (mode === "analysis") {
                // --- ANALYSIS LOGIC ---
                setIsLoading(true);
                try {
                    const data = await messageService.askQuestion(userInput);

                    // Check for 'response' key here as well
                    const answerText = data.response || data.answer || JSON.stringify(data);

                    await addMsg({ sender: "bot", text: answerText });
                } catch (error) {
                    await addMsg({ sender: "bot", text: "Eroare la comunicarea cu serverul." });
                }
                setIsLoading(false);            }

        } catch (err) {
            console.error(err);
            await addMsg({ sender: "bot", text: "❌ A apărut o eroare. Te rog încearcă din nou." });
            chatFlow.reset();
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.wrapper}>
            <style>{`
                .history-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #6B7280;
                    font-size: 14px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                .history-btn:hover {
                    background-color: #F3F4F6;
                    color: #4F46E5;
                }
                .history-btn.active {
                    color: #4F46E5;
                    background-color: #EEF2FF;
                }
                .mode-tab {
                    padding: 8px 16px;
                    border-radius: 20px;
                    border: none;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    transition: all 0.2s;
                    background: #f3f4f6;
                    color: #6b7280;
                }
                .mode-tab.active {
                    background: #4F46E5;
                    color: white;
                }
            `}</style>

            <div style={styles.chatContainer}>
                {/* Header */}
                <div style={styles.header}>
                    {/* Mode Selector */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                            className={`mode-tab ${mode === 'generation' ? 'active' : ''}`}
                            onClick={() => handleModeChange('generation')}
                        >
                            Generare
                        </button>
                        <button 
                            className={`mode-tab ${mode === 'analysis' ? 'active' : ''}`}
                            onClick={() => handleModeChange('analysis')}
                        >
                            Analiză
                        </button>
                        <button 
                            className={`mode-tab ${mode === 'qa' ? 'active' : ''}`}
                            onClick={() => handleModeChange('qa')}
                        >
                            Q&A
                        </button>
                    </div>

                    {user && (
                        <button 
                            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                            className={`history-btn ${isHistoryOpen ? 'active' : ''}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="history-icon" style={{width: 18, height: 18}}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Istoric</span>
                        </button>
                    )}
                </div>

                <div style={styles.messages}>
                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                justifyContent:
                                    msg.sender === "user" ? "flex-end" : "flex-start",
                                marginBottom: 10
                            }}
                        >
                            <div
                                style={{
                                    ...styles.bubble,
                                    background:
                                        msg.sender === "user" ? "#6c63ff" : "#f2f2f2",
                                    color: msg.sender === "user" ? "#fff" : "#000"
                                }}
                            >
                                {msg.text}

                                {(msg.fileBlob || msg.fileUrl) && (
                                    <div style={{ marginTop: 10 }}>
                                        <button
                                            style={styles.downloadBtn}
                                            onClick={() => {
                                                if (msg.fileBlob) {
                                                    downloadDocx(msg.fileBlob, "document.docx");
                                                } else if (msg.fileUrl) {
                                                    window.open(msg.fileUrl, "_blank");
                                                }
                                            }}
                                        >
                                            ⬇️ Descarcă documentul
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div style={styles.typing}>Bot scrie...</div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* INPUT BAR */}
                <div style={styles.inputBar}>
                    {mode === 'analysis' && (
                        <>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept=".pdf"
                                onChange={handleFileUpload}
                            />
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                style={styles.attachBtn}
                                title="Încarcă PDF"
                            >
                                📎
                            </button>
                        </>
                    )}
                    
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendMessage()}
                        placeholder={mode === 'analysis' ? "Încarcă un fișier..." : "Scrie mesajul..."}
                        style={styles.input}
                        disabled={isLoading}
                    />
                    <button
                        onClick={sendMessage}
                        style={styles.sendBtn}
                        disabled={isLoading}
                    >
                        Trimite
                    </button>
                </div>
            </div>

            <ChatHistorySidebar 
                isOpen={isHistoryOpen} 
                onClose={() => setIsHistoryOpen(false)} 
                conversations={conversations}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                onDeleteConversation={deleteConversation}
                loading={historyLoading}
            />
        </div>
    );
};

export default ChatUI;

const styles = {
    wrapper: {
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden"
    },

    chatContainer: {
        flex: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        position: "relative"
    },

    header: {
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fff", 
    },

    messages: {
        flex: 1,
        padding: 20,
        overflowY: "auto"
    },

    bubble: {
        maxWidth: "70%",
        padding: 14,
        borderRadius: 16,
        whiteSpace: "pre-wrap"
    },

    typing: {
        fontSize: 12,
        color: "#999",
        marginTop: 6
    },

    inputBar: {
        display: "flex",
        gap: 10,
        padding: 14,
        borderTop: "1px solid #eee",
        background: "#fff"
    },

    input: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        border: "1px solid #ddd",
        outline: "none"
    },

    sendBtn: {
        padding: "0 20px",
        borderRadius: 10,
        border: "none",
        background: "#6c63ff",
        color: "#fff",
        cursor: "pointer"
    },

    attachBtn: {
        padding: "0 14px",
        borderRadius: 10,
        border: "1px solid #ddd",
        background: "#f9fafb",
        cursor: "pointer",
        fontSize: "18px"
    },

    downloadBtn: {
        marginTop: 4,
        padding: "6px 10px",
        borderRadius: 6,
        border: "none",
        cursor: "pointer"
    }
};