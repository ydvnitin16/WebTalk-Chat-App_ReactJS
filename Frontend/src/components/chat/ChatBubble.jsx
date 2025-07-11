import React from 'react';

const ChatBubble = ({ user, sender, type, content }) => {
    const isMine = sender === 'me';
    const baseStyles =
        'rounded-xl text-sm max-w-sm text-pretty p-3 break-words ' +
        (isMine
            ? 'bg-[#301e67] dark:bg-violet-600 text-white ml-auto'
            : 'bg-zinc-200 dark:text-black text-left');

    return (
        <div className={`flex ${isMine ? 'justify-end' : 'items-start gap-3'}`}>
            {!isMine && (
                <img
                    src={user.img}
                    className="w-8 h-8 rounded-full"
                    alt="avatar"
                />
            )}
            {type === 'image' ? (
                <img
                    src={user.img} // (this should be an actual media URL later)
                    className="w-60 rounded-lg"
                    alt="chat-img"
                />
            ) : (
                <div className={baseStyles}>{content}</div>
            )}
        </div>
    );
};

export default ChatBubble;
