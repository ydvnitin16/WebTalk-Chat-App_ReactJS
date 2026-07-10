const BASE_URL = import.meta.env.VITE_SERVER_URL;

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
        `${BASE_URL}/api/conversations/${conversationId}/timeline?${params.toString()}`,
        {
            method: "GET",
            credentials: "include",
        },
    );

    return res.json();
};
