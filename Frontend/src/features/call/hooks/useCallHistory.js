import useAuthStore from "@/stores/useAuthStore";
import useCallStore from "@/stores/useCallStore";
import useChatStore from "@/stores/useChatStore";
import React, { useEffect } from "react";
import { fetchCallsHistory } from "../services/calls";

const useCallHistory = () => {
    const { conversations, selectedUserId } = useChatStore();
    const { currentUser } = useAuthStore();
    const { setCallHistory } = useCallStore();

    useEffect(() => {
        if (!selectedUserId) {
            setCallHistory([]);
            return;
        }

        const selectedConversation = conversations.find(
            (conversation) =>
                conversation.participants?.includes(selectedUserId) &&
                conversation.participants?.includes(currentUser?.id),
        );

        if (!selectedConversation?._id) {
            setCallHistory([]);
            return;
        }

        const load = async () => {
            console.log(selectedConversation);
            const data = await fetchCallsHistory(selectedConversation._id);
            setCallHistory(data.calls);
            console.log(data);
        };
        load();
    }, [selectedUserId]);
};

export default useCallHistory;
