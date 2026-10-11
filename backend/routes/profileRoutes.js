const express =
    require("express");

const protect =
    require(
        "../middleware/authMiddleware"
    );

const {
    getProfile,
    updateProfile
} = require(
    "../controllers/profileController"
);


const router =
    express.Router();


router.use(
    protect
);


router
    .route("/")
    .get(getProfile)
    .put(updateProfile);


module.exports =
    router;