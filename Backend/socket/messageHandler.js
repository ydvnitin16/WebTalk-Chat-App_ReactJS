class MessageSocketHandler {
    constructor(io, socket, messageService) {
        this.io = io;
        this.socket = socket;
        this.messageService = messageService;
        this.userId = socket.user.id;
    }

    register() {
        this.socket.on("message:send", this.onSend.bind(this));
        this.socket.on("message:delivered", this.onDelivered.bind(this));
        this.socket.on("message:seen", this.onSeen.bind(this));
        this.socket.on("messages:seen", this.onConversationSeen.bind(this));
        this.socket.on("message:typing:start", this.onTypingStart.bind(this));
        this.socket.on("message:typing:stop", this.onTypingStop.bind(this));
    }

    shapeMessageForClient(message) {
        const doc = message?.toObject?.() ?? message;
        const updated = {
            ...doc,
            sender: doc.senderId,
            conversation: doc.conversationId,
        };
        delete updated.senderId;
        return updated;
    }

    async onSend({
        tempConversationId,
        conversationId,
        clientMessageId,
        content,
        type = "text",
        receiverId,
    }) {
        const messageClientId = clientMessageId;
        if (!clientMessageId || !content?.trim()) {
            this.socket.emit("message:send:failed", { clientMessageId });
            return;
        }

        const isTempConversation =
            !conversationId ||
            String(conversationId).startsWith("temp-") ||
            String(tempConversationId).startsWith("temp-");
        const convTempId = isTempConversation
            ? conversationId || tempConversationId
            : tempConversationId;

        try {
            const {
                message,
                conversation,
                deduped,
                isNewConversation,
                resolvedReceiverId,
            } = await this.messageService.sendMessageService({
                conversationId: isTempConversation ? null : conversationId,
                senderId: this.userId,
                receiverId: receiverId || null,
                content: content.trim(),
                type,
                clientMessageId,
            });

            const resolvedConversationId =
                conversation?._id ?? message.conversationId;
            const clientMessage = this.shapeMessageForClient(message);

            if (deduped) {

                this.socket.emit("message:send:ack", {
                    conversationId: resolvedConversationId,
                    messageId: message._id,
                    clientMessageId,
                    isNewConversation: false,
                });
                return;
            }

            if (resolvedReceiverId) {
                this.io.to(`user:${resolvedReceiverId}`).emit("message:new", {
                    isNewConversation,
                    conversationId: resolvedConversationId,
                    conversation: isNewConversation ? conversation : null,
                    message: clientMessage,
                    unreadCount: 1,
                    tempConversationId,
                });
            }
            
            this.io.to(`user:${this.userId}`).emit("message:new", {
                isNewConversation,
                conversationId: resolvedConversationId,
                conversation: isNewConversation ? conversation : null,
                message: clientMessage,
                clientMessageId,
                tempConversationId: convTempId,
            });
        } catch (err) {
            console.error("message:send failed:", err.message);
            this.socket.emit("message:send:failed", { clientMessageId });
        }
    }

    onTypingStart({ receiverId }) {
        this.socket.to(`user:${receiverId}`).emit("message:typing:start", {
            userId: this.userId,
        });
    }

    onTypingStop({ receiverId }) {
        this.socket.to(`user:${receiverId}`).emit("message:typing:stop", {
            userId: this.userId,
        });
    }

    async onConversationSeen({ conversationId }) {
        const result = await this.messageService.markConversationSeen({
            userId: this.userId,
            conversationId,
        });

        if (result) {
            this.io.to(`user:${result.notifyUser}`).emit("message:seen:ack", {
                conversationId: result.conversationId,
                userId: result.userId,
                messageId: result.messageId,
            });
        }
    }

    async onConversationDelivered() {
        const results = await this.messageService.markAllConversationsDelivered(
            {
                userId: this.userId,
            },
        );

        for (const result of results) {
            this.io
                .to(`user:${result.notifyUser}`)
                .emit("message:delivered:ack", {
                    conversationId: result.conversationId,
                    userId: result.userId,
                    messageId: result.messageId,
                });
        }
    }

    async onDelivered({ conversationId, userId, messageId }) {
        const result = await this.messageService.markDelivered({
            userId,
            conversationId,
            messageId,
        });

        if (result) {
            this.io
                .to(`user:${result.notifyUser}`)
                .emit("message:delivered:ack", {
                    conversationId: result.conversationId,
                    userId: result.userId,
                    messageId: result.messageId,
                });
        }
    }

    async onSeen({ conversationId, userId, messageId }) {
        const result = await this.messageService.markSeen({
            userId,
            conversationId,
            messageId,
        });

        if (result) {
            this.io.to(`user:${result.notifyUser}`).emit("message:seen:ack", {
                conversationId: result.conversationId,
                userId: result.userId,
                messageId: result.messageId,
            });
        }
    }
}

export default MessageSocketHandler;
