const express =
    require("express");

const protect =
    require(
        "../middleware/authMiddleware"
    );

const {
    getProgressSummary
} = require(
    "../controllers/progressController"
);


const router =
    express.Router();


router.use(
    protect
);


router.get(
    "/summary",
    getProgressSummary
);


module.exports =
    router;