const express =
    require("express");

const protect =
    require(
        "../middleware/authMiddleware"
    );

const {
    saveQuizAttempt,
    getQuizHistory,
    getQuizPerformance,
    getWeakTopics
} = require(
    "../controllers/quizController"
);


const router =
    express.Router();


router.use(protect);


router.post(
    "/attempts",
    saveQuizAttempt
);


router.get(
    "/history",
    getQuizHistory
);


router.get(
    "/performance",
    getQuizPerformance
);


router.get(
    "/weak-topics",
    getWeakTopics
);


module.exports =
    router;