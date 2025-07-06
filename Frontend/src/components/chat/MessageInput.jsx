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
            className="fixed bottom-0 w-full md:static md:bg-zinc-900 px-4 py-3 flex gap-3 rounded-br-4xl
                       bg-transparent z-10"
        >
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 h-10 md:h-12 border rounded-full px-4 py-1 text-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 text-white border-none"
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
