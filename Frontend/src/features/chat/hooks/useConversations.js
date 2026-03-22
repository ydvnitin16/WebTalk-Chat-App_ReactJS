import { useEffect } from "react";
import { fetchConversations } from "../services/chat.api";
import useChatStore from "@/stores/useChatStore";
import { normalizeConversations } from "@/services/utils";

export const useConversations = () => {
    const { setConversations, setUsers } = useChatStore();

    useEffect(() => {
        const load = async () => {
            const data = await fetchConversations();
            const { conversations, users } = normalizeConversations(
                data.conversations,
            );

            setConversations(conversations);
            setUsers(users);
        };

        load();
    }, []);
};
