const conversationsByParticipantKey = new Map();
const FIVE_MINUTES_MS = 5 * 60 * 1000;

const normalizeKey = (participantKey) => participantKey?.toString();

export const getCachedConversation = (participantKey) => {
    const key = normalizeKey(participantKey);
    if (!key) return null;

    return conversationsByParticipantKey.get(key)?.conversation ?? null;
};

export const setCachedConversation = (
    participantKey,
    conversation,
    ttlMs = FIVE_MINUTES_MS,
) => {
    const key = normalizeKey(participantKey);
    if (!key || !conversation) return false;

    const existing = conversationsByParticipantKey.get(key);
    if (existing?.timeoutId) clearTimeout(existing.timeoutId);

    const timeoutId = setTimeout(() => {
        conversationsByParticipantKey.delete(key);
    }, ttlMs);
    timeoutId.unref?.();

    conversationsByParticipantKey.set(key, { conversation, timeoutId });
    return true;
};

export const removeCachedConversation = (participantKey) => {
    const key = normalizeKey(participantKey);
    if (!key) return false;

    const existing = conversationsByParticipantKey.get(key);
    if (existing?.timeoutId) clearTimeout(existing.timeoutId);

    return conversationsByParticipantKey.delete(key);
};

export default conversationsByParticipantKey;
