import { useEffect } from "react";
import useUIStore from "@/stores/useUIStore";

const useDraft = ({ conversationId, setMessage }) => {
    const { setDraft, getDraft, clearDraft } = useUIStore();

    // Load draft when conversation changes
    useEffect(() => {
        if (!conversationId) return;

        const draft = getDraft(conversationId);
        setMessage(draft);
    }, [conversationId, getDraft, setMessage]);

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
