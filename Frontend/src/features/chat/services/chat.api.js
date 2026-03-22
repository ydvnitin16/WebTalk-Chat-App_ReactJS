const BASE_URL = import.meta.env.VITE_SERVER_URL;

export const fetchConversations = async () => {
    const res = await fetch(`${BASE_URL}/conversations`, {
        method: "GET",
        credentials: "include",
    });
    return res.json();
};

export const fetchMessages = async (conversationId) => {
    const res = await fetch(`${BASE_URL}/messages/${conversationId}`, {
        method: "GET",
        credentials: "include",
    });
    return res.json();
};
