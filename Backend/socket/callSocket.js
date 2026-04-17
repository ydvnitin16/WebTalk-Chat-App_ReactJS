import {
    setActiveCall,
    getActiveCall,
    clearActiveCall,
} from "../server.js";
import {
    createCallService,
    getCallById,
    updateCallStatus,
    updateCallStatusIfNeeded,
} from "../services/callService.js";

export const handleCallSocket = async (io, socket) => {
    const callerId = socket.user.id;

    // outgoing-call
    socket.on("outgoing-call", async ({ to, offer, callObj }) => {
        const call = await createCallService({
            caller: callerId,
            receiver: to,
            type: callObj.type,
        });

        const callId = call._id.toString();

        // Store by userId
        setActiveCall(callerId, { callId, peerId: to, role: "caller" });
        setActiveCall(to, { callId, peerId: callerId, role: "receiver" });

        io.to(callerId).emit("sync-call-id", {
            callId: call._id,
            tempId: callObj?.tempId,
        });

        io.to(to).emit("incoming-call", { offer, from: callerId, call });
    });

    // call-accepted
    socket.on("call-accepted", async ({ to, answer, callId }) => {
        await updateCallStatus(callId, {
            status: "connected",
            startedAt: new Date(),
        });

        // Confirm both sides are tracked
        setActiveCall(callerId, { callId, peerId: to, role: "receiver" });
        setActiveCall(to, { callId, peerId: callerId, role: "caller" });

        io.to(to).emit("call-accepted", { from: callerId, answer, callId });
    });

    // reject-call
    socket.on("reject-call", async ({ to, callId }) => {
        await updateCallStatus(callId, {
            status: "rejected",
            endedAt: new Date(),
        });

        clearActiveCall(callerId);
        clearActiveCall(to);

        io.to(to).emit("reject-call");
    });

    // end-active-call
    socket.on("end-active-call", async ({ to, callId }) => {
        await updateCallStatusIfNeeded(
            callId,
            { status: "completed", endedAt: new Date() },
            ["connected"],
        );

        clearActiveCall(callerId);
        clearActiveCall(to);

        io.to(to).emit("end-active-call");
    });

    // cancel-call
    socket.on("cancel-call", async ({ to, callId }) => {
        await updateCallStatusIfNeeded(
            callId,
            { status: "cancelled", endedAt: new Date() },
            ["missed", "cancelled", "rejected"],
        );

        clearActiveCall(callerId);
        clearActiveCall(to);

        io.to(to).emit("cancel-call");
    });

    //  disconnect
    socket.on("disconnect", async () => {
        const activeCall = getActiveCall(callerId);
        if (!activeCall) return;

        const { callId, peerId } = activeCall;
        const call = await getCallById(callId);
        if (!call) {
            clearActiveCall(callerId);
            return;
        }

        if (call.status === "connected") {
            await updateCallStatusIfNeeded(
                callId,
                { status: "completed", endedAt: new Date() },
                ["connected"],
            );
            io.to(peerId).emit("end-active-call");
        } else {
            await updateCallStatusIfNeeded(
                callId,
                { status: "cancelled", endedAt: new Date() },
                ["missed", "cancelled", "rejected"],
            );
            io.to(peerId).emit("cancel-call");
        }

        clearActiveCall(callerId);
        clearActiveCall(peerId);
    });

    socket.on("call-status", async ({ to, status }) => {
        io.to(to).emit("call-status", { status });
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
        io.to(to).emit("ice-candidate", { candidate });
    });
};
