import React from 'react';

const MessageInput = ({ message, setMessage, onSend, room }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() !== '') {
            onSend(message, room);
            setMessage('');
        }
    };
    return (
        <form
            onSubmit={handleSubmit}
            className="p-4 flex gap-3 dark:bg-zinc-900"
        >
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-300"
            />
            <button
                type='submit'
                className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm"
            >
                Send
            </button>
        </form>
    );
};

export default MessageInput;
