import Message from "../models/message.js";
import Conversation from "../models/conversation.js";

export const sendMessageService = async ({
    senderId,
    receiverId,
    content = "",
    type = "text",
}) => {
    console.log(
        "senderid: ",
        senderId,
        "receiverId: ",
        receiverId,
        "content: ",
        content,
    );
    // check conversation exists or not
    let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    });
    console.log("conversation after find : ", conversation);

    // create conversation
    if (!conversation) {
        conversation = await Conversation.create({
            participants: [senderId, receiverId],
        });
    }
    console.log("conversation after creation : ", conversation);
    // create message
    const message = await Message.create({
        conversation: conversation._id,
        sender: senderId,
        receiver: receiverId,
        content,
        type,
    });
    console.log("message after creation : ", message);

    // update conversation
    conversation.lastMessage = message._id;
    await conversation.save();

    return { message, conversation };
};

export const getMessagesService = async (conversationId) => {
    if (!conversationId) {
        throw new Error("Conversation ID is required");
    }

    // 1. Check is conversation exists
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    // 2. Get messages
    const messages = await Message.find({ conversation: conversationId }).sort({
        createdAt: 1,
    });
    console.log("Messages", messages);
    return messages;
};
