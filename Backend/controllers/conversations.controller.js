import {
  getCallsService,
  getConversationsService,
  getConversationTimelineService,
  getMessagesService,
} from "../services/conversations.services.js";

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await getConversationsService(userId);
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { cursor, limit } = req.query;

    const { messages, nextCursor, hasMore } = await getMessagesService({
      conversationId,
      userId,
      cursor,
      limit: Number(limit) || 30,
    });

    return res.status(200).json({
      success: true,
      data: { messages, nextCursor, hasMore },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

export const getCalls = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    const { cursor, limit } = req.query;

    const calls = await getCallsService({
      conversationId,
      userId,
      cursor,
      limit: Number(limit) || 20,
    });

    return res.status(200).json({
      success: true,
      data: { ...calls },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch calls",
    });
  }
};


export const getTimeline = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { cursor, limit = 20 } = req.query;
    
    const result = await getConversationTimelineService(conversationId, {
        cursor,
        limit: Number(limit),
    });

    res.status(200).json({ success: true, ...result });
} catch (error) {
    res.status(500).json({
        message: error.message || "Failed to fetch conversation timeline",
    });
}
}