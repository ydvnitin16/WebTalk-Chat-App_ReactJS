class PresenceHandler {
    constructor(io, socket, userService, conversationService) {
        this.io = io;
        this.socket = socket;
        this.userService = userService;
        this.conversationService = conversationService;
        this.userId = socket.user.id;
    }

    register() {
        this.socket.on("user:online", this.onConnect.bind(this));
        this.socket.on("user:offline", this.onDisconnect.bind(this));
    }

    async onConnect() {
        await this.socket.join(`user:${this.userId}`);
        await this.userService.setOnline(this.userId);

        // Emit only to conversations with
        const contactsIds =
            await this.conversationService.getConversationMembersIds(
                this.userId,
            );

        contactsIds.forEach((id) => {
            this.io
                .to(`user:${id}`)
                .emit("user:online", { userId: this.userId });
        });
    }

    async onDisconnect() {
        await this.userService.setOffline(this.userId);

        const contactIds =
            await this.conversationService.getConversationMembersIds(
                this.userId,
            );
        contactIds.forEach((id) => {
            this.io
                .to(`user:${id}`)
                .emit("user:offline", { userId: this.userId });
        });
        this.io.to(`user:${this.userId}`).emit("user:offline", {
            userId: this.userId,
        });
    }
}

export default PresenceHandler;
