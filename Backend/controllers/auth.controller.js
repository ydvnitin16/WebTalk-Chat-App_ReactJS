import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cloudinary } from "../configs/cloudinary.js";
import { storeToken } from "../utils/auth.js";

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
    // const hashPwd = await bcrypt.hash(password, 10);
    const hashPwd = password;

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

    // const isPasswordCorrect = await bcrypt.compare(
    //     password,
    //     userInfo.password,
    // );

    const isPasswordCorrect = password === userInfo.password ? true : false;
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
        avatar: userInfo.avatar,
      },
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

// User Logout
const logoutUser = (req, res) => {
  res.clearCookie("authHeader");
  res.status(200).json({ message: "Logout Successfully." });
};

export { registerUser, loginUser, logoutUser };
