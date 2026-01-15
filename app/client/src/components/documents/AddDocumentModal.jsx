import React, { useState, useRef } from 'react';

const categorii = ["Contracte", "Cereri", "Penal", "Civil"];

export const AddDocumentModal = ({ onClose, onSave }) => {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState(categorii[0]);
    const [description, setDescription] = useState("");
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === "application/pdf") {
                setFile(droppedFile);
            } else {
                alert("Vă rugăm să încărcați doar fișiere PDF.");
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Vă rugăm să selectați un fișier PDF.");
            return;
        }

        setIsSubmitting(true);

        const newDoc = {
            titlu: title,
            categorie: category,
            descriere: description,
            file: file,
            dataAdaugarii: new Date().toISOString()
        };

        try {
            await onSave(newDoc);
            onClose();
        } catch (error) {
            alert("A apărut o eroare la salvarea documentului.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Adaugă Document PDF</h2>
                    <button onClick={onClose} style={styles.closeButton}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Titlu Document</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Ex: Contract de Vânzare-Cumpărare"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Categorie</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={styles.select}
                        >
                            {categorii.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Descriere (Opțional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={styles.textarea}
                            placeholder="Adaugă o scurtă descriere a documentului..."
                            rows={3}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Fișier PDF</label>
                        <div
                            style={{
                                ...styles.dropZone,
                                borderColor: isDragging ? '#4F46E5' : '#D1D5DB',
                                backgroundColor: isDragging ? '#EEF2FF' : '#F9FAFB'
                            }}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={triggerFileInput}
                        >
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                            />
                            {file ? (
                                <div style={styles.fileInfo}>
                                    <span style={styles.fileName}>{file.name}</span>
                                    <span style={styles.changeFile}>(Click pentru a schimba)</span>
                                </div>
                            ) : (
                                <div style={styles.uploadPrompt}>
                                    <span style={styles.uploadIcon}>📄</span>
                                    <p style={styles.uploadText}>Trage fișierul aici sau click pentru a selecta</p>
                                    <p style={styles.uploadSubtext}>Doar format PDF</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={styles.footer}>
                        <button type="button" onClick={onClose} style={styles.cancelButton}>
                            Anulează
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                ...styles.saveButton,
                                opacity: isSubmitting ? 0.7 : 1
                            }}
                        >
                            {isSubmitting ? "Se încarcă..." : "Salvează Document"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px'
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    header: {
        padding: '20px 24px',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: { margin: 0, fontSize: '20px', fontWeight: '600', color: '#111827' },
    closeButton: {
        background: 'none', border: 'none', fontSize: '24px',
        color: '#6B7280', cursor: 'pointer', padding: '0 4px'
    },
    form: { padding: '24px' },
    formGroup: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' },
    input: {
        width: '100%', padding: '10px 12px', borderRadius: '6px',
        border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box'
    },
    select: {
        width: '100%', padding: '10px 12px', borderRadius: '6px',
        border: '1px solid #D1D5DB', fontSize: '14px', backgroundColor: 'white', boxSizing: 'border-box'
    },
    textarea: {
        width: '100%', padding: '10px 12px', borderRadius: '6px',
        border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box',
        fontFamily: 'inherit', resize: 'vertical'
    },
    dropZone: {
        border: '2px dashed #D1D5DB',
        borderRadius: '8px',
        padding: '32px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: '#F9FAFB',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '150px'
    },
    uploadIcon: {
        fontSize: '32px',
        marginBottom: '12px',
        display: 'block'
    },
    uploadText: {
        margin: '0 0 4px 0',
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151'
    },
    uploadSubtext: {
        margin: 0,
        fontSize: '12px',
        color: '#6B7280'
    },
    fileInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
    },
    fileName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#111827'
    },
    changeFile: {
        fontSize: '12px',
        color: '#4F46E5',
        fontWeight: '500'
    },
    footer: {
        display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px'
    },
    cancelButton: {
        padding: '10px 20px', borderRadius: '6px', border: '1px solid #D1D5DB',
        backgroundColor: 'white', color: '#374151', fontSize: '14px', fontWeight: '500',
        cursor: 'pointer'
    },
    saveButton: {
        padding: '10px 20px', borderRadius: '6px', border: 'none',
        backgroundColor: '#4F46E5', color: 'white', fontSize: '14px', fontWeight: '500',
        cursor: 'pointer'
    }
};
