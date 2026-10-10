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


module.exports = {
    registerUser,
    loginUser
};