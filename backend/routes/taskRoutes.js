const express =
    require("express");

const protect =
    require(
        "../middleware/authMiddleware"
    );

const {
    getTasks,
    createTask,
    updateTask,
    toggleTask,
    deleteTask
} = require(
    "../controllers/taskController"
);


const router =
    express.Router();


router.use(protect);


router
    .route("/")
    .get(getTasks)
    .post(createTask);


router
    .route("/:id")
    .put(updateTask)
    .delete(deleteTask);


router.patch(
    "/:id/toggle",
    toggleTask
);


module.exports =
    router;