const express = require("express");

const protect = require(
    "../middleware/authMiddleware"
);

const noteUpload = require(
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


const router = express.Router();


// =====================================
// PROTECT ALL NOTE ROUTES
// =====================================

router.use(protect);


// =====================================
// GET ALL NOTES
// =====================================

router.get(
    "/",
    getNotes
);


// =====================================
// CREATE NOTE
// MAXIMUM 10 IMAGES
// =====================================

router.post(
    "/",
    noteUpload.array(
        "noteImages",
        10
    ),
    createNote
);


// =====================================
// UPDATE NOTE
// MAXIMUM 10 NEW IMAGES
// =====================================

router.put(
    "/:id",
    noteUpload.array(
        "noteImages",
        10
    ),
    updateNote
);


// =====================================
// PIN / UNPIN NOTE
// =====================================

router.patch(
    "/:id/pin",
    togglePin
);


// =====================================
// DELETE NOTE
// =====================================

router.delete(
    "/:id",
    deleteNote
);


// =====================================
// EXPORT
// =====================================

module.exports = router;