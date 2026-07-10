import { useEffect, useState } from "react";
import useConversationStore from "@/stores/useConversationStore";
import useMemberStore from "@/stores/useMemberStore";
import { fetchConversations } from "../services/conversation.api";

export const useConversations = () => {
  const { setConversations } = useConversationStore();
  const { setUsers, setCursors } = useMemberStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setIsLoading(true);

        const data = await fetchConversations();
        if (!data.success) {
          throw new Error(data.message || "Something went wrong");
        }

        function normalizeConversations(list) {
          const conversations = [];
          const users = {};
          const cursors = {};

          for (const item of list) {
            const conversation = {
              _id: item.conversationId,
              otherUserId: item.otherUser._id,
              lastMessage: item.lastMessage,
              lastActivity: item.lastActivity,
              unreadCount: item.unreadCount,
            };
            conversations.push(conversation);

            users[item.otherUser._id] = item.otherUser;

            cursors[item.conversationId] = {
              myLastSeenMessageId: item.myLastSeenMessageId,

              otherLastSeenMessageId: item.otherLastSeenMessageId,

              otherLastDeliveredMessageId: item.otherLastDeliveredMessageId,
            };
          }

          return {
            conversations,
            users,
            cursors,
          };
        }

        const { conversations, users, cursors } = normalizeConversations(
          data.conversations,
        );

        setConversations(conversations);
        setUsers(users);
        setCursors(cursors);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [setConversations, setCursors, setUsers]);

  return { isLoading, error };
};
