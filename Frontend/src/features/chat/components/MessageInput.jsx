import React, { useRef, useState } from "react";
import useSendMessages from "../hooks/useSendMessages.js";
import useTyping from "../hooks/useTyping.js";
import useDraft from "../hooks/useDraft.js";
import useActiveConversation from "../hooks/useActiveConversation.js";

const MessageInput = () => {
  const { activeConversationId, selectedUserId } =
    useActiveConversation();

  const { message, setMessage, sendMessage } = useSendMessages();

  const { handleTyping } = useTyping(selectedUserId);

  const conversationId = activeConversationId;

  const { handleDraftChange, clearCurrentDraft } = useDraft({
    conversationId,
    setMessage,
  });

  const inputRef = useRef(null);
  const [focus, setFocus] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== "") {
      sendMessage({ receiverId: selectedUserId });
      clearCurrentDraft();
      if (inputRef.current) inputRef.current.focus();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`fixed bottom-3 left-0 right-0 ${inputRef.current !== document.activeElement && !message.trim() ? "px-8" : "px-3"} md:px-6 md:static dark:md:bg-zinc-950 z-10 transition-all duration-400`}
    >
      <div className=" flex items-center gap-3 border-[0.8px] caret-[#D97757] rounded-full pl-1.5 pr-1 py-1 shadow-md md:dark:bg-[#1E1E1E] bg-white  dark:bg-[#1E1E1E] border-zinc-200 dark:border-[#414141] dark:text-white">
        {/* Input */}
        <textarea
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          ref={inputRef}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          rows={1}
          value={message}
          onChange={(e) => {
            handleDraftChange(e.target.value);
            setMessage(e.target.value);
            handleTyping();

            const el = e.target;
            el.style.height = "auto";
            el.style.height = Math.min(el.scrollHeight, 120) + "px"; // max height
          }}
          placeholder="Message"
          className="dark:border-zinc-700 dark:text-[#FFFFFF] flex-1 resize-none overflow-y-auto outline-none text-md md:text-base text-zinc-800 placeholder:text-zinc-400 pl-3 md:max-h-[120px] max-h-[80px]"
        />

        {/* Send Button */}
        <button
          type="submit"
          className={` transition-all duration-300 flex items-center justify-center w-10 h-10 rounded-full bg-[#007AFF] hover:bg-[#1E9CF1]/80  cursor-pointer `}
        >
          <div
            className="w-10 h-10 bg-white rotate-10"
            style={{
              WebkitMaskImage: "url('/sendx-icon-dark.png')",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              maskImage: "url('/sendx-icon-dark.png')",
              maskRepeat: "no-repeat",
              maskSize: "contain",
            }}
          />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
