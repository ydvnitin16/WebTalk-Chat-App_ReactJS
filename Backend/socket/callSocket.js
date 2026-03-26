import {
    createCallService,
    updateCallStatus,
} from "../services/callService.js";

export const handleCallSocket = async (io, socket) => {
    try {
        socket.on("outgoing-call", async ({ to, offer, callObj }) => {
            const callerId = socket.user.id;

            // Create Call in DB
            // const call = await createCallService({
            //     caller: callerId,
            //     receiver: to,
            //     type: "video",
            // });

            // Send offer to receiver
            io.to(to).emit("incoming-call", {
                offer,
                from: callerId,
                callObj,
            });
        });

        socket.on("call-status", ({ to, status }) => {
            io.to(to).emit("call-status", { status });
        });

        socket.on("reject-call", ({ to }) => {
            io.to(to).emit("reject-call");
        });

        socket.on("call-accepted", async ({ to, answer }) => {
            const callerId = socket.user.id;
            // update call as answered
            // await updateCallStatus(callId, {
            //     status: "connected",
            //     startedAt: new Date(),
            // });
            console.log("call accepted!!");
            io.to(to).emit("call-accepted", { from: callerId, answer });
        });

        socket.on("ice-candidate", ({ to, candidate }) => {
            // console.log("Ice Candidate", candidate);
            io.to(to).emit("ice-candidate", { candidate });
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
