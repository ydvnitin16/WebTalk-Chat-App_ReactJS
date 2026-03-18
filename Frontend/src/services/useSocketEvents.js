import { socket } from '../lib/socket.js';
import { UseMessagesStore } from '../stores/UseMessagesStore.jsx';
import { UseSelectedUserStore } from '../stores/UseSelectedUserStore.jsx';
import { UseContactStore } from '../stores/UseContactStore.jsx';
import { useEffect } from 'react';
import { UseTypingStore } from '../stores/UsetypingStore.jsx';
import { UseAuthStore } from '../stores/UseAuthStore.jsx';

export const useSocketEvents = (toast) => {
    const setMessage = UseMessagesStore((state) => state.setMessage);
    const updateSelectedUser = UseSelectedUserStore(
        (state) => state.updateSelectedUser
    );
    const setStatus = UseContactStore((state) => state.setStatus);
    const setTypingStatus = UseTypingStore(state => state.setTypingStatus);
    const clearTypingStatus = UseTypingStore(state => state.clearTypingStatus);

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

        socket.on('message', (content, sender, receiver) => {
            const createdAt = new Date()
            setMessage({ content, sender, receiver, createdAt });
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
    }, [setMessage, setStatus, updateSelectedUser, setTypingStatus, clearTypingStatus]);
};

const setMessage = UseMessagesStore.getState().setMessage;

export function sendMessage(content, room) {
    const sender = UseAuthStore.getState().userStore?.id;
    const receiver = room;
    console.log(
        `Seding message...`,
        content,
        ': message & ',
        room,
        ': room.',
        sender,
        ': sender'
    );
    const createdAt = new Date()
    setMessage({ content, sender, receiver, createdAt });
    socket.emit('message', { content, room });
}
