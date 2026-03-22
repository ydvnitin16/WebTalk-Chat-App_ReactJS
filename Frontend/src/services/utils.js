export function formatDateTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    // Strip time from both to compare just the date part
    const dateOnly = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
    );
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const diffInDays = Math.floor((nowOnly - dateOnly) / (1000 * 60 * 60 * 24));

    const options = { hour: "numeric", minute: "2-digit", hour12: true };
    const time = date.toLocaleTimeString("en-US", options);

    if (diffInDays === 0) {
        return time; // today
    } else if (diffInDays === 1) {
        return `Yesterday`;
    } else {
        const fullDate = date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
        return `${fullDate}, ${time}`;
    }
}

export function getLastMessage(messages, user, currentUser) {
    console.log(messages, user, currentUser);
    messages = messages?.filter(
        (msg) =>
            (msg.sender === user._id && msg.receiver === currentUser?.id) ||
            (msg.receiver === user._id && msg.sender === currentUser?.id),
    );
    const messageObj = messages[messages.length - 1];
    const lastMessage = messageObj?.content;
    const sendedByYou = messageObj?.sender === currentUser?.id ? "You: " : "";
    const createdAt = messageObj?.createdAt;
    return { lastMessage, sendedByYou, createdAt };
}

// this fucntion will use for extracting the users from the conversations.participants to have a separate users data without duplicacy
export const normalizeConversations = (conversations) => {
    const users = {};
    const normalizedConversations = [];

    for (const conv of conversations) {
        const participantIds = [];

        for (const user of conv.participants) {
            users[user._id] = {
                ...users[user._id],
                ...user,
            };

            participantIds.push(user._id);
        }

        normalizedConversations.push({
            ...conv,
            participants: participantIds,
        });
    }

    return {
        users,
        conversations: normalizedConversations,
    };
};
