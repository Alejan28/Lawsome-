// src/hooks/useDocumentData.js

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../InitApp/firebase';

export const useDocumentData = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadDocs = async () => {
            try {
                const snapshot = await getDocs(collection(db, "documentModels"));
                const list = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setDocuments(list);
                setLoading(false);
            } catch (err) {
                console.error("Eroare la încărcare:", err);
                setError("Nu s-au putut încărca documentele din Firebase.");
                setLoading(false);
            }
        };

        loadDocs();
    }, []);

    const addNewDocument = async (docData) => {
        try {
            let fileUrl = docData.url || "";

            // If a file object is present, upload it to Storage
            if (docData.file) {
                const storageRef = ref(storage, `documents/${Date.now()}_${docData.file.name}`);
                const snapshot = await uploadBytes(storageRef, docData.file);
                fileUrl = await getDownloadURL(snapshot.ref);
            }

            // Prepare data for Firestore (exclude the raw file object)
            const { file, ...firestoreData } = docData;
            const finalData = {
                ...firestoreData,
                url: fileUrl,
                type: 'pdf' // Enforce type as pdf for uploaded files
            };

            const docRef = await addDoc(collection(db, "documentModels"), finalData);
            const newDoc = { id: docRef.id, ...finalData };
            
            setDocuments(prevDocs => [...prevDocs, newDoc]);
            return newDoc;
        } catch (err) {
            console.error("Eroare la adăugare:", err);
            throw err;
        }
    };

    return { documents, loading, error, addNewDocument };
};
