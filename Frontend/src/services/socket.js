import { socket } from '../App.jsx';
import { UseMessagesStore } from '../stores/UseMessagesStore.jsx';
import { UseAuthStore } from '../stores/UseAuthStore.jsx';
import { UseSelectedUserStore } from '../stores/UseSelectedUserStore.jsx';
    const setMessage = UseMessagesStore.getState().setMessage;
    const userStore = UseAuthStore.getState().userStore;
    const selectedUser = UseSelectedUserStore.getState().selectedUser;

export function sendMessage(message, room) {
    const sender = userStore.id;
    const receiver = room
    console.log(`Seding message...`, message, ': message & ', room, ': room.', sender, ': sender');
    setMessage({message, sender, receiver })
    socket.emit('message', { message, room });
}

export function receiveMessage(toast) {
    socket.on('message', (message, sender, receiver) => {
        setMessage({message, sender, receiver})
        if(!selectedUser){
            toast(`message: ${message}, sender: ${sender}, receiver: ${receiver}`);
        }

    });
}
