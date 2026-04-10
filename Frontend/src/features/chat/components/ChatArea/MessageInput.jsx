import React, { useEffect, useRef } from "react";
import { Paperclip, SendHorizonal } from "lucide-react";
import useSendMessages from "../../hooks/useSendMessages.js";
import useTyping from "../../hooks/useTyping.js";
import useChatStore from "@/stores/useChatStore.js";
import useDraft from "../../hooks/useDraft.js";
import useAuthStore from "@/stores/useAuthStore.js";

const MessageInput = () => {
    const { message, setMessage, sendMessage } = useSendMessages();
    const { selectedUserId, conversations } = useChatStore();
    const { handleTyping } = useTyping(selectedUserId);
    const { currentUser } = useAuthStore();
    const conversation = conversations.find(
        (c) =>
            c.participants.includes(currentUser.id) &&
            c.participants.includes(selectedUserId),
    );

    const conversationId = conversation?._id;
    const { handleDraftChange, clearCurrentDraft } = useDraft({
        conversationId,
        setMessage,
    });

    const inputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() !== "") {
            sendMessage();
            clearCurrentDraft();
            if (inputRef.current) inputRef.current.focus();
        }
    };

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    return (
        <form
            onSubmit={handleSubmit}
            className='fixed bottom-5 left-0 right-0 px-3 md:px-6 md:static dark:md:bg-zinc-950 z-10'
        >
            <div className=' flex items-center gap-3 backdrop-blur-[2px] bg-white/20 dark:bg-zinc-900/20  md:bg-zinc-100 md:dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full px-3 py-2 shadow-md '>
                {/* Input */}
                <input
                    ref={inputRef}
                    type='text'
                    value={message}
                    onChange={(e) => {
                        handleDraftChange(e.target.value);
                        setMessage(e.target.value);
                        handleTyping();
                    }}
                    placeholder='Type your message...'
                    className=' flex-1 outline-none text-sm md:text-base text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400 px-2'
                />
                <Paperclip
                    className={`${message.trim() ? "translate-x-0" : " translate-x-13"} transition-all duration-200 text-dark dark:text-white text-zinc-600 cursor-pointer rotate-180`}
                />
                {/* Send Button */}
                {
                    <button
                        type='submit'
                        className={` ${message.trim() ? "translate-x-0 opacity-100" : " translate-x-50 opacity-0"} transition-all duration-300 flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700  cursor-pointer`}
                    >
                        <SendHorizonal className='text-white' size={18} />
                    </button>
                }
            </div>
        </form>
    );
};

export default MessageInput;
