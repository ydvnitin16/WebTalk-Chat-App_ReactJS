import Conversation from "../models/conversation.js";
import Call from "../models/call.js";

export const createCallService = async ({
    caller,
    receiver,
    type = "audio",
}) => {
    const senderId = caller;
    const receiverId = receiver;

    // check conversation exists or not
    let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    });

    // create conversation
    if (!conversation) {
        conversation = await Conversation.create({
            participants: [senderId, receiverId],
        });
    }

    // create call entry
    const call = await Call.create({
        conversation: conversation._id,
        caller,
        receiver,
        type,
        status: "missed",
    });
    await call.populate("caller receiver", "_id name avatar");
  
    return call;
};

export const updateCallStatus = async (callId, update) => {
    // update call status
    const call = await Call.findByIdAndUpdate(callId, update);

    if (!call) {
        console.log("Call error: CallId doesn't exists");
    }
    return call;
};

export const getCallsHistoryService = async (conversationId) => {
    if (!conversationId) {
        throw new Error("Conversation ID is required");
    }

    // 1. Check is conversation exists
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    // 2. Get calls
    const calls = await Call.find({ conversation: conversationId }).sort({
        createdAt: 1,
    });
    
    return calls;
};
