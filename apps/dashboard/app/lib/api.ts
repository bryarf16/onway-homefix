const BASE_HOST = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const API_URL = `${BASE_HOST}/api/v1`;

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const rawText = await res.text();
    let data: any = {};

    try {
        data = rawText ? JSON.parse(rawText) : {};
    } catch {
        data = { message: rawText || "Server error occurred" };
    }

    if (!res.ok) {
        throw new Error(data.message || data.error || `HTTP ${res.status}: Request failed`);
    }

    return data;
};