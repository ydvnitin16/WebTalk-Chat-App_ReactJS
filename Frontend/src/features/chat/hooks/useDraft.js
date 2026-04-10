// hooks/useDraft.js
import { useEffect } from "react";
import useChatStore from "@/stores/useChatStore";

const useDraft = ({conversationId, message, setMessage}) => {
    const { setDraft, getDraft, clearDraft } = useChatStore();

    // Load draft when conversation changes
    useEffect(() => {
        if (!conversationId) return;

        const draft = getDraft(conversationId);
        setMessage(draft);
    }, [conversationId]);

    // Update draft while typing
    const handleDraftChange = (value) => {
        setMessage(value);
        if (!conversationId) return;
        setDraft(conversationId, value);
    };

    // Clear draft after sending
    const clearCurrentDraft = () => {
        if (!conversationId) return;
        clearDraft(conversationId);
    };

    return {
        handleDraftChange,
        clearCurrentDraft,
    };
};

export default useDraft;