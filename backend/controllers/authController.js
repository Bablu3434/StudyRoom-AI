const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const sendEmail =
    require("../utils/sendEmail");

const {
    generateOtp,
    hashOtp
} = require("../utils/otp");


// =====================================
// GENERATE JWT
// =====================================

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


// =====================================
// REGISTER
// POST /api/auth/register
// =====================================

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


            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            const existingUser =
                await User.findOne({
                    email: normalizedEmail
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


// =====================================
// LOGIN
// POST /api/auth/login
// =====================================

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


            // =====================================
            // GENERATE LOGIN OTP
            // =====================================

            const otp =
                generateOtp();


            user.loginOtpHash =
                hashOtp(
                    otp
                );


            user.loginOtpExpires =
                new Date(
                    Date.now() +
                    5 * 60 * 1000
                );


            user.loginOtpAttempts =
                0;


            await user.save();


            // =====================================
            // SEND LOGIN OTP
            // =====================================

            try {

                await sendEmail({

                    to:
                        user.email,

                    subject:
                        "StudyRoom AI Login OTP",

                    html: `
                        <div style="
                            font-family: Arial, sans-serif;
                            max-width: 520px;
                            margin: auto;
                            padding: 24px;
                        ">

                            <h2>
                                StudyRoom AI
                            </h2>

                            <p>
                                Hello ${user.name},
                            </p>

                            <p>
                                Your login verification code is:
                            </p>

                            <div style="
                                font-size: 32px;
                                font-weight: bold;
                                letter-spacing: 8px;
                                margin: 24px 0;
                            ">
                                ${otp}
                            </div>

                            <p>
                                This OTP is valid for
                                <strong>5 minutes</strong>.
                            </p>

                            <p>
                                If you did not try to login,
                                you can ignore this email.
                            </p>

                        </div>
                    `

                });

            } catch (emailError) {

                console.error(
                    "Login OTP Email Error:",
                    emailError
                );


                user.loginOtpHash =
                    null;

                user.loginOtpExpires =
                    null;

                user.loginOtpAttempts =
                    0;


                await user.save();


                return res
                    .status(500)
                    .json({

                        success: false,

                        message:
                            "Could not send OTP email"

                    });

            }


            return res.json({

                success: true,

                otpRequired: true,

                message:
                    "OTP sent to your registered email.",

                email:
                    user.email

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
// VERIFY LOGIN OTP
// POST /api/auth/verify-login-otp
// =====================================

const verifyLoginOtp =
    async (req, res) => {

        try {

            const {
                email,
                otp
            } = req.body;


            if (
                !email ||
                !otp
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Email and OTP are required"

                    });

            }


            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            const user =
                await User.findOne({
                    email:
                        normalizedEmail
                });


            if (
                !user ||
                !user.loginOtpHash ||
                !user.loginOtpExpires
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "OTP is invalid or expired"

                    });

            }


            // =====================================
            // OTP EXPIRED
            // =====================================

            if (
                user.loginOtpExpires.getTime() <
                Date.now()
            ) {

                user.loginOtpHash =
                    null;

                user.loginOtpExpires =
                    null;

                user.loginOtpAttempts =
                    0;


                await user.save();


                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "OTP has expired. Please login again."

                    });

            }


            // =====================================
            // MAXIMUM ATTEMPTS
            // =====================================

            if (
                user.loginOtpAttempts >= 5
            ) {

                user.loginOtpHash =
                    null;

                user.loginOtpExpires =
                    null;

                user.loginOtpAttempts =
                    0;


                await user.save();


                return res
                    .status(429)
                    .json({

                        success: false,

                        message:
                            "Too many incorrect attempts. Please login again."

                    });

            }


            const enteredOtp =
                String(
                    otp
                ).trim();


            if (
                !/^\d{6}$/.test(
                    enteredOtp
                )
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Please enter a valid 6-digit OTP"

                    });

            }


            const enteredOtpHash =
                hashOtp(
                    enteredOtp
                );


            // =====================================
            // WRONG OTP
            // =====================================

            if (
                enteredOtpHash !==
                user.loginOtpHash
            ) {

                user.loginOtpAttempts +=
                    1;


                await user.save();


                const remainingAttempts =
                    Math.max(
                        0,
                        5 -
                        user.loginOtpAttempts
                    );


                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            `Incorrect OTP. ${remainingAttempts} attempt(s) remaining.`

                    });

            }


            // =====================================
            // CORRECT OTP
            // =====================================

            user.loginOtpHash =
                null;

            user.loginOtpExpires =
                null;

            user.loginOtpAttempts =
                0;


            await user.save();


            const token =
                generateToken(
                    user._id
                );


            return res.json({

                success: true,

                message:
                    "OTP verified. Login successful.",

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
                "Verify Login OTP Error:",
                error
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Could not verify OTP"

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


            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            const user =
                await User.findOne({
                    email:
                        normalizedEmail
                });


            if (!user) {

                return res.json({

                    success: true,

                    message:
                        "If an account exists with this email, an OTP has been sent."

                });

            }


            // =====================================
            // GENERATE RESET OTP
            // =====================================

            const otp =
                generateOtp();


            user.resetOtpHash =
                hashOtp(
                    otp
                );


            user.resetOtpExpires =
                new Date(
                    Date.now() +
                    5 * 60 * 1000
                );


            user.resetOtpAttempts =
                0;


            await user.save();


            // =====================================
            // SEND RESET OTP
            // =====================================

            try {

                await sendEmail({

                    to:
                        user.email,

                    subject:
                        "StudyRoom AI Password Reset OTP",

                    html: `
                        <div style="
                            font-family: Arial, sans-serif;
                            max-width: 520px;
                            margin: auto;
                            padding: 24px;
                        ">

                            <h2>
                                StudyRoom AI
                            </h2>

                            <p>
                                Hello ${user.name},
                            </p>

                            <p>
                                Your password reset OTP is:
                            </p>

                            <div style="
                                font-size: 32px;
                                font-weight: bold;
                                letter-spacing: 8px;
                                margin: 24px 0;
                            ">
                                ${otp}
                            </div>

                            <p>
                                This OTP is valid for
                                <strong>5 minutes</strong>.
                            </p>

                            <p>
                                If you did not request a password reset,
                                you can ignore this email.
                            </p>

                        </div>
                    `

                });

            } catch (emailError) {

                console.error(
                    "Reset OTP Email Error:",
                    emailError
                );


                user.resetOtpHash =
                    null;

                user.resetOtpExpires =
                    null;

                user.resetOtpAttempts =
                    0;


                await user.save();


                return res
                    .status(500)
                    .json({

                        success: false,

                        message:
                            "Could not send password reset OTP"

                    });

            }


            return res.json({

                success: true,

                otpRequired: true,

                message:
                    "Password reset OTP sent successfully.",

                email:
                    user.email

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
                        "Could not process password reset request"

                });

        }

    };

    // =====================================
