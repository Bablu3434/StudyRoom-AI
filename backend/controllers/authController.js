const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require(
    "../models/User"
);


// Generate JWT

function generateToken(userId) {

    return jwt.sign(
        {
            id: userId
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }
    );
}


// ================================
// REGISTER
// POST /api/auth/register
// ================================

const registerUser =
    async (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;


            if (
                !name ||
                !email ||
                !password
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Please fill all fields"
                    });
            }


            if (password.length < 6) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Password must be at least 6 characters"
                    });
            }


            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            const existingUser =
                await User.findOne({
                    email:
                        normalizedEmail
                });


            if (existingUser) {

                return res
                    .status(409)
                    .json({
                        success: false,
                        message:
                            "Account already exists"
                    });
            }


            const user =
                await User.create({
                    name:
                        name.trim(),

                    email:
                        normalizedEmail,

                    password
                });


            const token =
                generateToken(
                    user._id
                );


            return res
                .status(201)
                .json({

                    success: true,

                    message:
                        "Account created successfully",

                    token,

                    user: {
                        id:
                            user._id,

                        name:
                            user.name,

                        email:
                            user.email
                    }

                });

        } catch (error) {

            console.error(
                "Register Error:",
                error
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Server error while creating account"

                });

        }

    };


// ================================
// LOGIN
// POST /api/auth/login
// ================================

const loginUser =
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            if (
                !email ||
                !password
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Email and password are required"
                    });
            }


            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            const user =
                await User
                    .findOne({
                        email:
                            normalizedEmail
                    })
                    .select("+password");


            if (!user) {

                return res
                    .status(401)
                    .json({
                        success: false,
                        message:
                            "Invalid email or password"
                    });
            }


            const passwordMatches =
                await user.comparePassword(
                    password
                );


            if (!passwordMatches) {

                return res
                    .status(401)
                    .json({
                        success: false,
                        message:
                            "Invalid email or password"
                    });
            }


            const token =
                generateToken(
                    user._id
                );


            return res.json({

                success: true,

                message:
                    "Login successful",

                token,

                user: {
                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email
                }

            });

        } catch (error) {

            console.error(
                "Login Error:",
                error
            );


            return res
                .status(500)
                .json({
                    success: false,
                    message:
                        "Server error while logging in"
                });

        }

    };

    // =====================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// =====================================

const forgotPassword =
    async (req, res) => {

        try {

            const {
                email
            } = req.body;


            if (
                !email ||
                typeof email !== "string"
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Please enter your email"

                    });

            }


            const user =
                await User.findOne({

                    email:
                        email
                            .trim()
                            .toLowerCase()

                });


            // Generic response
            // prevents email enumeration

            if (!user) {

                return res.json({

                    success: true,

                    message:
                        "If an account exists with this email, a password reset link has been created."

                });

            }


            // Create random token

            const resetToken =
                crypto
                    .randomBytes(32)
                    .toString("hex");


            // Store HASHED token in database

            const hashedToken =
                crypto
                    .createHash("sha256")
                    .update(resetToken)
                    .digest("hex");


            user.resetPasswordToken =
                hashedToken;


            user.resetPasswordExpires =
                Date.now() +
                15 * 60 * 1000;


            await user.save();


            // Local development reset link

            const resetUrl =
                `http://127.0.0.1:5500/reset-password.html?token=${resetToken}`;


            console.log(
                "Password Reset Link:",
                resetUrl
            );


            return res.json({

                success: true,

                message:
                    "Password reset link created successfully.",

                // DEV ONLY
                resetUrl

            });

        } catch (error) {

            console.error(
                "Forgot Password Error:",
                error
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Could not create password reset link"

                });

        }

    };


// =====================================
// RESET PASSWORD
// POST /api/auth/reset-password/:token
// =====================================

const resetPassword =
    async (req, res) => {

        try {

            const {
                token
            } = req.params;


            const {
                password,
                confirmPassword
            } = req.body;


            if (
                !token
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Invalid reset link"

                    });

            }


            if (
                typeof password !== "string" ||
                password.length < 6
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Password must be at least 6 characters"

                    });

            }


            if (
                password !==
                confirmPassword
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Passwords do not match"

                    });

            }


            const hashedToken =
                crypto
                    .createHash("sha256")
                    .update(token)
                    .digest("hex");


            const user =
                await User.findOne({

                    resetPasswordToken:
                        hashedToken,

                    resetPasswordExpires: {
                        $gt: Date.now()
                    }

                });


            if (!user) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Reset link is invalid or has expired"

                    });

            }


            // This triggers User pre-save hashing

            user.password =
                password;


            user.resetPasswordToken =
                null;


            user.resetPasswordExpires =
                null;


            await user.save();


            return res.json({

                success: true,

                message:
                    "Password reset successfully"

            });

        } catch (error) {

            console.error(
                "Reset Password Error:",
                error
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Could not reset password"

                });

        }

    };


module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword
};