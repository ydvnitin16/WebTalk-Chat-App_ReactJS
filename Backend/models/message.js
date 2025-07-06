import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            default: '',
        },
        media: {
            type: {
                type: String, // 'image', 'video', 'audio', 'file'
            },
            url: String,
        },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
