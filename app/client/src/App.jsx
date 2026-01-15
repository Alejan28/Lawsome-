import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import ChatUI from "./components/chat/ChatUI";
import DocumentePrestabilite from "./components/documents/DocumentsUI";
import Login from "./components/auth/LogIn";
import SignUp from "./components/auth/SignUp";
import { messageService } from "./components/chat/messageService";


import ProtectedRoute from "./router/ProtectedRoute";
import { AuthProvider } from "./auth/AuthContext";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <MainLayout>
                                <DocumentePrestabilite />
                            </MainLayout>
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <MainLayout>
                                <Login />
                            </MainLayout>
                        }
                    />
                    <Route
                        path="/signup"
                        element={
                            <MainLayout>
                                <SignUp />
                            </MainLayout>
                        }
                    />
                    <Route
                        path="/chat"
                        element={
                            <ProtectedRoute>
                                <MainLayout>
                                    <ChatUI messageService={messageService} />
                                </MainLayout>
                            </ProtectedRoute>
                        }
                    />

                </Routes>
            </BrowserRouter>
        </AuthProvider>

    );
}
