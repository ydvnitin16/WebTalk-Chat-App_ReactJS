let userToCall = new Map(); // userId -> { callId, timeoutId }
let callToUsers = new Map(); // callId -> { callerId, receiverId }

export function isUserBusy(userId) {
    return userToCall.has(String(userId));
}

export function getActiveCallId(userId) {
    return userToCall.get(String(userId))?.callId ?? null;
}

export function getCallUsers(callId) {
    return callToUsers.get(String(callId)) ?? null;
}

// When call is successfully initiated
export function lockUsersForCall({
    callId,
    callerId,
    receiverId,
    onMissedTimeout,
    ringTimeoutMs = 45000,
}) {
    callId = String(callId);
    const timeoutId = setTimeout(() => {
        onMissedTimeout?.(callId);
    }, ringTimeoutMs);

    userToCall.set(String(callerId), { callId, timeoutId });
    userToCall.set(String(receiverId), { callId, timeoutId });
    callToUsers.set(callId, { callerId, receiverId });
}

// When call accepted - Keep user (busy), remove the timer
export function clearRingTimeout(callId) {
    const users = callToUsers.get(String(callId));
    if (!users) return;
    const entry = userToCall.get(String(users.callerId));
    if (entry?.timeoutId) clearTimeout(entry.timeoutId);
}

// Called when call ends/rejected/missed - to free users
export function releaseCall(callId) {
    callId = String(callId);
    const users = callToUsers.get(callId);
    if (!users) return;
    clearRingTimeout(callId);
    userToCall.delete(String(users.callerId));
    userToCall.delete(String(users.receiverId));
    callToUsers.delete(callId);
}
