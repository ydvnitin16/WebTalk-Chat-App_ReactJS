const onlineUsers = new Map();

const normalizeUserId = (userId) => userId?.toString();

export const addOnlineUser = (userId) => {
    const normalizedUserId = normalizeUserId(userId);

    if (!normalizedUserId) return false;

    onlineUsers.set(normalizedUserId, new Date());
    return true;
};

export const removeOnlineUser = (userId) => {
    const normalizedUserId = normalizeUserId(userId);

    if (!normalizedUserId) return false;

    return onlineUsers.delete(normalizedUserId);
};

export const isUserOnline = (userId) => {
    const normalizedUserId = normalizeUserId(userId);

    return normalizedUserId ? onlineUsers.has(normalizedUserId) : false;
};

export const getOnlineUserIds = (userIds = []) => {
    return userIds
        .map((userId) => normalizeUserId(userId))
        .filter(Boolean)
        .filter((userId) => onlineUsers.has(userId));
};

export default onlineUsers;
