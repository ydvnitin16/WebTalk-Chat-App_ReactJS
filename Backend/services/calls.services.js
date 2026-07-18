import * as ActiveCallsStore from "../cache/activeCallsStore.js";
import Call from "../models/call.js";
import ConversationMember from "../models/conversationMember.js";

export async function initiateCall({
    clientCallId,
    callerId,
    conversationId,
    receiverId,
    type,
}) {
    // Check is already exists
    const existing = await Call.findOne({ callerId, clientCallId });
    if (existing) return existing;

    // Verify conversation exists between them
    const isMember = await ConversationMember.exists({
        conversationId,
        userId: { $in: [callerId, receiverId] },
    });
    if (!isMember) throw new Error("Not a member or access denied", 403);

    // Check if caller is busy
    if (ActiveCallsStore.isUserBusy(callerId)) {
        throw new Error("Caller already in call", 409);
    }

    // Check if receiver is busy
    if (ActiveCallsStore.isUserBusy(receiverId)) {
        return Call.create({
            clientCallId,
            conversationId,
            callerId,
            receiverId,
            type,
            status: "busy",
            endedAt: new Date(),
        });
    }

    // Create ringing call
    return Call.create({
        clientCallId,
        conversationId,
        callerId,
        receiverId,
        type,
        status: "ringing",
    });
}

export async function handleAccept({ callId, receiverId }) {
    const call = await loadCall({
        callId,
        userId: receiverId,
        requiredStatus: "ringing",
    });
    call.status = "connected";
    call.startedAt = new Date();
    await call.save();

    ActiveCallsStore.clearRingTimeout(callId);
    return call;
}

export async function handleReject({ callId, receiverId }) {
    return resolveNonAccepted({
        callId,
        expectedReceiverId: receiverId,
        status: "rejected",
    });
}

export async function handleMissedTimeout(callId) {
    return resolveNonAccepted({
        callId,
        expectedReceiverId: null,
        status: "missed",
    });
}

export async function endCall({ callId, userId }) {
    const call = await Call.findOne({ _id: callId });
    if (!call) throw new Error("Call not found", 404);


    const isParticipant = [
        String(call.callerId),
        String(call.receiverId),
    ].includes(String(userId));
    if (!isParticipant) throw new Error("Not a participant", 403);

    call.status = "completed";
    call.endedAt = new Date();
    await call.save();

    ActiveCallsStore.releaseCall(callId);
    return call;
}

// HELPER FUNCTIONS

export async function resolveNonAccepted({
    callId,
    expectedReceiverId,
    status,
}) {
    const call = await Call.findOne({ _id: callId, status: "ringing" });
    if (!call) return null; // Race condition mitigation

    if (
        expectedReceiverId &&
        String(call.receiverId) !== String(expectedReceiverId)
    ) {
        throw new Error("NOt the receiver", 403);
    }

    call.status = status;
    call.endedAt = new Date();
    await call.save();

    ActiveCallsStore.releaseCall(callId);
    return call;
}

export async function loadCall({ callId, userId, requiredStatus }) {
    const call = await Call.findOne({ _id: callId });
    if (!call) throw new Error("Call not found", 404);
    if (String(call.receiverId) !== String(userId))
        throw new Error("Not the receiver", 403);
    if (call.status !== requiredStatus)
        throw new Error("Invalid call status", 409);

    return call;
}
