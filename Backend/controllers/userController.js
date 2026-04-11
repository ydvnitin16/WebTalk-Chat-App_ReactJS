import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
    getUserByUsernameService,
    updateProfileService,
} from "../services/userService.js";
import { cloudinary } from "../configs/cloudinary.js";

const uploadBufferToCloudinary = (fileBuffer, folder = "sendx/profile") =>
    new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            },
        );

        uploadStream.end(fileBuffer);
    });

// user register -> Store user info to the DB
const registerUser = async (req, res) => {
    const { name, email, password, username } = req.body;
    try {
        // Check is User already exists
        const normalizedUsername = username.trim().toLowerCase();
        const existingUser = await User.findOne({
            $or: [{ email }, { username: normalizedUsername }],
        });

        if (existingUser)
            return res.status(409).json({
                message:
                    existingUser.email === email
                        ? "Email already exists!"
                        : "Username already exists!",
            });

        // hash password & answer using bcrypt
        const hashPwd = await bcrypt.hash(password, 10);

        // Save user info in DB
        const user = await User({
            name,
            email,
            username: normalizedUsername,
            password: hashPwd,
        });
        await user.save();

        // store token
        storeToken(res, user);

        res.status(201).json({
            message: "Registered Successfully!",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error. Please try again later.",
        });
    }
};

// User Login -> Auth user to get access
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Get user
        const userInfo = await User.findOne({ email });

        // If Email not found
        if (!userInfo)
            return res.status(404).json({ message: "Invalid Credentials" });

        const isPasswordCorrect = await bcrypt.compare(
            password,
            userInfo.password,
        );

        if (!isPasswordCorrect)
            return res.status(404).json({ message: "Invalid Credentials" });

        // If correct credentials_ auth user
        storeToken(res, userInfo);

        res.status(200).json({
            message: "Logged In Successfully.",
            user: {
                id: userInfo._id,
                name: userInfo.name,
                email: userInfo.email,
                username: userInfo.username,
                avatar: userInfo.avatar
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error. Please try again later.",
        });
    }
};

const storeToken = (res, userInfo) => {
    const tokenAge = 30 * 24 * 60 * 60 * 1000; //30 days
    const token = jwt.sign(
        {
            id: userInfo._id,
            name: userInfo.name,
            email: userInfo.email,
            username: userInfo.username,
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "30d" },
    );

    const isProd = process.env.NODE_ENV === "production";
    // NOTE:
    // - SameSite=None requires Secure=true (HTTPS). In local dev (HTTP) browsers will drop the cookie.
    // - For localhost dev, use SameSite=Lax + Secure=false.
    res.cookie("authHeader", `Bearer ${token}`, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: tokenAge,
    });
};

// User Logout
const logoutUser = (req, res) => {
    res.clearCookie("authHeader");
    res.status(200).json({ message: "Logout Successfully." });
};

const getUserByUsername = async (req, res) => {
    try {
        const { username } = req.query;

        const users = await getUserByUsernameService(username);
        if (!users) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({
            message: "Server error. Please try again later.",
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const { name, username } = req.body;
        const file = req.file;
        let avatar = null;

        if (file) {
            const uploadedImage = await uploadBufferToCloudinary(file.buffer);
            avatar = {
                url: uploadedImage.secure_url,
                public_id: uploadedImage.public_id,
            };
        }

        const updatedUser = await updateProfileService({
            userId,
            name,
            username,
            avatar,
        });

        res.status(200).json({
            success: true,
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                username: updatedUser.username,
                avatar: updatedUser.avatar,
            },
        });
    } catch (err) {
        res.status(400).json({
            message: err.message,
        });
    }
};

export {
    registerUser,
    loginUser,
    logoutUser,
    getUserByUsername,
    updateProfile,
};
