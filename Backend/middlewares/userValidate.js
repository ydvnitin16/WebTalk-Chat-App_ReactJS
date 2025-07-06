// User Sign-up/in -> Validate fields
const validateUser = (type = 'register') => {
    return (req, res, next) => {
        const { name, email, password, terms, securityQuestion } = req.body;

        const questions = [
            'What is your mothers maiden name?',
            'What is the name of your first pet?',
            'What is your favorite movie?',
            'What is your favorite book?',
            'Where did you go to high school?',
            'What is your favorite restaurant?',
            'What is the name of your first school?',
        ];

        if (!email || !password)
            return res
                .status(400)
                .json({ message: 'Email and password required.' });

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email))
            return res.status(400).json({ message: 'Invalid email format.' });

        if (type === 'register' && password.length < 6)
            return res
                .status(400)
                .json({ message: 'Password must be at least 6 characters.' });

        if (type === 'register' && (!name || name.trim().length < 2))
            return res.status(400).json({
                message: 'Name is required and must be at least 2 characters.',
            });

        if (type === 'register' && !terms)
            return res.status(400).json({
                message: 'Please accept terms & conditions',
            });

        if (type === 'register' && !questions.includes(securityQuestion.question)) {
            return res.status(400).json({
                message: 'Please Select valid question',
            });
        }

        if (type === 'register' && (!securityQuestion?.answer || !securityQuestion.answer.trim()))
            return res.status(400).json({
                message: 'Please answer the question for safety',
            });

        next();
    };
};

export { validateUser };
