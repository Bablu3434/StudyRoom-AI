const express =
    require("express");


const {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword
} =
    require("../controllers/authController");


const protect =
    require("../middleware/authMiddleware");


const router =
    express.Router();


router.post(
    "/register",
    registerUser
);


router.post(
    "/login",
    loginUser
);


router.post(
    "/forgot-password",
    forgotPassword
);


router.post(
    "/reset-password/:token",
    resetPassword
);


router.get(
    "/me",
    protect,
    (req, res) => {

        res.json({

            success: true,

            user:
                req.user

        });

    }
);


module.exports =
    router;