import express from 'express';
import { validateUser } from '../middlewares/userValidate.js';
import {
    registerUser,
    loginUser,
    logoutUser,
} from '../controllers/userController.js';
import { auth } from '../middlewares/auth.js';
import User from '../models/user.js';

const router = express.Router();

router.post('/register', validateUser('register'), registerUser);
router.post('/login', validateUser('login'), loginUser);
router.get('/logout', logoutUser);
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select(
            '_id name email profilePic.url bio lastSeen isOnline'
        );
        res.status(200).json({
            message: 'Users Fetched Successfully',
            users: users,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server error. Please try again later.',
        });
    }
});

export default router;
