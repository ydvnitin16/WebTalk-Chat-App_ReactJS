import cookie from "cookie";
import jwt from "jsonwebtoken";

import PresenceHandler from "./presenceHandler.js";
import MessageHandler from "./messageHandler.js";
import * as UserService from "../services/users.services.js";
import * as ConversationService from "../services/conversations.services.js";
import * as MessageService from "../services/messages.services.js";

export async function ioServerAuth(socket, next) {
    const rawCookie = socket.handshake.headers.cookie;

    if (!rawCookie) {
        return next(new Error("No Cookie Found!"));
    }
    const parsed = cookie.parse(rawCookie);
    const authHeader = parsed.authHeader;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new Error("No authHeader cookie"));
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        socket.user = decoded;
        next();
    } catch (error) {
        console.log("JWT Verify Error:", error.message);
        next(new Error("Unauthorized"));
    }
}

export default function initSocket(io) {
    io.on("connection", async (socket) => {
        const presence = new PresenceHandler(
            io,
            socket,
            UserService,
            ConversationService,
        );
        const message = new MessageHandler(io, socket, MessageService);
        await presence.register();
        message.register();

        // Connect when user connects
        await presence.onConnect();

        // Disconnnect - Offline sync, if client miss offline event
        socket.on("disconnect", async () => {
            await presence.onDisconnect();
        });
    });
}
