import Message from "../models/message.js";
import Conversation from "../models/conversation.js";

export const sendMessageService = async ({
    senderId,
    receiverId,
    content = "",
    type = "text",
}) => {
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

    // create message
    const message = await Message.create({
        conversationId: conversation._id,
        sender: senderId,
        receiver: receiverId,
        content,
        type,
    });

    // update conversation
    conversation.lastMessage = message._id;
    await conversation.save();

    return { message, conversation };
};
