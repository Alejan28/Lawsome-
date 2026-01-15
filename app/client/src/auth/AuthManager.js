class AuthManager {
    static login() {
        localStorage.setItem("isLoggedIn", "true");
    }

    static logout() {
        localStorage.removeItem("isLoggedIn");
    }

    static isAuthenticated() {
        return localStorage.getItem("isLoggedIn") === "true";
    }
}

export default AuthManager;
