import { useEffect, useState } from "react";
import { fetchConversations } from "../services/chat.api";
import useChatStore from "@/stores/useChatStore";
import { normalizeConversations } from "@/services/utils";

export const useConversations = () => {
    const { setConversations, setUsers } = useChatStore();

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

                const { conversations, users } = normalizeConversations(
                    data.conversations,
                );

                setConversations(conversations);
                setUsers(users);
            } catch (err) {
                setError(err.message || "Something went wrong");
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, []);

    return { isLoading, error };
};
