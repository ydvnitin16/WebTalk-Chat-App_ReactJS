import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// user register -> Store user info to the DB
const registerUser = async (req, res) => {
    const { name, email, password, securityQuestion } = req.body;
    try {
        // Check is User already exists
        const existingUser = await User.findOne({ email });

        if (existingUser)
            return res.status(409).json({ message: 'Email already exists!' });

        const answer = securityQuestion.answer;

        // hash password & answer using bcrypt
        const hashPwd = await bcrypt.hash(password, 10);
        const hashAns = await bcrypt.hash(answer, 10);

        // Save user info in DB
        const user = await User({
            name,
            email,
            password: hashPwd,
            securityQuestion: {
                question: securityQuestion.question,
                answer: hashAns,
            },
        });
        await user.save();

        res.status(201).json({ message: 'Registered Successfully!' });
    } catch (error) {
        res.status(500).json({
            message: 'Server error. Please try again later.',
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
            return res.status(404).json({ message: 'Invalid Credentials' });

        const isPasswordCorrect = await bcrypt.compare(
            password,
            userInfo.password
        );

        if (!isPasswordCorrect)
            return res.status(404).json({ message: 'Invalid Credentials' });

        // If correct credentials_ auth user

        const token = jwt.sign(
            {
                id: userInfo._id,
                name: userInfo.name,
                email: userInfo.email,
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '3d' }
        );

        res.cookie('authHeader', `Bearer ${token}`, {
            httpOnly: true, // sent only to http
            secure: false, // cookie only set to the https
            sameSite: 'lax', // accessed by same domain
            maxAge: 3 * 24 * 60 * 60 * 1000, // Expires in 3 Days
        });

        res.status(200).json({
            message: 'Logged In Successfully.',
            user: {
                id: userInfo._id,
                name: userInfo.name,
                email: userInfo.email,
                picUrl: userInfo.profilePic.url
            },
        });
    } catch (error) {
        res.status(500).json({
            message: 'Server error. Please try again later.',
        });
    }
};

// User Logout
const logoutUser = (req, res) => {
    res.clearCookie('authHeader');
    res.status(200).json({ message: 'Logout Successfully.' });
};

export { registerUser, loginUser, logoutUser };
