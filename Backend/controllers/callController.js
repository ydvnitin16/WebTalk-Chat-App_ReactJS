import { getCallsHistoryService } from "../services/callService.js";

export const getCallsHistory = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const calls = await getCallsHistoryService(conversationId);
        res.status(200).json({ success: true, calls });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Failed to fetch messages",
        });
    }
};
