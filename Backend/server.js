import express from "express";
import connectDB from "./configs/db.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cookie from "cookie";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import {
    handleMessageSocket,
    handleUndeliveredMessages,
} from "./socket/messageSocket.js";
import { handleCallSocket } from "./socket/callSocket.js";
import { updateUserOnlineStatus } from "./services/userService.js";

const app = express();
dotenv.config();
connectDB();

// Socket Setup
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: `${process.env.ORIGIN}`,
        credentials: true,
    },
});

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: `${process.env.ORIGIN}`, credentials: true }));

io.use(async (socket, next) => {
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
});

// Store active calls
const activeCallsMap = new Map();
// key: userId, value: { callId, peerId, role }

export const setActiveCall = (userId, data) => activeCallsMap.set(userId, data);
export const getActiveCall = (userId) => activeCallsMap.get(userId);
export const clearActiveCall = (userId) => activeCallsMap.delete(userId);

// Socket Events
io.on("connect", async (socket) => {
    const userId = socket.user.id;

    // Join own room and update status
    socket.join(userId);
    updateUserOnlineStatus(userId, true);
    io.emit("user-online", userId);

    await handleUndeliveredMessages(io, socket);

    // Message Socket Handler
    handleMessageSocket(io, socket);

    // Call socket handler
    handleCallSocket(io, socket);

    // On Disconnect update status
    socket.on("disconnect", () => {
        io.emit("user-offline", userId);
        updateUserOnlineStatus(userId, false);
    });
});

// Routes

app.use("/", userRoutes);
app.use("/", messageRoutes);
app.use("/", conversationRoutes);
app.use("/", callRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
