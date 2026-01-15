import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser } from "./AuthService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // ✅ ADD THIS

    // Restore login from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("isLoggedIn");

        if (saved === "true") {
            const storedUser = JSON.parse(localStorage.getItem("userData"));
            setUser(storedUser);
        }

        setLoading(false); // ✅ IMPORTANT
    }, []);

    const handleLogin = async (email, password) => {
        const loggedUser = await loginUser(email, password);
        setUser(loggedUser);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userData", JSON.stringify(loggedUser));
    };

    const handleSignUp = async (email, password, firstName, lastName, role) => {
        const newUser = await registerUser(
            email,
            password,
            firstName,
            lastName,
            role
        );
        setUser(newUser);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userData", JSON.stringify(newUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userData");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn: !!user, // ✅ DERIVED STATE
                loading,            // ✅ EXPOSE LOADING
                handleLogin,
                handleSignUp,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
