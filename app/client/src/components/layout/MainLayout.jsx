import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function MainLayout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const isLoggedIn = !!user;

    const buttonStyle = (bgColor) => ({
        backgroundColor: bgColor,
        border: "none",
        padding: "8px 12px",
        color: "white",
        borderRadius: "6px",
        cursor: "pointer",
        minWidth: "80px"
    });

    const floatingButtonStyle = (bgColor, isDocumentButton = false) => ({
        position: "fixed",
        bottom: isDocumentButton ? "90px" : "25px",
        right: "25px",
        background: `linear-gradient(135deg, ${bgColor}, #ffffff33)`,
        border: "none",
        width: "55px",
        height: "55px",
        borderRadius: "50%",
        color: "white",
        fontSize: "22px",
        cursor: "pointer",
        zIndex: 9999,
        boxShadow: "0 6px 15px rgba(0,0,0,0.25)",
        transition: "0.3s ease, transform 0.2s ease",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    });

    const handleMouseOver = (e, bgColor) => {
        e.currentTarget.style.transform = "scale(1.15)";
        e.currentTarget.style.boxShadow = `0 8px 20px ${bgColor}88`;
    };

    const handleMouseOut = (e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 6px 15px rgba(0,0,0,0.25)";
    };

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column"
            }}
        >
            {/* HEADER */}
            <header
                style={{
                    width: "100%",
                    padding: "20px 0px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    backgroundColor: "#fff",
                    zIndex: 10
                }}
            >
                <h2
                    style={{ cursor: "pointer", margin: 0 }}
                    onClick={() => navigate("/")}
                >
                    LAWsome
                </h2>

                {!isLoggedIn ? (
                    <button
                        onClick={() => navigate("/login")}
                        style={buttonStyle("#007bff")}
                    >
                        Log In
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            logout();
                            navigate("/");
                        }}
                        style={buttonStyle("#dc3545")}
                    >
                        Log Out
                    </button>
                )}
            </header>

            {/* CONTENT */}
            <main
                style={{
                    flex: 1,
                    overflow: "auto",
                    background: "#f7f8fc"
                }}
            >
                {children}
            </main>

            {/* FLOATING BUTTON */}
            {location.pathname === "/chat" ? (
                <button
                    onClick={() => navigate("/")}
                    style={floatingButtonStyle("#1e90ff", true)}
                    title="Mergi la Documente"
                    onMouseOver={(e) => handleMouseOver(e, "#1e90ff")}
                    onMouseOut={handleMouseOut}
                >
                    🗂️
                </button>
            ) : (
                <button
                    onClick={() => navigate("/chat")}
                    style={floatingButtonStyle("#6c63ff")}
                    title="Mergi la Chat"
                    onMouseOver={(e) => handleMouseOver(e, "#6c63ff")}
                    onMouseOut={handleMouseOut}
                >
                    🗨️
                </button>
            )}
        </div>
    );
}
