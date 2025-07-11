import express from 'express';
import connectDB from './configs/db.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js'
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cookie from 'cookie';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { updateStatus } from './controllers/socket.js';
import { storeMessageDB } from './controllers/messageContoller.js';

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
app.use(cookieParser())
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
    console.log(`🟢 `, socket.user.name, 'Connected');
    updateStatus(socket.user.id, 'online');

    io.emit('online', socket.user.id);
    socket.join(socket.user.id);

    socket.on('message', ({ content, room }) => {
        console.log(content, socket.user.name, room);
        console.log(`Socket Id: `, socket.id);
        io.to(room).emit('message', content, socket.user.id, room);
        storeMessageDB(socket.user.id, room, content)
    });

    socket.on('typing', (to) => {
        const userId = socket.user.id;
        io.to(to).emit('typing', userId)
        console.log(socket.user.name, 'Is Typing To: ', to)
    });

    socket.on('stop-typing', (to) => {
        const userId = socket.user.id;
        io.to(to).emit('stop-typing', userId)
        console.log(socket.user.name, 'Stopped Typing To: ', to)
    })

    socket.on('disconnect', () => {
        console.log(`User disconnected`);
        io.emit('offline', socket.user.id);
        updateStatus(socket.user.id, 'offline');
    });
});

// Routes
app.use('/', userRoutes);
app.use('/messages', messageRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
