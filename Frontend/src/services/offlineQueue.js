const QUEUE_KEY = "offline_messages";

export const getQueue = () => {
    try {
        return JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
    } catch {
        return [];
    }
};

export const addToQueue = (message) => {
    const queue = getQueue();
    queue.push(message);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const clearQueue = () => {
    localStorage.removeItem(QUEUE_KEY);
};

export const removeFromQueue = (tempId) => {
    const queue = getQueue().filter((msg) => msg.tempId !== tempId);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};
