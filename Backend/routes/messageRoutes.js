import express from 'express';
import { auth } from '../middlewares/auth.js'
import { getMessages } from '../controllers/messageContoller.js';

const router = express.Router();



router.get('/', auth, getMessages)

export default router;