import { socket } from '../App.jsx';
import { UseMessagesStore } from '../stores/UseMessagesStore.jsx';
import { UseAuthStore } from '../stores/UseAuthStore.jsx';
import { UseSelectedUserStore } from '../stores/UseSelectedUserStore.jsx';
import { UseContactStore } from '../stores/UseContactStore.jsx';
import { useEffect } from 'react';
import { UseTypingStore } from '../stores/UsetypingStore.jsx';

export const useSocketEvents = (toast) => {
    const setMessage = UseMessagesStore((state) => state.setMessage);
    const selectedUser = UseSelectedUserStore((state) => state.selectedUser);
    const updateSelectedUser = UseSelectedUserStore(
        (state) => state.updateSelectedUser
    );
    const setStatus = UseContactStore((state) => state.setStatus);
    const setTypingStatus = UseTypingStore(state => state.setTypingStatus);
    const clearTypingStatus = UseTypingStore(state => state.clearTypingStatus);
    const typingStatus = UseTypingStore(state => state.typingStatus)

    useEffect(() => {
        // set online user in fetched contact && selected user for opened chat
        socket.on('online', (id) => {
            setStatus(id, 'online');
            updateSelectedUser('online', id);
        });

        // set offline user in fetched contact && selected user for opened chat
        socket.on('offline', (id) => {
            setStatus(id, 'offline');
            updateSelectedUser('offline', id);
        });

        socket.on('message', (message, sender, receiver) => {
            setMessage({ message, sender, receiver });
            if (!selectedUser) {
                toast(`message: ${message}`);
            }
        });

        socket.on('typing', (userId) => {
            setTypingStatus(userId, true);
            console.log(userId, `Is typing`)
        });

        socket.on('stop-typing', (userId) => {
            clearTypingStatus(userId);
            console.log(userId, `Stopped typing`)
        })

        return () => {
            socket.off('message');
            socket.off('online');
            socket.off('offline');
            socket.off('typing');
            socket.off('stop-typing');
        };
    }, [setMessage, setMessage]);
};

const setMessage = UseMessagesStore.getState().setMessage;
const userStore = UseAuthStore.getState().userStore;

export function sendMessage(message, room) {
    const sender = userStore?.id;
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
