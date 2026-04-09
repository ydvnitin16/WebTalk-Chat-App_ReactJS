import {
    createCallService,
    getCallById,
    updateCallStatus,
    updateCallStatusIfNeeded,
} from "../services/callService.js";

export const handleCallSocket = async (io, socket) => {
    try {
        socket.data.pendingCallIds = socket.data.pendingCallIds || new Map();
        socket.data.activeCall = socket.data.activeCall || null;

        const rememberCallForSocket = ({ tempId, callId, peerId, role }) => {
            if (tempId && callId) {
                socket.data.pendingCallIds.set(tempId, callId.toString());
            }

            socket.data.activeCall = {
                callId: callId?.toString?.() || callId,
                peerId,
                role,
            };
        };

        const resolveCallId = ({ callId, tempId }) => {
            if (callId && !String(callId).startsWith("temp-")) {
                return callId;
            }

            if (tempId && socket.data.pendingCallIds.has(tempId)) {
                return socket.data.pendingCallIds.get(tempId);
            }

            if (callId && socket.data.pendingCallIds.has(callId)) {
                return socket.data.pendingCallIds.get(callId);
            }

            return socket.data.activeCall?.callId || null;
        };

        const clearCallTracking = (tempIdOrCallId) => {
            if (tempIdOrCallId) {
                socket.data.pendingCallIds.delete(tempIdOrCallId);
            }

            socket.data.activeCall = null;
        };

        const clearPeerCallTracking = async (peerId, callId) => {
            if (!peerId || !callId) return;

            const peerSockets = await io.in(peerId).fetchSockets();
            peerSockets.forEach((peerSocket) => {
                if (peerSocket.data.activeCall?.callId === String(callId)) {
                    peerSocket.data.activeCall = null;
                    peerSocket.data.pendingCallIds?.clear?.();
                }
            });
        };

        socket.on("outgoing-call", async ({ to, offer, callObj }) => {
            const callerId = socket.user.id;

            const call = await createCallService({
                caller: callerId,
                receiver: to,
                type: callObj.type,
            });

            rememberCallForSocket({
                tempId: callObj?.tempId,
                callId: call._id,
                peerId: to,
                role: "caller",
            });

            const receiverSockets = await io.in(to).fetchSockets();
            receiverSockets.forEach((receiverSocket) => {
                receiverSocket.data.pendingCallIds =
                    receiverSocket.data.pendingCallIds || new Map();
                receiverSocket.data.activeCall = {
                    callId: call._id.toString(),
                    peerId: callerId,
                    role: "receiver",
                };
            });

            io.to(callerId).emit("sync-call-id", {
                callId: call._id,
                tempId: callObj?.tempId,
            });

            io.to(to).emit("incoming-call", {
                offer,
                from: callerId,
                call,
            });
        });

        socket.on("call-status", async ({ to, status }) => {
            io.to(to).emit("call-status", { status });
        });

        socket.on("reject-call", async ({ to, callId, tempId }) => {
            const resolvedCallId = resolveCallId({ callId, tempId });

            await updateCallStatus(resolvedCallId, {
                status: "rejected",
                endedAt: new Date(),
            });

            clearCallTracking(tempId || callId);
            await clearPeerCallTracking(to, resolvedCallId);
            io.to(to).emit("reject-call");
        });

        socket.on("call-accepted", async ({ to, answer, callId, tempId }) => {
            const callerId = socket.user.id;
            const resolvedCallId = resolveCallId({ callId, tempId });

            await updateCallStatus(resolvedCallId, {
                status: "connected",
                startedAt: new Date(),
            });

            rememberCallForSocket({
                tempId: tempId || callId,
                callId: resolvedCallId,
                peerId: to,
                role: "receiver",
            });

            io.to(to).emit("call-accepted", {
                from: callerId,
                answer,
                callId: resolvedCallId,
            });
        });

        socket.on("ice-candidate", ({ to, candidate }) => {
            io.to(to).emit("ice-candidate", { candidate });
        });

        socket.on("end-active-call", async ({ to, callId, tempId }) => {
            const resolvedCallId = resolveCallId({ callId, tempId });

            await updateCallStatusIfNeeded(
                resolvedCallId,
                {
                    status: "completed",
                    endedAt: new Date(),
                },
                ["connected"],
            );

            clearCallTracking(tempId || callId);
            await clearPeerCallTracking(to, resolvedCallId);
            io.to(to).emit("end-active-call");
        });

        socket.on("cancel-call", async ({ to, callId, tempId }) => {
            const resolvedCallId = resolveCallId({ callId, tempId });

            await updateCallStatusIfNeeded(
                resolvedCallId,
                {
                    status: "cancelled",
                    endedAt: new Date(),
                },
                ["missed", "cancelled", "rejected"],
            );

            clearCallTracking(tempId || callId);
            await clearPeerCallTracking(to, resolvedCallId);
            io.to(to).emit("cancel-call");
        });

        socket.on("disconnect", async () => {
            const activeCallId = socket.data.activeCall?.callId;
            const peerId = socket.data.activeCall?.peerId;

            if (!activeCallId || !peerId) {
                return;
            }

            const activeCall = await getCallById(activeCallId);
            if (!activeCall) {
                socket.data.activeCall = null;
                socket.data.pendingCallIds.clear();
                return;
            }

            if (activeCall.status === "connected") {
                await updateCallStatusIfNeeded(
                    activeCallId,
                    {
                        status: "completed",
                        endedAt: new Date(),
                    },
                    ["connected"],
                );

                io.to(peerId).emit("end-active-call");
            } else {
                await updateCallStatusIfNeeded(
                    activeCallId,
                    {
                        status: "cancelled",
                        endedAt: new Date(),
                    },
                    ["missed", "cancelled", "rejected"],
                );

                io.to(peerId).emit("cancel-call");
            }

            socket.data.activeCall = null;
            socket.data.pendingCallIds.clear();
        });
    } catch (error) {
        console.log("Call socket error:", error.message);
    }
};
