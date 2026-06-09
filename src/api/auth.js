import { axios, authHeaders } from "./client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const LOGIN_API = `${BACKEND_URL}/api/auth/login`;
const REGISTER_API = `${BACKEND_URL}/api/auth/register`;
const GET_CURRENT_USER_API = `${BACKEND_URL}/api/auth/me`;

export async function loginRequest(email, password) {
    const res = await axios.post(LOGIN_API, { email, password });
    return res.data; // { token, user }
}

export async function registerRequest(name, email, password) {
    const res = await axios.post(REGISTER_API, { name, email, password });
    return res.data; // { token, user }
}

export async function getCurrentUserRequest() {
    const res = await axios.get(GET_CURRENT_USER_API, { headers: authHeaders() });
    return res.data; // user object
}
