import axios from "axios";
import { getToken } from "../auth";

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Ajoute "Authorization: Bearer <token>" à chaque requête si connecté
client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Si le token est expiré/invalide (401) -> déconnexion et retour au login
client.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err?.response?.status === 401) {
            localStorage.removeItem("accessToken");
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(err);
    }
);

export default client;