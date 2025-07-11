import Message from '../models/message.js';

const storeMessageDB = async (
    sender,
    receiver,
    content = '',
    media = 'none'
) => {
    try {
        const message = await Message({
            sender,
            receiver,
            content,
            media,
        });
        await message.save();
    } catch (error) {
        console.log(`Failed to Store Message in DB`);
    }
};

const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ $or: [{ sender: req.user.id }, { receiver: req.user.id}]  });
        res.status(200).json({ messages });
    } catch (error) {
        console.log(`Failed to Fetch Message From DB`);
    }
};

export { storeMessageDB, getMessages };
