// src/components/DocumentModal.jsx

import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../InitApp/firebase';
import { X } from "lucide-react";

const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000
};

const modalStyle = {
    background: "white",
    borderRadius: "12px",
    padding: "25px",
    width: "80%",
    maxWidth: "800px",
    maxHeight: "85vh",
    overflowY: "auto",
    position: "relative"
};

const closeIconStyle = {
    position: "absolute",
    right: "15px",
    top: "15px",
    background: "transparent",
    border: "none",
    cursor: "pointer"
};

export const DocumentModal = ({ documentId, onClose }) => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadContent = async () => {
            try {
                setLoading(true);

                const docRef = doc(db, "documentModels", documentId);
                const snap = await getDoc(docRef);

                if (!snap.exists()) {
                    alert("Documentul nu a fost găsit în baza de date.");
                    onClose();
                    return;
                }

                const data = snap.data();

                if (!data.continut) {
                    alert("Acest document nu are conținut text HTML.");
                    onClose();
                    return;
                }

                setContent(data);
                setLoading(false);
            } catch (err) {
                console.error("Eroare la încărcarea documentului:", err);
                alert("Nu s-a putut încărca documentul.");
                onClose();
            }
        };

        loadContent();
    }, [documentId, onClose]);

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <button style={closeIconStyle} onClick={onClose}>
                    <X size={28} />
                </button>

                {loading ? (
                    <p>Se încarcă conținutul...</p>
                ) : (
                    <>
                        <h2>{content.titlu}</h2>
                        <hr />

                        <div
                            style={{ marginTop: "20px" }}
                            dangerouslySetInnerHTML={{ __html: content.continut }}
                        />
                    </>
                )}
            </div>
        </div>
    );
};
