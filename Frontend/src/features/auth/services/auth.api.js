const BASE_URL = import.meta.env.VITE_SERVER_URL;

export const loginUser = async (data) => {
    const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Authentication failed");
    }
    return await res.json();
};

export const signupUser = async (data) => {
    const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Authentication failed");
    }
    return await res.json();
};

export async function logoutUser() {
    const res = await fetch(`${BASE_URL}/logout`, {
        method: "DELETE",
        credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || "Logout failed");
    }
    return data;
}
