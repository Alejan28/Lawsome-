// src/components/DocumentCard.jsx

import React from 'react';
import { FileText, Gavel, BookOpen, Briefcase } from "lucide-react";

const IconMap = {
    Contracte: Briefcase,
    Cereri: FileText,
    Penal: Gavel,
    Civil: BookOpen,
};

export const DocumentCard = ({ docData, onOpen }) => {
    const IconComponent = IconMap[docData.categorie];

    return (
        <div
            style={{
                padding: "20px",
                borderRadius: "12px",
                boxShadow: "0 0 12px rgba(0,0,0,0.1)",
                background: "white",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
            }}
        >
            <div>
                <div style={{ marginBottom: "10px" }}>
                    {IconComponent ? <IconComponent size={32} /> : <FileText size={32} />}
                </div>

                <h3 style={{ marginBottom: "10px", fontSize: "20px" }}>{docData.titlu}</h3>
                <p style={{ fontSize: "14px", color: "#555" }}>{docData.descriere}</p>
            </div>

            <button
                style={{
                    marginTop: "15px",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "#4e73df",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold"
                }}
                onClick={() => onOpen(docData.id)}
            >
                Deschide Documentul
            </button>
        </div>
    );
};
