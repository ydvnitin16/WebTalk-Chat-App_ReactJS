import express from "express";
import multer from "multer";
import { validateUser } from "../middlewares/userValidate.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    getUserByUsername,
    updateProfile,
} from "../controllers/userController.js";
import { auth } from "../middlewares/auth.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

const router = express.Router();

router.post("/register", validateUser("register"), registerUser);
router.post("/login", validateUser("login"), loginUser);
router.delete("/logout", logoutUser);
router.get("/user/search", auth, getUserByUsername);
router.put("/profile", auth, upload.single("avatar"), updateProfile);

export default router;
