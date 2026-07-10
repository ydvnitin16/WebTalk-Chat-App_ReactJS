const BASE_URL = import.meta.env.VITE_SERVER_URL;

export const fetchCallsHistory = async (conversationId) => {
    const res = await fetch(`${BASE_URL}/calls/${conversationId}`, {
        method: "GET",
        credentials: "include",
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "calls fetch failed");
    }
    return await res.json();
};
