import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        securityQuestion: {
            type: {
                question: {
                    type: String,
                    enum: [
                        'What is your mothers maiden name?',
                        'What is the name of your first pet?',
                        'What is your favorite movie?',
                        'What is your favorite book?',
                        'Where did you go to high school?',
                        'What is your favorite restaurant?',
                        'What is the name of your first school?',
                    ],
                    required: true,
                },
                answer: {
                    type: String,
                    required: true,
                },
            },
            required: true,
        },
        profilePic: {
            type: {
                url: String,
                public_id: String,
            },
            default: {
                url: process.env.DEFAULT_AVATAR_URL,
                public_id: 'DefautlImage_ge0rul',
            },
        },
        bio: {
            type: String,
            default: '',
        },
        isOnline: { type: Boolean, default: false },
        lastSeen: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
