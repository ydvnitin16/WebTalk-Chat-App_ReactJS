import React, { useEffect, useMemo } from "react";
import ChatBubble from "./ChatBubble";
import TypingIndicator from "./TypingIndicator";
import {
  deriveMessageStatus,
  formatCallDuration,
  formatDateTime,
} from "@/utils/utils";
import useCallStore from "@/stores/useCallStore";
import CallBubble from "./CallBubble";
import useAutoScroll from "../hooks/useAutoScroll";
import { useMessages } from "../hooks/useMessages";
import useResendMessage from "../hooks/useResendMessage";
import { Loader } from "lucide-react";
import useMessageStore from "@/stores/useMessageStore";
import useUIStore from "@/stores/useUIStore";
import useActiveConversation from "../hooks/useActiveConversation";
import ConversationStart from "./ConversationStart";
import useMemberStore from "@/stores/useMemberStore";

const ChatList = () => {
  const { activeConversationId, users, currentUser, selectedUserId } =
    useActiveConversation();

  const { messages, isFetchingMore, hasMore } = useMessageStore();
  const { callHistory } = useCallStore();
  const { loadInitial, loadMore } = useMessages();
  const { resendMessage } = useResendMessage();
  const cursor = useMemberStore((s) => s.membersCursor[activeConversationId]);

  const { scrollDownRef, containerRef, captureScrollHeight } = useAutoScroll();

  const typingUsers = useUIStore((state) => state.typingUsers);

  useEffect(() => {
    if (
      !activeConversationId ||
      String(activeConversationId).startsWith("temp-")
    )
      return;

    loadInitial(activeConversationId);
  }, [activeConversationId, loadInitial]);

  const chatItems = useMemo(() => {
    return [
      ...messages.map((msg) => ({
        type: "message",
        createdAt: msg.createdAt,
        data: msg,
      })),
      ...callHistory.map((call) => ({
        type: "call",
        createdAt: call.createdAt,
        data: call,
      })),
    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [messages, callHistory]);

  if (!messages) {
    return <p>Start a chat</p>;
  }

  const handleScroll = async () => {
    const el = containerRef.current;
    if (el.scrollTop === 0) {
      captureScrollHeight();
      await loadMore();
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 flex flex-col p-3 space-y-1 overflow-y-auto overflow-x-hidden scroll-smooth py-20 md:pb-2 bg-[#FCFCFC] dark:text-white dark:bg-black"
    >
      <div className="mt-auto flex flex-col space-y-4 w-full">
        {!hasMore && <ConversationStart />}
        {isFetchingMore && (
          <p className="flex justify-center items-center ">
            <Loader />
          </p>
        )}

        {/* Chats appear here */}
        {chatItems.length > 0 &&
          chatItems.map((item, idx) => {
            const isFirst =
              item.data.senderId === chatItems[idx - 1]?.data?.senderId;
            const isLast =
              item.data.senderId === chatItems[idx + 1]?.data?.senderId;

            if (item.type === "message") {
              const status = deriveMessageStatus(item.data, cursor);
              return (
                <ChatBubble
                  key={item.data._id || item.data.tempId}
                  user={users[selectedUserId]}
                  isMine={item.data.senderId === currentUser.id}
                  content={item.data.content}
                  type={item.type}
                  time={item.data.createdAt}
                  status={status}
                  data={item.data}
                  resend={resendMessage}
                />
              );
            }
            if (item.type === "call") {
              return (
                <CallBubble
                  key={item.data._id}
                  isMine={item.data.callerId === currentUser.id}
                  user={users[selectedUserId]}
                  time={formatDateTime(
                    item.data?.endedAt || item.data?.createdAt,
                  )}
                  type={item.data.type}
                  status={item.data.status}
                  duration={formatCallDuration(
                    item.data?.startedAt,
                    item.data?.endedAt,
                  )}
                />
              );
            }
            return null;
          })}

        {typingUsers[selectedUserId] && (
          <TypingIndicator user={users[selectedUserId]} />
        )}
      </div>

      {/* Scroll anchor */}
      <div ref={scrollDownRef} />
    </div>
  );
};

export default ChatList;
