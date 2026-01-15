import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const SignUp = () => {
    const { handleSignup } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await handleSignup(email, password, firstName, lastName, "client");
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                width: "100%",
            }}
        >
            <div
                style={{
                    backgroundColor: "#fff",
                    padding: "30px",
                    borderRadius: "10px",
                    maxWidth: "400px",
                    width: "100%",
                    boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
                }}
            >
                <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
                    Creează un cont nou
                </h2>

                {error && <p style={{ color: "red", fontWeight: "bold", textAlign: "center" }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Prenume"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <input
                        type="text"
                        placeholder="Nume"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <input
                        type="password"
                        placeholder="Parolă (min. 6 caractere)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />

                    <button
                        type="submit"
                        style={buttonStyle("#28a745")}
                        disabled={loading}
                    >
                        {loading ? "Se procesează..." : "Creează cont"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
    boxSizing: "border-box",
};

const buttonStyle = (bgColor) => ({
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    backgroundColor: bgColor,
    border: "none",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
});

export default SignUp;
