const Users = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

const authController = {
    register: async (req, res) => {
        try {
            const { fullname, username, email, password, gender } = req.body;

            let newUserName = username.toLowerCase().replace(/ /g, "");

            const user_name = await Users.findOne({ username: newUserName });
            if (user_name) {
                return res.status(400).json({ msg: "This username is already taken." });
            }

            const user_email = await Users.findOne({ email });
            if (user_email) {
                return res
                    .status(400)
                    .json({ msg: "This email is already registered." });
            }

            if (password.length < 6) {
                return res
                    .status(400)
                    .json({ msg: "Password must be at least 6 characters long." });
            }

            const newUser = new Users({
                fullname,
                username: newUserName,
                email,
                password,
                gender,
            });

            const user = await newUser.save();

            const access_token = user.createAccessToken();
            const refresh_token = user.createRefreshToken();

            res.cookie("refreshtoken", refresh_token, {
                httpOnly: true,
                path: "/api/refresh_token",
                maxAge: 30 * 24 * 60 * 60 * 1000, //validity of 30 days
            });

            res.json({
                msg: "Registered Successfully!",
                access_token,
                user,
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    changePassword: async (req, res) => {
        try {
            const { oldPassword, newPassword } = req.body;

            const user = await Users.findOne({ _id: req.user._id });

            const isMatch = await user.comparePassword(oldPassword);

            if (!isMatch) {
                return res.status(400).json({ msg: "Your password is wrong." });
            }

            if (newPassword.length < 6) {
                return res
                    .status(400)
                    .json({ msg: "Password must be at least 6 characters long." });
            }

            user.password = newPassword;
            await user.save();

            res.json({ msg: "Password updated successfully." })

        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await Users.findOne({ email });

            if (!user) {
                return res.status(400).json({ msg: "Email or Password is incorrect." });
            }

            const isMatch = await user.comparePassword(password);

            if (!isMatch) {
                return res.status(400).json({ msg: "Email or Password is incorrect." });
            }

            const access_token = user.createAccessToken();
            const refresh_token = user.createRefreshToken();

            res.cookie("refreshtoken", refresh_token, {
                httpOnly: true,
                path: "/api/refresh_token",
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000, //validity of 30 days
            });

            res.json({
                msg: "Logged in  Successfully!",
                access_token,
                user: {
                    ...user._doc,
                    password: "",
                },
            });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    logout: async (req, res) => {
        try {
            res.clearCookie("refreshtoken", { path: "/api/refresh_token" });
            return res.json({ msg: "Logged out Successfully." });
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },

    forgotPassword: async (req, res) => {
        const { email } = req.body;

        try {
            const user = await Users.findOne({ email });

            if (!user) {
                return res.status(401).json({ message: "user not exist" });
            }

            const token = user.createAccessToken();
            console.log(token);

            const url = `${process.env.FRONTEND_PORT}/ResetPassword/${token}/`;

            const message = `
            <h1>You have requested a password reset</h1>
            <p>Please make a put request to the following link:</p>
            <a href=${url} clicktracking=off>${url}</a>
            `;
            console.log(user.email);
            console.log(message);

            await sendEmail(
                {
                    to: user.email,
                    subject: "Password Reset Request",
                    text: message,
                });
            console.log("end");
            res.status(200).json({ message: "Kindly check your email for further instructions" });
        } catch (error) {
            res.send(error);
        }
    },

    resetPassword: async (req, res) => {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        try {
            if (password !== confirmPassword) {
                return res.status(401).json({
                    message: "Password Mismatch",
                });
            }
            let decoded = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const { id } = decoded;
            const user = await Users.findById(id);

            if (!user) {
                return res.json({ message: "invalid user" });
            }
            user.password = password;
            await user.save();
            res.status(200).json({ message: "Password Reset" });
        } catch (error) {
            res.status(400).json({
                message: "Password reset token is invalid or has expired.",
            });
        }
    },

    generateAccessToken: async (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken;

            if (!rf_token) {
                return res.status(400).json({ msg: "Please login again." });
            }
            jwt.verify(
                rf_token,
                process.env.REFRESH_TOKEN_SECRET,
                async (err, result) => {
                    if (err) {
                        res.status(400).json({ msg: "Please login again." });
                    }

                    const user = await Users.findById(result.id)
                        .select("-password");

                    if (!user) {
                        res.status(400).json({ msg: "User does not exist." });
                    }

                    const access_token = user.createAccessToken();
                    res.json({ access_token, user });
                }
            );
        } catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    },
};

module.exports = authController;