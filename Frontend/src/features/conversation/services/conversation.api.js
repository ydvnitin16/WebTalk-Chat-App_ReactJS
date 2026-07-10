const BASE_URL = import.meta.env.VITE_SERVER_URL;

export const fetchConversations = async () => {
    const res = await fetch(`${BASE_URL}/api/conversations`, {
        method: "GET",
        credentials: "include",
    });
    return res.json();
};
