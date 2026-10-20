const Note =
    require("../models/Note");

const fs =
    require("fs");

const path =
    require("path");


// =====================================
// HELPER - CONVERT FORM VALUE TO BOOLEAN
// =====================================

function toBoolean(value) {

    if (
        value === true ||
        value === "true"
    ) {
        return true;
    }

    return false;
}


// =====================================
// HELPER - DELETE OLD IMAGE
// =====================================

function deleteNoteImage(
    imageUrl
) {

    try {

        if (!imageUrl) {
            return;
        }


        const relativePath =
            imageUrl.replace(
                /^\/+/,
                ""
            );


        const fullPath =
            path.join(
                __dirname,
                "..",
                relativePath
            );


        if (
            fs.existsSync(
                fullPath
            )
        ) {

            fs.unlinkSync(
                fullPath
            );

        }

    } catch (error) {

        console.error(
            "Delete Note Image Error:",
            error
        );

    }

}


// =====================================
// GET ALL NOTES
// =====================================

const getNotes =
    async (req, res) => {

        try {

            const notes =
                await Note.find({
                    user:
                        req.user._id
                })
                    .sort({
                        pinned: -1,
                        updatedAt: -1
                    });


            res.json({
                success: true,
                notes
            });

        } catch (error) {

            console.error(
                "Get Notes Error:",
                error
            );


            res
                .status(500)
                .json({
                    success: false,
                    message:
                        "Failed to load notes"
                });

        }

    };


// =====================================
// CREATE NOTE
// TEXT + PHOTO / PHOTO ONLY
// =====================================

const createNote =
    async (req, res) => {

        try {

            const {
                title,
                subject,
                content,
                pinned
            } = req.body;


            // -----------------------------
            // Required title + subject
            // -----------------------------

            if (
                !title?.trim() ||
                !subject?.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Title and subject are required"
                    });

            }


            // -----------------------------
            // Must contain text OR image
            // -----------------------------

            const hasContent =
                Boolean(
                    content?.trim()
                );


            const hasImage =
                Boolean(
                    req.file
                );


            if (
                !hasContent &&
                !hasImage
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Please write a note or upload a photo"
                    });

            }


            // -----------------------------
            // Image URL
            // -----------------------------

            const imageUrl =
                req.file
                    ? `/uploads/notes/${req.file.filename}`
                    : null;


            // -----------------------------
            // Create Note
            // -----------------------------

            const note =
                await Note.create({

                    user:
                        req.user._id,

                    title:
                        title.trim(),

                    subject:
                        subject.trim(),

                    content:
                        content
                            ? content.trim()
                            : "",

                    imageUrl,

                    pinned:
                        toBoolean(
                            pinned
                        )

                });


            res
                .status(201)
                .json({
                    success: true,
                    message:
                        "Note created successfully",
                    note
                });

        } catch (error) {

            console.error(
                "Create Note Error:",
                error
            );


            // If DB save fails after
            // multer uploaded the image,
            // delete unused file.

            if (req.file) {

                deleteNoteImage(
                    `/uploads/notes/${req.file.filename}`
                );

            }


            res
                .status(500)
                .json({
                    success: false,
                    message:
                        "Failed to create note"
                });

        }

    };


// =====================================
// UPDATE NOTE
// TEXT + NEW PHOTO
// =====================================

const updateNote =
    async (req, res) => {

        try {

            const note =
                await Note.findOne({
                    _id:
                        req.params.id,

                    user:
                        req.user._id
                });


            if (!note) {

                // Remove uploaded image
                // if note does not exist.

                if (req.file) {

                    deleteNoteImage(
                        `/uploads/notes/${req.file.filename}`
                    );

                }


                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Note not found"
                    });

            }


            const {
                title,
                subject,
                content,
                pinned,
                removeImage
            } = req.body;


            // -----------------------------
            // Update title
            // -----------------------------

            if (
                title !== undefined
            ) {

                if (
                    !title.trim()
                ) {

                    return res
                        .status(400)
                        .json({
                            success: false,
                            message:
                                "Title cannot be empty"
                        });

                }


                note.title =
                    title.trim();

            }


            // -----------------------------
            // Update subject
            // -----------------------------

            if (
                subject !== undefined
            ) {

                if (
                    !subject.trim()
                ) {

                    return res
                        .status(400)
                        .json({
                            success: false,
                            message:
                                "Subject cannot be empty"
                        });

                }


                note.subject =
                    subject.trim();

            }


            // -----------------------------
            // Update content
            // -----------------------------

            if (
                content !== undefined
            ) {

                note.content =
                    content.trim();

            }


            // -----------------------------
            // Update pin
            // -----------------------------

            if (
                pinned !== undefined
            ) {

                note.pinned =
                    toBoolean(
                        pinned
                    );

            }


            // -----------------------------
            // Remove current image
            // -----------------------------

            if (
                removeImage === "true" ||
                removeImage === true
            ) {

                if (
                    note.imageUrl
                ) {

                    deleteNoteImage(
                        note.imageUrl
                    );

                }


                note.imageUrl =
                    null;

            }


            // -----------------------------
            // Replace with new image
            // -----------------------------

            if (
                req.file
            ) {

                // Delete old photo

                if (
                    note.imageUrl
                ) {

                    deleteNoteImage(
                        note.imageUrl
                    );

                }


                note.imageUrl =
                    `/uploads/notes/${req.file.filename}`;

            }


            // -----------------------------
            // Must still have text OR image
            // -----------------------------

            const hasContent =
                Boolean(
                    note.content?.trim()
                );


            const hasImage =
                Boolean(
                    note.imageUrl
                );


            if (
                !hasContent &&
                !hasImage
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "A note must contain text or a photo"
                    });

            }


            await note.save();


            res.json({
                success: true,
                message:
                    "Note updated successfully",
                note
            });

        } catch (error) {

            console.error(
                "Update Note Error:",
                error
            );


            res
                .status(500)
                .json({
                    success: false,
                    message:
                        "Failed to update note"
                });

        }

    };


// =====================================
// TOGGLE PIN
// =====================================

const togglePin =
    async (req, res) => {

        try {

            const note =
                await Note.findOne({
                    _id:
                        req.params.id,

                    user:
                        req.user._id
                });


            if (!note) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Note not found"
                    });

            }


            note.pinned =
                !note.pinned;


            await note.save();


            res.json({
                success: true,
                message:
                    note.pinned
                        ? "Note pinned"
                        : "Note unpinned",
                note
            });

        } catch (error) {

            console.error(
                "Toggle Pin Error:",
                error
            );


            res
                .status(500)
                .json({
                    success: false,
                    message:
                        "Failed to update pin"
                });

        }

    };


// =====================================
// DELETE NOTE
// ALSO DELETE PHOTO
// =====================================

const deleteNote =
    async (req, res) => {

        try {

            const note =
                await Note.findOne({
                    _id:
                        req.params.id,

                    user:
                        req.user._id
                });


            if (!note) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Note not found"
                    });

            }


            // Delete associated image

            if (
                note.imageUrl
            ) {

                deleteNoteImage(
                    note.imageUrl
                );

            }


            await note.deleteOne();


            res.json({
                success: true,
                message:
                    "Note deleted successfully"
            });

        } catch (error) {

            console.error(
                "Delete Note Error:",
                error
            );


            res
                .status(500)
                .json({
                    success: false,
                    message:
                        "Failed to delete note"
                });

        }

    };


// =====================================
// EXPORTS
// =====================================

module.exports = {
    getNotes,
    createNote,
    updateNote,
    togglePin,
    deleteNote
};