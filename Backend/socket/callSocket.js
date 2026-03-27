import {
    createCallService,
    updateCallStatus,
} from "../services/callService.js";

export const handleCallSocket = async (io, socket) => {
    try {
        socket.on("outgoing-call", async ({ to, offer, callObj }) => {
            const callerId = socket.user.id;

            // Create Call in DB
            const call = await createCallService({
                caller: callerId,
                receiver: to,
                type: callObj.type,
            });

            io.to(callerId).emit("sync-call-id", { callId: call._id });

            // Send offer to receiver
            io.to(to).emit("incoming-call", {
                offer,
                from: callerId,
                call,
            });
        });

        socket.on("call-status", async ({ to, status }) => {
            io.to(to).emit("call-status", { status });
        });

        socket.on("reject-call", async ({ to, callId }) => {
            await updateCallStatus(callId, {
                status: "rejected",
            });
            io.to(to).emit("reject-call");
        });

        socket.on("call-accepted", async ({ to, answer, callId }) => {
            const callerId = socket.user.id;
            // update call as answered
            await updateCallStatus(callId, {
                status: "connected",
                startedAt: new Date(),
            });
            console.log("call accepted!!");
            // send callId because caller has temporaty call id so make the callId in sync
            io.to(to).emit("call-accepted", { from: callerId, answer, callId });
        });

        socket.on("ice-candidate", ({ to, candidate }) => {
            io.to(to).emit("ice-candidate", { candidate });
        });

        // Call ended
        socket.on("end-active-call", async ({ to, callId }) => {
            await updateCallStatus(callId, {
                status: "completed",
                endedAt: new Date(),
            });

            io.to(to).emit("end-active-call");
        });
    } catch (error) {}
};
