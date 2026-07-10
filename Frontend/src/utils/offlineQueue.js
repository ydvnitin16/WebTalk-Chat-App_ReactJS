const QUEUE_KEY = "chat_messages";

export const getQueueMessages = (conversationId) => {
    try {
        const all = JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
        console.log("Getting All", all)
        return all[conversationId] || [];
    } catch {
        return [];
    }
};

export const addToMessageQueue = (conversationId, message) => {
    console.log("Adding", message)
    const all = JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
    const messages = all[conversationId] || [];
    messages.push(message);
    all[conversationId] = messages;
    console.log("Messages added", messages)
    console.log("Added All", all)
    localStorage.setItem(QUEUE_KEY, JSON.stringify(all));
};

export const removeMessageFromQueue = (conversationId, messageId) => {
    console.log("Removing", messageId)
    const all = JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
    let messages = all[conversationId] || [];
    messages =
        messages.length > 0 && messages.filter((m) => m.tempId !== messageId);
    messages?.length > 0
        ? (all[conversationId] = messages)
        : delete all[conversationId];
        console.log("REmoved All", all)
    localStorage.setItem(QUEUE_KEY, JSON.stringify(all));
};
