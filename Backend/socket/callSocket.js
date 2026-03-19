import { createCallService, updateCallStatus } from "../services/callService.js";

export const handleCallSocket = async (io, socket) => {
    try {
        socket.on("offer", async ({ to, offer }) => {
            const callerId = socket.user.id;

            console.log("Offer", offer, "caller:", callerId, "callie", to);

            // Create Call in DB
            const call = await createCallService({
                caller: callerId,
                receiver: to,
                type: "video",
            });

            // Send offer to receiver
            io.to(to).emit("offer", {
                offer,
                caller: callerId,
                callId: call._id,
            });
        });

        socket.on("answer", async ({ caller, answer, callId }) => {
            // update call as answered
            await updateCallStatus(callId, {
                status: "connected",
                startedAt: new Date(),
            });

            console.log("Answer", answer, ":Answer");
            io.to(caller).emit("answer", answer);
        });

        socket.on("ice-candidate", (data) => {
            console.log("Ice Candidate", data.candidate);
            io.to(data.room).emit("ice-candidate", data.candidate);
        });

        // rejected
        socket.on("reject", async ({ caller, callId }) => {
            await updateCallStatus(callId, {
                status: "rejected",
            });

            io.to(caller).emit("reject");
        });

        // Call ended
        socket.on("end-call", async ({ to, callId }) => {
            await updateCallStatus(callId, {
                status: "ended",
                endedAt: new Date(),
            });

            io.to(to).emit("end-call");
        });
    } catch (error) {}
};
