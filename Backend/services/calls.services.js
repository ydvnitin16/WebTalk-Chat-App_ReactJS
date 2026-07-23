import * as ActiveCallsStore from "../cache/activeCallsStore.js";
import Call from "../models/call.js";
import ConversationMember from "../models/conversationMember.js";

const TRANSITIONS = {
    accept: { from: "ringing", to: "connected", actor: "receiver" },
    reject: { from: "ringing", to: "rejected", actor: "receiver" },
    cancel: { from: "ringing", to: "cancelled", actor: "caller" },
    timeout: { from: "ringing", to: "missed", actor: "system" },
    end: { from: "connected", to: "completed", actor: "participant" },
};

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

    // Verify BOTH users are members of the conversation
    const memberCount = await ConversationMember.countDocuments({
        conversationId,
        userId: { $in: [callerId, receiverId] },
    });
    if (memberCount < 2) throw new Error("Not a member or access denied", 403);

    if (ActiveCallsStore.isUserBusy(callerId)) {
        throw new Error("Caller already in call", 409);
    }

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

    return Call.create({
        clientCallId,
        conversationId,
        callerId,
        receiverId,
        type,
        status: "ringing",
    });
}

// Single entry point for every state change after a call starts ringing.
export async function transitionCall({ callId, userId, action }) {
    const def = TRANSITIONS[action];
    const call = await Call.findOne({ _id: callId, status: def.from });
    if (!call) return null;

    assertActor(call, userId, def.actor);

    call.status = def.to;
    if (def.to === "connected") {
        call.startedAt = new Date();
    } else {
        call.endedAt = new Date();
    }
    await call.save();

    ActiveCallsStore.clearRingTimeout(callId);
    if (def.to !== "connected") ActiveCallsStore.releaseCall(callId);

    return call;
}

// Used on disconnect cleanup, where we don't know if the active call was
export async function endActiveCall({ callId, userId }) {
    const call = await Call.findOne({ _id: callId });
    if (!call) return null;

    if (call.status === "connected") {
        return transitionCall({ callId, userId, action: "end" });
    }
    if (call.status === "ringing") {
        const action =
            String(call.callerId) === String(userId) ? "cancel" : "reject";
        return transitionCall({ callId, userId, action });
    }
    return null; // already resolved
}

function assertActor(call, userId, actor) {
    const id = String(userId);
    if (actor === "receiver" && String(call.receiverId) !== id)
        throw new Error("Not the receiver", 403);
    if (actor === "caller" && String(call.callerId) !== id)
        throw new Error("Not the caller", 403);
    if (
        actor === "participant" &&
        ![call.callerId, call.receiverId].map(String).includes(id)
    )
        throw new Error("Not a participant", 403);
}
