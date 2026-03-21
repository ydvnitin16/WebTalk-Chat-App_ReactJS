import User from "../models/user.js";

export const getUserByUsernameService = async (username) => {
    const normalisedUsername = username.trim().toLowerCase();
    const user = await User.findOne({
        username: { $regex: normalisedUsername },
    });
    console.log(user);
    return user;
};
