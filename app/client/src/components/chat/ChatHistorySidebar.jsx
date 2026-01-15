import React from 'react';

const ChatHistorySidebar = ({ isOpen, onClose, conversations, onSelectConversation, onNewConversation, onDeleteConversation, loading }) => {
    if (!isOpen) return null;

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short' });
    };

    const handleDelete = (e, convId) => {
        e.stopPropagation();
        if (window.confirm("Sigur dorești să ștergi această conversație?")) {
            onDeleteConversation(convId);
        }
    };

    return (
        <div style={styles.sidebar}>
            <div style={styles.header}>
                <h3>Conversații</h3>
                <button onClick={onClose} style={styles.closeBtn}>X</button>
            </div>
            
            <div style={{ padding: '10px 15px' }}>
                <button onClick={onNewConversation} style={styles.newChatBtn}>
                    + Conversație Nouă
                </button>
            </div>

            <div style={styles.content}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#666' }}>Se încarcă...</p>
                ) : conversations.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
                        Nu există conversații.
                    </p>
                ) : (
                    conversations.map((conv) => (
                        <div 
                            key={conv.id} 
                            onClick={() => onSelectConversation(conv.id)}
                            style={styles.convItem}
                            className="conv-item"
                        >
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={styles.convTitle}>{conv.title}</div>
                                <div style={styles.convMeta}>
                                    <span style={styles.lastMsg}>{conv.lastMessage?.substring(0, 30)}...</span>
                                    <span style={styles.date}>{formatDate(conv.updatedAt)}</span>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => handleDelete(e, conv.id)}
                                style={styles.deleteBtn}
                                title="Șterge conversația"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
            <style>{`
                .conv-item:hover {
                    background-color: #e5e7eb !important;
                }
                .conv-item:hover button {
                    opacity: 1;
                }
            `}</style>
        </div>
    );
};

const styles = {
    sidebar: {
        width: '300px',
        height: '100%',
        backgroundColor: '#fff',
        borderLeft: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 100
    },
    header: {
        padding: '15px 20px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9f9f9'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: 20,
        cursor: 'pointer',
        color: '#666'
    },
    newChatBtn: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#4F46E5',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '500'
    },
    content: {
        flex: 1,
        overflowY: 'auto',
        padding: '0 15px 15px 15px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10
    },
    convItem: {
        padding: '12px',
        borderRadius: '8px',
        backgroundColor: '#f3f4f6',
        cursor: 'pointer',
        transition: 'background 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px'
    },
    convTitle: {
        fontWeight: '600',
        fontSize: '14px',
        marginBottom: '4px',
        color: '#111827',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    convMeta: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#6B7280'
    },
    lastMsg: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '70%'
    },
    deleteBtn: {
        background: 'none',
        border: 'none',
        color: '#EF4444',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.6,
        transition: 'all 0.2s'
    }
};

export default ChatHistorySidebar;
