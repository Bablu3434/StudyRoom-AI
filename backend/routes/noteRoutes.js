const express =
    require("express");


const protect =
    require(
        "../middleware/authMiddleware"
    );


const noteUpload =
    require(
        "../middleware/noteUpload"
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


// =====================================
// PROTECT ALL NOTE ROUTES
// =====================================

router.use(
    protect
);


// =====================================
// GET ALL NOTES
// CREATE NOTE + IMAGE
// =====================================

router
    .route("/")
    .get(
        getNotes
    )
    .post(
        noteUpload.single(
            "noteImage"
        ),
        createNote
    );


// =====================================
// UPDATE NOTE + IMAGE
// DELETE NOTE
// =====================================

router
    .route("/:id")
    .put(
        noteUpload.single(
            "noteImage"
        ),
        updateNote
    )
    .delete(
        deleteNote
    );


// =====================================
// PIN / UNPIN NOTE
// =====================================

router.patch(
    "/:id/pin",
    togglePin
);


// =====================================
// EXPORT ROUTER
// =====================================

module.exports =
    router;