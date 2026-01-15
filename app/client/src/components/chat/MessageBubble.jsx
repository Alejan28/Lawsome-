const MessageBubble = ({ message, onDownload }) => (
    <div
        style={{
            display: "flex",
            justifyContent:
                message.sender === "user" ? "flex-end" : "flex-start",
            marginBottom: 10
        }}
    >
        <div
            style={{
                maxWidth: "70%",
                padding: 14,
                borderRadius: 16,
                background: message.sender === "user" ? "#6c63ff" : "#f2f2f2",
                color: message.sender === "user" ? "#fff" : "#000",
                whiteSpace: "pre-wrap"
            }}
        >
            {message.text}

            {message.fileBlob && (
                <button onClick={() => onDownload(message.fileBlob)}>
                    ⬇️ Descarcă documentul
                </button>
            )}
        </div>
    </div>
);

export default MessageBubble;
