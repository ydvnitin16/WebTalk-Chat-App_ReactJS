import express from "express";
import connectDB from "./configs/db.js";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import initSocket, { ioServerAuth } from "./socket/index.js";
import authRouter from "./routes/auth.routes.js";
import conversationsRouter from "./routes/conversations.routes.js";
import usersRouter from "./routes/users.routes.js";

const app = express();
dotenv.config();
connectDB();

// Socket Setup
const server = createServer(app);
export const io = new Server(server, {
    cors: {
        origin: `${process.env.ORIGIN}`,
        credentials: true,
    },
});

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: `${process.env.ORIGIN}`, credentials: true }));
io.use(ioServerAuth);

// Socket initialised
initSocket(io);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/conversations", conversationsRouter);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
