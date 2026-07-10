import { cloudinary } from "../configs/cloudinary.js";
import User from "../models/user.js";

export const getUserByUsernameService = async (username) => {
    const normalisedUsername = username.trim().toLowerCase();
    if (!normalisedUsername) {
        return [];
    }
    const users = await User.find({
        username: { $regex: normalisedUsername },
    })
        .limit(3)
        .select("_id name avatar username")
        .lean();
    return users;
};

export const updateProfileService = async ({
    userId,
    name,
    username,
    avatar,
    bio,
}) => {
    const normalizedUsername = username?.trim()?.toLowerCase();

    if (normalizedUsername) {
        const existing = await User.findOne({ username: normalizedUsername });

        if (existing && existing._id.toString() !== userId) {
            if (avatar?.public_id) {
                await cloudinary.uploader.destroy(avatar.public_id);
            }

            throw new Error("Username already taken!");
        }
    }

    const user = await User.findById(userId).select("_id name username avatar");
    if (!user) {
        if (
            avatar?.public_id &&
            avatar?.public_id !== import.meta.env.DEFAULT_AVATAR_URL
        ) {
            await cloudinary.uploader.destroy(avatar.public_id);
        }

        throw new Error("User not found");
    }

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (normalizedUsername) user.username = normalizedUsername;

    if (avatar) {
        if (
            user.avatar?.public_id &&
            user.avatar.public_id !== process.env.DEFAULT_AVATAR_PUBLIC_ID
        ) {
            await cloudinary.uploader.destroy(user.avatar.public_id);
        }

        user.avatar = {
            url: avatar.url,
            public_id: avatar.public_id,
        };
    }

    await user.save();

    return user;
};

export const setOnline = async (userId) => {
    console.log("marking online");
    await User.findByIdAndUpdate(userId, { isOnline: true });
};

export const setOffline = async (userId) => {
    console.log("marking offline");

    await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
    });
};
