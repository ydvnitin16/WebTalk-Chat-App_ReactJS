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
