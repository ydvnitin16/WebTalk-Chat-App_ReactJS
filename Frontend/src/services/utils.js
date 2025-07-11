export function formatDateTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    // Strip time from both to compare just the date part
    const dateOnly = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffInDays = Math.floor((nowOnly - dateOnly) / (1000 * 60 * 60 * 24));

    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    const time = date.toLocaleTimeString('en-US', options);

    if (diffInDays === 0) {
        return time; // today
    } else if (diffInDays === 1) {
        return `Yesterday at ${time}`;
    } else {
        const fullDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        return `${fullDate}, ${time}`;
    }
}

export function getLastMessage(messages, user, userStore) {
    messages = messages.filter(
        (msg) =>
            (msg.sender === user._id && msg.receiver === userStore?.id) ||
            (msg.receiver === user._id && msg.sender === userStore?.id)
    );
    const messageObj = messages[messages.length - 1];
    const lastMessage = messageObj?.content;
    const sendedByYou = messageObj?.sender === userStore?.id ? 'You: ' : '';
    const createdAt = messageObj?.createdAt;
    return {lastMessage, sendedByYou, createdAt}
}

