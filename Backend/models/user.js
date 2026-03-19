import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
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
        profilePic: {
            type: {
                url: String,
                public_id: String,
            },
            default: {
                url: process.env.DEFAULT_AVATAR_URL,
                public_id: "DefautlImage_ge0rul",
            },
        },
        bio: {
            type: String,
            default: "",
        },
        isOnline: { type: Boolean, default: false },
        lastSeen: { type: Date, default: Date.now },
    },
    { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
