import { useEffect } from "react";
import { fetchMessages } from "../services/chat.api";
import { useChatStore } from "../store/useChatStore";

export const useMessages = () => {
    const { selectedUser, setMessages } = useChatStore();

    useEffect(() => {
        if (!selectedUser) return;

        const load = async () => {
            const data = await fetchMessages(selectedUser._id);
            setMessages(data);
        };

        load();
    }, [selectedUser]);
};
