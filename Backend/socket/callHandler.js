import * as ActiveCallsStore from "../cache/activeCallsStore.js";

class CallSocketHandler {
    constructor(io, socket, callService) {
        this.io = io;
        this.socket = socket;
        this.callService = callService;
        this.activeCalls = ActiveCallsStore;
    }

    register() {
        this.socket.on("call:initiate", this.onInitiate.bind(this));
        this.socket.on("call:accept", this.onAccept.bind(this));
        this.socket.on("call:reject", this.onReject.bind(this));
        this.socket.on("call:end", this.onEnd.bind(this));

        // Pure relay, No DB interaction needed - direct peer's room
        this.socket.on("call:status", this.relay.bind(this, "call:status"));
        this.socket.on(
            "call:ice-candidate",
            this.relay.bind(this, "call:ice-candidate"),
        );
    }
    
    async cleanupActiveCall() {
        const callId = this.activeCalls.getActiveCallId(this.socket.user.id);
        if (!callId) return;

        try {
            const userId = this.socket.user?.id ?? this.socket.userId;
            const call = await this.callService.endCall({
                callId,
                userId,
            });

            const otherUserId =
                String(call.callerId) === String(userId)
                    ? String(call.receiverId)
                    : String(call.callerId);

            this.io.to(`user:${otherUserId}`).emit("call:ended", {
                callId,
            });
        } catch (err) {
            console.error("Active call cleanup failed:", err.message);
        }
    }

    async onInitiate(
        { clientCallId, conversationId, receiverId, type, offer },
        ack,
    ) {
        const callerId = this.socket.user?.id ?? this.socket.userId;
        try {
            const call = await this.callService.initiateCall({
                clientCallId,
                callerId,
                conversationId,
                receiverId,
                type,
            });
            
            ack?.({
                ok: true,
                callId: call._id,
                clientCallId,
                status: call.status,
            });

            if (call.status === "busy") {
                this.socket.emit("call:busy", {
                    callId: call._id,
                    clientCallId,
                });
                return;
            }

            this.activeCalls.lockUsersForCall({
                callId: call._id,
                callerId,
                receiverId,
                onMissedTimeout: (callId) => this.handleMissedTimeout(callId),
            });

            this.io.to(`user:${String(receiverId)}`).emit("call:incoming", {
                callId: call._id,
                conversationId,
                callerId,
                type,
                offer,
            });
        } catch (err) {
            ack?.({ ok: false, error: err.message });
        }
    }

    async onAccept({ callId, answer }, ack) {
        const receiverId = this.socket.user?.id ?? this.socket.userId;

        try {
            const call = await this.callService.handleAccept({
                callId,
                receiverId,
            });
            ack?.({ ok: true });
            const callerRoomId = String(call.callerId);
            this.io.to(`user:${callerRoomId}`).emit("call:accepted", {
                callId,
                answer,
            });
        } catch (err) {
            ack?.({ ok: false, error: err.message });
        }
    }

    async onReject({ callId }, ack) {
        const receiverId = this.socket.user?.id ?? this.socket.userId;

        try {
            const call = await this.callService.handleReject({
                callId,
                receiverId,
            });
            ack?.({ ok: true });
            if (call) {
                const callerRoomId = String(call.callerId);
                const receiverRoomId = String(call.receiverId);
                this.io.to(`user:${callerRoomId}`).emit("call:rejected", {
                    callId,
                });
                this.io.to(`user:${receiverRoomId}`).emit("call:rejected", {
                    callId,
                });
            }
        } catch (err) {
            ack?.({ ok: false, error: err.message });
        }
    }

    async onEnd({ callId }, ack) {
        const userId = this.socket.user?.id ?? this.socket.userId;

        try {
            const call = await this.callService.endCall({
                callId,
                userId,
            });
            
            ack?.({ ok: true });
            const otherUserId =
                String(call.callerId) === String(userId)
                    ? String(call.receiverId)
                    : String(call.callerId);
            this.io.to(`user:${String(otherUserId)}`).emit("call:ended", {
                callId,
            });
        } catch (err) {
            ack?.({ ok: false, error: err.message });
        }
    }

    async handleMissedTimeout(callId) {
        const call = await this.callService.handleMissedTimeout(callId);
        if (!call) return; // already accepted/rejected right as the timer fired
        this.io.to(`user:${String(call.callerId)}`).emit("call:missed", { callId });
        this.io.to(`user:${String(call.receiverId)}`).emit("call:missed", { callId });
    }

    relay(event, payload) {
        const fromUserId = this.socket.user?.id ?? this.socket.userId;
        this.io.to(`user:${String(payload.toUserId)}`).emit(event, {
            ...payload,
            fromUserId,
        });
    }
}

export default CallSocketHandler;
