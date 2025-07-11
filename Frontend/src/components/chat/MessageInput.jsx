import React, { useEffect, useRef } from 'react';
import { UseSelectedUserStore } from '../../stores/UseSelectedUserStore';
import { socket } from '../../App.jsx';

const MessageInput = ({ message, setMessage, onSend, room }) => {
    const selectedUser = UseSelectedUserStore((state) => state.selectedUser);
    const inputRef = useRef(null);
    let typingTimeOut = useRef(null);
    let isTyping = useRef(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() !== '') {
            onSend(message, room);
            setMessage('');
            if (inputRef.current) inputRef.current.focus();
        }
    };

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    const handleInputChange = async () => {
        if (!isTyping.current) {
            socket.emit('typing', selectedUser?.id);
            isTyping.current = true
        }

        if (typingTimeOut.current) clearTimeout(typingTimeOut.current);

        typingTimeOut.current = setTimeout(() => {
            socket.emit('stop-typing', selectedUser?.id);
            isTyping.current = false
        }, 1000);

    };

    return (
        <form
            onSubmit={handleSubmit}
            className="fixed bottom-0 w-full md:static md:bg-zinc-900 px-4 py-3 flex gap-3 rounded-br-4xl
                       bg-transparent z-10"
        >
            <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => {
                    setMessage(e.target.value);
                    handleInputChange();
                }}
                placeholder="Type your message..."
                className="flex-1 h-10 md:h-12 border rounded-full px-4 py-1 text-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 text-white border-none"
            />
            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm"
            >
                Send
            </button>
        </form>
    );
};

export default MessageInput;
