import { cloudinary } from "../configs/cloudinary.js";
import {
    getUserByUsernameService,
    updateProfileService,
} from "../services/users.services.js";

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

export const getUserByUsername = async (req, res) => {
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

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const { name, username, bio } = req.body;
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
            bio
        });

        res.status(200).json({
            success: true,
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                username: updatedUser.username,
                avatar: updatedUser.avatar,
                bio: updatedUser.bio,
            },
        });
    } catch (err) {
        res.status(400).json({
            message: err.message,
        });
    }
};
