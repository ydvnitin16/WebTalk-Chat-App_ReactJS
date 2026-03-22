import { useEffect } from "react";
import { fetchConversations } from "../services/chat.api";
import { useChatStore } from "@/stores/useChatStore";

export const useConversations = () => {
    const { setConversations } = useChatStore();

    useEffect(() => {
        const load = async () => {
            const data = await fetchConversations();
            setConversations(data.conversations);
        };

        load();
    }, []);
};
