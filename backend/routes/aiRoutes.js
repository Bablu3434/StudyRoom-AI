const express =
    require("express");

const protect =
    require(
        "../middleware/authMiddleware"
    );

const {
    askAI,
    getRecommendations,
    getAIHistory,
    clearAIHistory,
    getDailyPlan
} = require(
    "../controllers/aiController"
);


const router =
    express.Router();


router.use(
    protect
);


// Ask AI

router.post(
    "/ask",
    askAI
);


// Personalized recommendations

router.get(
    "/recommendations",
    getRecommendations
);


// AI chat history

router.get(
    "/history",
    getAIHistory
);


// Clear AI history

router.delete(
    "/history",
    clearAIHistory
);


// Daily study plan

router.get(
    "/daily-plan",
    getDailyPlan
);


module.exports =
    router;