import User from "../models/user.js";

export const getUserByUsernameService = async (username) => {
    const normalisedUsername = username.trim().toLowerCase();
    const users = await User.find({
        username: { $regex: normalisedUsername },
    });
    return users;
};

export const updateUserOnlineStatus = async (userId, isOnline) => {
    const user = await User.findById(userId);

    if (!user) {
        return;
    }

    user.isOnline = isOnline;
    if (isOnline === false) {
        user.lastSeen = new Date();
    }
    user.save();
    return user;
};
