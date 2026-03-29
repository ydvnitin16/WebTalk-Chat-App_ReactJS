import { useEffect } from "react";
import { fetchMessages } from "../services/chat.api";
import useChatStore from "@/stores/useChatStore";
import useAuthStore from "@/stores/useAuthStore";

export const useMessages = () => {
    const { conversations, selectedUserId, setMessages } = useChatStore();
    const { currentUser } = useAuthStore();

    useEffect(() => {
        if (!selectedUserId) {
            setMessages([]);
            return;
        }

        const selectedConversation = conversations.find(
            (conversation) =>
                conversation.participants?.includes(selectedUserId) &&
                conversation.participants?.includes(currentUser?.id),
        );

        if (!selectedConversation?._id) {
            setMessages([]);
            return;
        }

        const load = async () => {
            const data = await fetchMessages(selectedConversation._id);
            setMessages(data.messages);
        };

        load();
    }, [currentUser?.id, selectedUserId]);
};
