const express =
    require("express");


const protect =
    require(
        "../middleware/authMiddleware"
    );


const {
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    toggleTopic,
    deleteTopic
} = require(
    "../controllers/subjectController"
);


const router =
    express.Router();


router.use(protect);


router
    .route("/")
    .get(getSubjects)
    .post(createSubject);


router
    .route("/:id")
    .put(updateSubject)
    .delete(deleteSubject);


router.post(
    "/:id/topics",
    addTopic
);


router.put(
    "/:id/topics/:topicId",
    updateTopic
);


router.patch(
    "/:id/topics/:topicId/toggle",
    toggleTopic
);


router.delete(
    "/:id/topics/:topicId",
    deleteTopic
);


module.exports =
    router;