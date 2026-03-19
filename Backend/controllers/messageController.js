import Message from '../models/message.js';


export const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ sender: req.user.id }, { receiver: req.user.id }],
        });
        res.status(200).json({ messages });
    } catch (error) {
        console.log(`Failed to Fetch Message From DB`);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};


