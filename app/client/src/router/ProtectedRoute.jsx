import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children }) {
    const { isLoggedIn, loading } = useAuth();
    const location = useLocation();

    // ⏳ WAIT for auth to initialize
    if (loading) {
        return null; // or spinner
    }

    // 🔒 Not logged in
    if (!isLoggedIn) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // ✅ Logged in
    return children;
}
