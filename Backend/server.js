import express from 'express';
import connectDB from './configs/db.js';
import userRoutes from './routes/userRoutes.js';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

const app = express();
dotenv.config();
connectDB();

// Socket Setup
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: `http://${process.env.ORIGIN}:5173`,
        credentials: true,
    },
});

// Middlewares
app.use(express.json());
app.use(
    cors({ origin: `http://${process.env.ORIGIN}:5173`, credentials: true })
);
io.use(async (socket, next) => {
    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) {
        return next(new Error('No Cookie Found!'));
    }

    const parsed = cookie.parse(rawCookie);
    const authHeader = parsed.authHeader;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new Error('No authHeader cookie'));
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        socket.user = decoded;
        next();
    } catch (error) {
        console.log('JWT Verify Error:', err.message);
        next(new Error('Unauthorized'));
    }
});

// Socket Events
io.on('connect', (socket) => {
    console.log(`🟢 New user connected`, socket.user.name);

    socket.on('join-room', () => {
        socket.join(socket.user.id);
    });

    socket.on('message', ({ message, room }) => {
        console.log(message);
        io.to(room).emit('message', message, socket.user.id, room);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected`);
    });

    return () => {
        socket.off('connect');
        socket.off('message');
        socket.off('disconnect');
    };
});

// Routes
app.use('/', userRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
