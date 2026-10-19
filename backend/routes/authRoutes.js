const express =
    require("express");


const {
    registerUser,
    loginUser,
    verifyLoginOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword
} =
    require("../controllers/authController");


const protect =
    require("../middleware/authMiddleware");


const router =
    express.Router();


// =====================================
// REGISTER
// =====================================

router.post(
    "/register",
    registerUser
);


// =====================================
// LOGIN
// =====================================

router.post(
    "/login",
    loginUser
);


// =====================================
// VERIFY LOGIN OTP
// =====================================

router.post(
    "/verify-login-otp",
    verifyLoginOtp
);


// =====================================
// FORGOT PASSWORD
// =====================================

router.post(
    "/forgot-password",
    forgotPassword
);

// =====================================
// VERIFY RESET OTP
// =====================================

router.post(
    "/verify-reset-otp",
    verifyResetOtp
);

// =====================================
// RESET PASSWORD
// =====================================

router.post(
    "/reset-password/:token",
    resetPassword
);


// =====================================
// CURRENT USER
// =====================================

router.get(
    "/me",
    protect,
    (req, res) => {

        return res.json({

            success: true,

            user:
                req.user

        });

    }
);


module.exports =
    router;