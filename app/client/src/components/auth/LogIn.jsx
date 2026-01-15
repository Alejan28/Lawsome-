import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";



const Login = () => {
    const { handleLogin } = useAuth();
    const navigate = useNavigate();

    const location = useLocation();
    const from = location.state?.from?.pathname || "/";


    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await handleLogin(email, password);
            console.log("Handled LogIn")
            navigate(from, { replace: true });
            console.log("failed to redirect")
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
                    maxWidth: "350px",
                    width: "100%",
                    boxShadow: "0px 4px 15px rgba(0,0,0,0.1)",
                }}
            >
                <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Autentificare</h2>

                {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        required
                        style={inputStyle}
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Parolă"
                        required
                        style={inputStyle}
                    />
                    <button
                        type="submit"
                        style={buttonStyle("#007bff")}
                        disabled={loading}
                    >
                        {loading ? "Se autentifică..." : "Autentificare"}
                    </button>
                </form>

                <p style={{ marginTop: "15px", textAlign: "center", fontSize: "14px" }}>
                    Nu ai cont?{" "}
                    <Link to="/signup" style={{ color: "#007bff", cursor: "pointer" }}>
                        Creează unul
                    </Link>
                </p>
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

export default Login;
