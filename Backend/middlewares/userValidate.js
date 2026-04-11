// User Sign-up/in -> Validate fields
const validateUser = (type = "register") => {
    return (req, res, next) => {
        const { name, email, password, username } = req.body;

        if (!email || !password)
            return res
                .status(400)
                .json({ message: "Email and password required." });

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email))
            return res.status(400).json({ message: "Invalid email format." });

        if (type === "register" && password.length < 6)
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters." });

        if (type === "register" && (!name || name.trim().length < 2))
            return res.status(400).json({
                message: "Name is required and must be at least 2 characters.",
            });

        if (
            type === "register" &&
            (!username || username.trim().length < 3)
        ) {
            return res.status(400).json({
                message:
                    "Username is required and must be at least 3 characters.",
            });
        }

        if (type === "register") {
            const usernameRegex = /^[a-z0-9_]+$/;

            if (!usernameRegex.test(username.trim().toLowerCase())) {
                return res.status(400).json({
                    message:
                        "Username can only contain lowercase letters, numbers, and underscores.",
                });
            }
        }

        next();
    };
};

export { validateUser };
