const express =
    require("express");

const protect =
    require(
        "../middleware/authMiddleware"
    );

const {
    getFocusSessions,
    createFocusSession
} = require(
    "../controllers/focusController"
);


const router =
    express.Router();


router.use(protect);


router
    .route("/")
    .get(getFocusSessions)
    .post(createFocusSession);


module.exports =
    router;