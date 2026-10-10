const express =
    require("express");

const protect =
    require(
        "../middleware/authMiddleware"
    );

const {
    getNotes,
    createNote,
    updateNote,
    togglePin,
    deleteNote
} = require(
    "../controllers/noteController"
);


const router =
    express.Router();


router.use(protect);


router
    .route("/")
    .get(getNotes)
    .post(createNote);


router
    .route("/:id")
    .put(updateNote)
    .delete(deleteNote);


router.patch(
    "/:id/pin",
    togglePin
);


module.exports =
    router;