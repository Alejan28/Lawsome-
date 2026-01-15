import React from 'react';

const ChatHistoryModal = ({ isOpen, onClose, history, loading }) => {
    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h3>Istoric Chat</h3>
                    <button onClick={onClose} style={styles.closeBtn}>X</button>
                </div>
                <div style={styles.content}>
                    {loading ? (
                        <p>Se încarcă...</p>
                    ) : history.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
                            Nu există istoric.
                        </p>
                    ) : (
                        history.map((msg, i) => (
                            <div key={i} style={{
                                ...styles.msgRow,
                                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    ...styles.bubble,
                                    background: msg.sender === 'user' ? '#6c63ff' : '#f2f2f2',
                                    color: msg.sender === 'user' ? '#fff' : '#000'
                                }}>
                                    {msg.text}
                                    {(msg.fileUrl) && (
                                        <div style={{ marginTop: 5, fontSize: '0.9em' }}>
                                            <a 
                                                href={msg.fileUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                style={{ color: 'inherit', textDecoration: 'underline' }}
                                            >
                                                📄 Deschide document
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000
    },
    modal: {
        width: '90%', maxWidth: '600px', height: '80%',
        backgroundColor: '#fff', borderRadius: 12,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
    },
    header: {
        padding: '15px 20px', borderBottom: '1px solid #eee',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#f9f9f9'
    },
    closeBtn: {
        background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#666'
    },
    content: {
        flex: 1, overflowY: 'auto', padding: 20,
        display: 'flex', flexDirection: 'column', gap: 10
    },
    msgRow: {
        display: 'flex', width: '100%'
    },
    bubble: {
        maxWidth: '80%', padding: '10px 14px', borderRadius: 12,
        whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: '1.4'
    }
};

export default ChatHistoryModal;
