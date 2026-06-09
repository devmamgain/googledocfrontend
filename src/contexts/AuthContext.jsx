import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    loginRequest,
    registerRequest,
    getCurrentUserRequest,
} from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Bootstrap: fetch current user if we already have a token
    useEffect(() => {
        const existing = localStorage.getItem("token");
        if (!existing) {
            setLoading(false);
            return;
        }
        getCurrentUserRequest()
            .then((u) => setUser(u))
            .catch(() => {
                localStorage.removeItem("token");
                setToken(null);
            })
            .finally(() => setLoading(false));
    }, []);

    async function login(email, password) {
        const data = await loginRequest(email, password);
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        toast.success("Welcome back!");
        navigate("/dashboard");
    }

    async function register(name, email, password) {
        const data = await registerRequest(name, email, password);
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        toast.success("Account created!");
        navigate("/dashboard");
    }

    function logout() {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        navigate("/login");
    }

    return (
        <AuthContext.Provider
            value={{ user, token, loading, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