// VERIFY RESET OTP
// POST /api/auth/verify-reset-otp
// =====================================

const verifyResetOtp =
    async (req, res) => {

        try {

            const {
                email,
                otp
            } = req.body;


            if (
                !email ||
                !otp
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Email and OTP are required"

                    });

            }


            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            const user =
                await User.findOne({

                    email:
                        normalizedEmail

                });


            if (
                !user ||
                !user.resetOtpHash ||
                !user.resetOtpExpires
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "OTP is invalid or expired"

                    });

            }


            // =====================================
            // CHECK OTP EXPIRY
            // =====================================

            if (
                user.resetOtpExpires.getTime() <
                Date.now()
            ) {

                user.resetOtpHash =
                    null;

                user.resetOtpExpires =
                    null;

                user.resetOtpAttempts =
                    0;


                await user.save();


                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "OTP has expired. Please request a new OTP."

                    });

            }


            // =====================================
            // CHECK MAX ATTEMPTS
            // =====================================

            if (
                user.resetOtpAttempts >= 5
            ) {

                user.resetOtpHash =
                    null;

                user.resetOtpExpires =
                    null;

                user.resetOtpAttempts =
                    0;


                await user.save();


                return res
                    .status(429)
                    .json({

                        success: false,

                        message:
                            "Too many incorrect attempts. Please request a new OTP."

                    });

            }


            const enteredOtp =
                String(
                    otp
                ).trim();


            if (
                !/^\d{6}$/.test(
                    enteredOtp
                )
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Please enter a valid 6-digit OTP"

                    });

            }


            const enteredOtpHash =
                hashOtp(
                    enteredOtp
                );


            // =====================================
            // WRONG OTP
            // =====================================

            if (
                enteredOtpHash !==
                user.resetOtpHash
            ) {

                user.resetOtpAttempts +=
                    1;


                await user.save();


                const remainingAttempts =
                    Math.max(

                        0,

                        5 -
                        user.resetOtpAttempts

                    );


                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            `Incorrect OTP. ${remainingAttempts} attempt(s) remaining.`

                    });

            }


            // =====================================
            // OTP CORRECT
            // =====================================

            user.resetOtpHash =
                null;

            user.resetOtpExpires =
                null;

            user.resetOtpAttempts =
                0;


            // Create temporary reset token

            const resetToken =
                crypto
                    .randomBytes(32)
                    .toString("hex");


            const hashedResetToken =
                crypto
                    .createHash("sha256")
                    .update(resetToken)
                    .digest("hex");


            user.resetPasswordToken =
                hashedResetToken;


            user.resetPasswordExpires =
                new Date(
                    Date.now() +
                    15 * 60 * 1000
                );


            await user.save();


            return res.json({

                success: true,

                message:
                    "OTP verified successfully.",

                resetToken

            });

        } catch (error) {

            console.error(
                "Verify Reset OTP Error:",
                error
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Could not verify password reset OTP"

                });

        }

    };


// =====================================
// RESET PASSWORD
// CURRENT TOKEN-BASED VERSION
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


            if (!token) {

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
                    .createHash(
                        "sha256"
                    )
                    .update(
                        token
                    )
                    .digest(
                        "hex"
                    );


            const user =
                await User.findOne({

                    resetPasswordToken:
                        hashedToken,

                    resetPasswordExpires: {
                        $gt:
                            new Date()
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


// =====================================
// EXPORTS
// =====================================

module.exports = {

    registerUser,

    loginUser,

    verifyLoginOtp,

    forgotPassword,

    verifyResetOtp,

    resetPassword

};