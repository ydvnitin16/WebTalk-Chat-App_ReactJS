import { io } from "socket.io-client";

let _socket;

export function getSocket() {
    if (!_socket) {
        _socket = io(`${import.meta.env.VITE_SERVER_URL}`, {
            withCredentials: true,
            autoConnect: false,
        });
    }
    return _socket;
}

export function connectSocket() {
    const socket = getSocket();

    if (!socket.connected) {
        socket.connect();
    }

    return socket;
}

export function disconnectSocket() {
    const socket = getSocket();

    if (socket.connected) {
        socket.disconnect();
    }
}

export const socket = getSocket();
