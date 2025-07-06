import { socket } from '../App.jsx';

export function sendMessage(message, room) {
    console.log(`Seding message...`, message, ': message & ', room, ': room.');
    socket.emit('message', { message, room });
}

export function receiveMessage(toast) {
    socket.on('message', (message) => {
        toast(message);
    });
}
