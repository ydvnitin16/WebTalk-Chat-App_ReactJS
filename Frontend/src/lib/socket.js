import { io } from "socket.io-client";

let _socket;

export function getSocket() {
    if (!_socket) {
        _socket = io(`${import.meta.env.VITE_SERVER_URL}`, {
            withCredentials: true,
        });
    }
    return _socket;
}

export const socket = getSocket();
