import { useEffect } from "react";
import { fetchMessages } from "../services/chat.api";
import useChatStore from "@/stores/useChatStore";

export const useMessages = () => {
    const { conversations, selectedUser, setMessages } = useChatStore();

    useEffect(() => {
        if (!selectedUser) return;

        const selectedConversation = conversations.find(
            (conversation) =>
                conversation.participants[0]._id === selectedUser._id ||
                conversation.participants[1]._id === selectedUser._id,
        );

        const load = async () => {
            const data = await fetchMessages(selectedConversation._id);
            console.log(data);
            setMessages(data.messages);
        };

        load();
    }, [selectedUser]);
};
