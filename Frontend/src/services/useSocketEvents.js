import { socket } from '../App.jsx';
import { UseMessagesStore } from '../stores/UseMessagesStore.jsx';
import { UseAuthStore } from '../stores/UseAuthStore.jsx';
import { UseSelectedUserStore } from '../stores/UseSelectedUserStore.jsx';
import { UseContactStore } from '../stores/UseContactStore.jsx';
import { useEffect } from 'react';

export const useSocketEvents = (toast) => {
    const setMessage = UseMessagesStore((state) => state.setMessage);
    const selectedUser = UseSelectedUserStore((state) => state.selectedUser);
    const updateSelectedUser = UseSelectedUserStore(
        (state) => state.updateSelectedUser
    );
    const setStatus = UseContactStore((state) => state.setStatus);

    useEffect(() => {
        // set online user in fetched contact && selected user for opened chat
        socket.on('online', (id) => {
            setStatus(id, 'online');
            updateSelectedUser('online');
        });

        // set offline user in fetched contact && selected user for opened chat
        socket.on('offline', (id) => {
            setStatus(id, 'offline');
            updateSelectedUser('offline');
        });

        socket.on('message', (message, sender, receiver) => {
            setMessage({ message, sender, receiver });
            if (!selectedUser) {
                toast(`message: ${message}`);
            }
        });

        return () => {
            socket.off('message');
            socket.off('online');
            socket.off('offline');
        };
    }, [setMessage, setMessage]);
};

const setMessage = UseMessagesStore.getState().setMessage;
const userStore = UseAuthStore.getState().userStore;

export function sendMessage(message, room) {
    const sender = userStore.id;
    const receiver = room;
    console.log(
        `Seding message...`,
        message,
        ': message & ',
        room,
        ': room.',
        sender,
        ': sender'
    );
    setMessage({ message, sender, receiver });
    socket.emit('message', { message, room });
}
