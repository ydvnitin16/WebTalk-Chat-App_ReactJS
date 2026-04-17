import { setActiveCall, getActiveCall, clearActiveCall } from "../server.js";
import {
    createCallService,
    getCallById,
    updateCallStatus,
    updateCallStatusIfNeeded,
} from "../services/callService.js";

// Updates call status with endedAt — used for all termination events
const endCallInDB = (callId, status, allowedStatuses = null) => {
    const payload = { status, endedAt: new Date() };
    return allowedStatuses
        ? updateCallStatusIfNeeded(callId, payload, allowedStatuses)
        : updateCallStatus(callId, payload);
};

// Emits "call-ended" and clears active call state for given user ids
const notifyAndClear = (io, userIds = []) => {
    userIds.forEach((id) => {
        io.to(id).emit("call-ended");
        clearActiveCall(id);
    });
};

export const handleCallSocket = (io, socket) => {
    const userId = socket.user.id;

    socket.on("outgoing-call", async ({ to, offer, callObj }) => {
        const call = await createCallService({
            caller: userId,
            receiver: to,
            type: callObj.type,
        });
        const callId = call._id.toString();

        setActiveCall(userId, { callId, peerId: to, role: "caller" });
        setActiveCall(to, { callId, peerId: userId, role: "receiver" });

        io.to(userId).emit("sync-call-id", {
            callId: call._id,
            tempId: callObj?.tempId,
        });
        io.to(to).emit("incoming-call", { offer, from: userId, call });
    });

    // "connected" has startedAt not endedAt — kept explicit intentionally
    socket.on("call-accepted", async ({ to, answer, callId }) => {
        await updateCallStatus(callId, {
            status: "connected",
            startedAt: new Date(),
        });

        setActiveCall(userId, { callId, peerId: to, role: "receiver" });
        setActiveCall(to, { callId, peerId: userId, role: "caller" });

        io.to(to).emit("call-accepted", { from: userId, answer, callId });
    });

    socket.on("call-status", ({ to, status }) => {
        io.to(to).emit("call-status", { status });
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
        io.to(to).emit("ice-candidate", { candidate });
    });

    socket.on("reject-call", async ({ to, callId }) => {
        await endCallInDB(callId, "rejected");
        notifyAndClear(io, [to, userId]);
    });

    socket.on("end-active-call", async ({ to, callId }) => {
        await endCallInDB(callId, "completed", ["connected"]);
        notifyAndClear(io, [to, userId]);
    });

    socket.on("cancel-call", async ({ to, callId }) => {
        await endCallInDB(callId, "cancelled", [
            "missed",
            "cancelled",
            "rejected",
        ]);
        notifyAndClear(io, [to, userId]);
    });

    socket.on("disconnect", async () => {
        const active = getActiveCall(userId);
        if (!active) return;

        const { callId, peerId } = active;
        const call = await getCallById(callId);

        if (!call) {
            clearActiveCall(userId);
            return;
        }

        const isConnected = call.status === "connected";

        await endCallInDB(
            callId,
            isConnected ? "completed" : "cancelled",
            isConnected ? ["connected"] : ["missed", "cancelled", "rejected"],
        );

        // Only notify peer — disconnected socket cannot receive events
        notifyAndClear(io, [peerId]);
        clearActiveCall(userId);
    });
};
