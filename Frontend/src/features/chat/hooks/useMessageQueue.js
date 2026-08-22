import { useCallback } from "react";
import { socket } from "@/lib/socket";
import useFailedMessagesStore from "@/stores/useFailedMessagesStore";
import useMessageQueueStore from "@/stores/useMessageQueueStore";
import useMessageStore from "@/stores/useMessageStore";

const MAX_ATTEMPTS = 3;
const ACK_TIMEOUT_MS = 8000;
const RETRY_BASE_DELAY_MS = 1000;

const emitWithAck = (payload, timeoutMs) =>
    new Promise((resolve) => {
        let settled = false;
        const timer = setTimeout(() => {
            if (!settled) {
                settled = true;
                resolve({ ok: false, reason: "timeout" });
            }
        }, timeoutMs);

        socket.emit("message:send", payload, (ack) => {
            if (!settled) {
                settled = true;
                clearTimeout(timer);
                resolve(ack);
            }
        });
    });

export const useMessageQueue = () => {
    const { markFailed, markSending, markQueued, confirmMessage } =
        useMessageStore();

    const processNext = useCallback(
        async (conversationId) => {
            const store = useMessageQueueStore.getState();
            if (store.isSending(conversationId)) return;

            const next = store.peekNext(conversationId);
            if (!next) return;

            if (!socket.connected) {
                markQueued(next.clientMessageId);
                return;
            }

            store.setSending(conversationId, true);
            markSending(next.clientMessageId);

            const ack = await emitWithAck(next.payload, ACK_TIMEOUT_MS);

            if (!ack?.ok && !socket.connected) {
                store.setSending(conversationId, false);
                markQueued(next.clientMessageId);
                return;
            }

            if (ack?.ok) {
                confirmMessage({
                    clientMessageId: next.clientMessageId,
                    messageId: ack.messageId,
                });
                useFailedMessagesStore
                    .getState()
                    .removeFailed(conversationId, next.clientMessageId);
                store.dequeue(conversationId, next.clientMessageId);
                store.setSending(conversationId, false);
                processNext(conversationId);
                return;
            }

            store.incrementAttempts(next.clientMessageId);
            store.setSending(conversationId, false);

            const attempts =
                useMessageQueueStore.getState().items[next.clientMessageId]
                    ?.attempts ?? 0;

            if (attempts >= MAX_ATTEMPTS) {
                markFailed(next.clientMessageId);
                useFailedMessagesStore
                    .getState()
                    .addFailed(
                        conversationId,
                        next.clientMessageId,
                        next.payload,
                    );
                store.dequeue(conversationId, next.clientMessageId);
                processNext(conversationId);
                return;
            }

            const delay = RETRY_BASE_DELAY_MS * 2 ** (attempts - 1);
            setTimeout(() => processNext(conversationId), delay);
        },
        [confirmMessage, markFailed, markQueued, markSending],
    );

    const enqueueMessage = useCallback(
        (conversationId, clientMessageId, payload) => {
            useMessageQueueStore
                .getState()
                .enqueue(conversationId, clientMessageId, payload);
            processNext(conversationId);
        },
        [processNext],
    );

    const resumeAllQueues = useCallback(() => {
        useMessageQueueStore
            .getState()
            .allConversationIds()
            .forEach(processNext);
    }, [processNext]);

    return { enqueueMessage, resumeAllQueues };
};
