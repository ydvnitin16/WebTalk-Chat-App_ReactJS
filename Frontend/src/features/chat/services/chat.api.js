const BASE_URL = import.meta.env.VITE_SERVER_URL;

export const fetchConversations = async () => {
    const res = await fetch(`${BASE_URL}/conversations`, {
        method: "GET",
        credentials: "include",
    });
    return res.json();
};


export const fetchConversationTimeline = async (
    conversationId,
    cursor,
    limit = 20,
) => {
    const params = new URLSearchParams();

    if (cursor) {
        params.append("cursor", cursor);
    }

    params.append("limit", limit);

    const res = await fetch(
        `${BASE_URL}/timeline/${conversationId}?${params.toString()}`,
        {
            method: "GET",
            credentials: "include",
        },
    );

    return res.json();
};
