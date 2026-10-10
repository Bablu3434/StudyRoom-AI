const express =
    require("express");

const {
    registerUser,
    loginUser
} = require(
    "../controllers/authController"
);

const protect =
    require(
        "../middleware/authMiddleware"
    );


const router =
    express.Router();


// Register

router.post(
    "/register",
    registerUser
);


// Login

router.post(
    "/login",
    loginUser
);


// Logged-in user details

router.get(
    "/me",
    protect,
    async (req, res) => {

        res.json({

            success: true,

            user: {
                id:
                    req.user._id,

                name:
                    req.user.name,

                email:
                    req.user.email
            }

        });

    }
);


module.exports =
    router;