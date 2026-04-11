import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        avatar: {
            type: {
                url: String,
                public_id: String,
            },
            default: {
                url: process.env.DEFAULT_AVATAR_URL,
                public_id: "DefautlImage_ge0rul",
            },
        },
        isOnline: { type: Boolean, default: false },
        lastSeen: { type: Date, default: Date.now },
    },
    { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
