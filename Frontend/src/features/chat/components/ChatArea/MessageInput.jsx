import React, { useEffect, useRef } from "react";
import { SendHorizonal } from "lucide-react";
import useSendMessages from "../../hooks/useSendMessages.js";
import useTyping from "../../hooks/useTyping.js";
import { useChatStore } from "@/stores/useChatStore.js";

const MessageInput = () => {
    const { message, setMessage, sendMessage } = useSendMessages();
    const { selectedUser } = useChatStore();
    const { handleTyping } = useTyping(selectedUser._id);

    const inputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() !== "") {
            sendMessage();
            if (inputRef.current) inputRef.current.focus();
        }
    };

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    return (
        <form
            onSubmit={handleSubmit}
            className='fixed bottom-5 left-0 right-0 px-3 md:px-6 md:static md:bg-transparent z-10'
        >
            <div className=' flex items-center gap-3  bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full px-3 py-2 shadow-md '>
                {/* Input */}
                <input
                    ref={inputRef}
                    type='text'
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping();
                    }}
                    placeholder='Type your message...'
                    className=' flex-1 bg-transparent  outline-none text-sm md:text-base text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 px-2'
                />

                {/* Send Button */}
                <button
                    type='submit'
                    className='flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 transition cursor-pointer'
                >
                    <SendHorizonal className='text-white' size={18} />
                </button>
            </div>
        </form>
    );
};

export default MessageInput;
