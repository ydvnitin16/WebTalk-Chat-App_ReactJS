import * as ActiveCallsStore from "../cache/activeCallsStore.js";

const NOTIFY_EVENT = {
    rejected: "call:rejected",
    cancelled: "call:cancelled",
    missed: "call:missed",
    completed: "call:ended",
};

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
        this.socket.on("call:reject", this.onAction.bind(this, "reject"));
        this.socket.on("call:cancel", this.onAction.bind(this, "cancel"));
        this.socket.on("call:end", this.onAction.bind(this, "end"));

        // Pure relay, No DB interaction needed - direct peer's room
        this.socket.on("call:status", this.relay.bind(this, "call:status"));
        this.socket.on(
            "call:ice-candidate",
            this.relay.bind(this, "call:ice-candidate"),
        );
    }

    userId() {
        return this.socket.user?.id ?? this.socket.userId;
    }

    async cleanupActiveCall() {
        const callId = this.activeCalls.getActiveCallId(this.userId());
        if (!callId) return;

        try {
            const call = await this.callService.endActiveCall({
                callId,
                userId: this.userId(),
            });
            if (!call) return;
            this.notifyBoth(call, NOTIFY_EVENT[call.status] ?? "call:ended");
        } catch (err) {
            console.error("Active call cleanup failed:", err.message);
        }
    }

    async onInitiate(
        { clientCallId, conversationId, receiverId, type, offer },
        ack,
    ) {
        const callerId = this.userId();
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

            if (call.status === "busy") return; // ack already told the caller

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
        try {
            const call = await this.callService.transitionCall({
                callId,
                userId: this.userId(),
                action: "accept",
            });
            ack?.({ ok: true });
            if (!call) return; // caller cancelled, or call already timed out
            this.io.to(`user:${String(call.callerId)}`).emit("call:accepted", {
                callId,
                answer,
            });
        } catch (err) {
            ack?.({ ok: false, error: err.message });
        }
    }

    // Handles reject / cancel / end
    async onAction(action, { callId }, ack) {
        try {
            const call = await this.callService.transitionCall({
                callId,
                userId: this.userId(),
                action,
            });
            ack?.({ ok: true });
            if (!call) return;
            this.notifyBoth(call, NOTIFY_EVENT[call.status]);
        } catch (err) {
            ack?.({ ok: false, error: err.message });
        }
    }

    async handleMissedTimeout(callId) {
        const call = await this.callService.transitionCall({
            callId,
            userId: null,
            action: "timeout",
        });
        if (!call) return; // already accepted/rejected right as the timer fired
        this.notifyBoth(call, "call:missed");
    }

    notifyBoth(call, event) {
        this.io
            .to(`user:${String(call.callerId)}`)
            .emit(event, { callId: call._id });
        this.io
            .to(`user:${String(call.receiverId)}`)
            .emit(event, { callId: call._id });
    }

    relay(event, payload) {
        this.io.to(`user:${String(payload.toUserId)}`).emit(event, {
            ...payload,
            fromUserId: this.userId(),
        });
    }
}

export default CallSocketHandler;
