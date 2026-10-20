const Note = require("../models/Note");

const fs = require("fs");
const path = require("path");


// =====================================
// BOOLEAN HELPER
// =====================================

function toBoolean(value) {

    return (
        value === true ||
        value === "true"
    );

}


// =====================================
// DELETE ONE IMAGE FROM DISK
// =====================================

function deleteNoteImage(imageUrl) {

    try {

        if (!imageUrl) {
            return;
        }


        const filename =
            path.basename(
                imageUrl
            );


        const fullPath =
            path.join(
                __dirname,
                "..",
                "uploads",
                "notes",
                filename
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
// DELETE MULTIPLE IMAGES
// =====================================

function deleteNoteImages(imageUrls = []) {

    imageUrls.forEach(
        imageUrl => {

            deleteNoteImage(
                imageUrl
            );

        }
    );

}


// =====================================
// GET UPLOADED IMAGE URLS
// req.files comes from multer.array()
// =====================================

function getUploadedImageUrls(files = []) {

    return files.map(
        file =>
            `/uploads/notes/${file.filename}`
    );

}


// =====================================
// CLEAN UP NEWLY UPLOADED FILES
// Used when request fails
// =====================================

function cleanupUploadedFiles(files = []) {

    const urls =
        getUploadedImageUrls(
            files
        );


    deleteNoteImages(
        urls
    );

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
// TEXT + MULTIPLE PHOTOS
// Maximum 10 images
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


            const uploadedFiles =
                req.files || [];


            // =================================
            // TITLE + SUBJECT REQUIRED
            // =================================

            if (
                !title?.trim() ||
                !subject?.trim()
            ) {

                cleanupUploadedFiles(
                    uploadedFiles
                );


                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Title and subject are required"
                    });

            }


            // =================================
            // TEXT OR IMAGE REQUIRED
            // =================================

            const hasContent =
                Boolean(
                    content?.trim()
                );


            const hasImages =
                uploadedFiles.length > 0;


            if (
                !hasContent &&
                !hasImages
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Please write a note or upload at least one photo"
                    });

            }


            // =================================
            // IMAGE URLS
            // =================================

            const imageUrls =
                getUploadedImageUrls(
                    uploadedFiles
                );


            // =================================
            // CREATE NOTE
            // =================================

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

                    imageUrls:
                        imageUrls,

                    // Keep first image here too
                    // for old frontend compatibility

                    imageUrl:
                        imageUrls[0] || null,

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


            cleanupUploadedFiles(
                req.files || []
            );


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
// ADD / REMOVE MULTIPLE PHOTOS
// =====================================

const updateNote =
    async (req, res) => {

        const uploadedFiles =
            req.files || [];


        try {

            const note =
                await Note.findOne({
                    _id:
                        req.params.id,

                    user:
                        req.user._id
                });


            if (!note) {

                cleanupUploadedFiles(
                    uploadedFiles
                );


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
                removeImage,
                removeImages
            } = req.body;


            // =================================
            // GET CURRENT IMAGES
            // =================================

            let currentImages =
                Array.isArray(
                    note.imageUrls
                )
                    ? [...note.imageUrls]
                    : [];


            // Old single image support

            if (
                note.imageUrl &&
                !currentImages.includes(
                    note.imageUrl
                )
            ) {

                currentImages.unshift(
                    note.imageUrl
                );

            }


            // =================================
            // UPDATE TITLE
            // =================================

            if (
                title !== undefined
            ) {

                if (
                    !title.trim()
                ) {

                    cleanupUploadedFiles(
                        uploadedFiles
                    );


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


            // =================================
            // UPDATE SUBJECT
            // =================================

            if (
                subject !== undefined
            ) {

                if (
                    !subject.trim()
                ) {

                    cleanupUploadedFiles(
                        uploadedFiles
                    );


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


            // =================================
            // UPDATE CONTENT
            // =================================

            if (
                content !== undefined
            ) {

                note.content =
                    content.trim();

            }


            // =================================
            // UPDATE PIN
            // =================================

            if (
                pinned !== undefined
            ) {

                note.pinned =
                    toBoolean(
                        pinned
                    );

            }


            // =================================
            // REMOVE ALL OLD IMAGES
            // Used by old frontend:
            // removeImage = true
            // =================================

            if (
                removeImage === "true" ||
                removeImage === true
            ) {

                deleteNoteImages(
                    currentImages
                );


                currentImages =
                    [];

            }


            // =================================
            // REMOVE SELECTED IMAGES
            //
            // Frontend can send:
            // removeImages = JSON.stringify([...])
            // =================================

            if (
                removeImages
            ) {

                let imagesToRemove =
                    [];


                try {

                    if (
                        Array.isArray(
                            removeImages
                        )
                    ) {

                        imagesToRemove =
                            removeImages;

                    } else {

                        imagesToRemove =
                            JSON.parse(
                                removeImages
                            );

                    }

                } catch (error) {

                    console.warn(
                        "Invalid removeImages value"
                    );

                }


                if (
                    Array.isArray(
                        imagesToRemove
                    )
                ) {

                    imagesToRemove
                        .forEach(
                            imageUrl => {

                                if (
                                    currentImages.includes(
                                        imageUrl
                                    )
                                ) {

                                    deleteNoteImage(
                                        imageUrl
                                    );


                                    currentImages =
                                        currentImages.filter(
                                            url =>
                                                url !== imageUrl
                                        );

                                }

                            }
                        );

                }

            }


            // =================================
            // NEW UPLOADED IMAGES
            // =================================

            const newImageUrls =
                getUploadedImageUrls(
                    uploadedFiles
                );


            // Maximum total 10 images

            if (
                currentImages.length +
                newImageUrls.length >
                10
            ) {

                cleanupUploadedFiles(
                    uploadedFiles
                );


                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "A note can contain maximum 10 photos"
                    });

            }


            currentImages.push(
                ...newImageUrls
            );


            // =================================
            // VALIDATION
            // Must have text OR photo
            // =================================

            const hasContent =
                Boolean(
                    note.content?.trim()
                );


            const hasImages =
                currentImages.length > 0;


            if (
                !hasContent &&
                !hasImages
            ) {

                cleanupUploadedFiles(
                    uploadedFiles
                );


                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "A note must contain text or at least one photo"
                    });

            }


            // =================================
            // SAVE IMAGE ARRAY
            // =================================

            note.imageUrls =
                currentImages;


            // First image retained for
            // existing frontend compatibility

            note.imageUrl =
                currentImages[0] || null;


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


            cleanupUploadedFiles(
                uploadedFiles
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
// DELETE ALL PHOTOS TOO
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


            // =================================
            // COLLECT ALL IMAGES
            // =================================

            const imagesToDelete =
                Array.isArray(
                    note.imageUrls
                )
                    ? [...note.imageUrls]
                    : [];


            // Old imageUrl support

            if (
                note.imageUrl &&
                !imagesToDelete.includes(
                    note.imageUrl
                )
            ) {

                imagesToDelete.push(
                    note.imageUrl
                );

            }


            // =================================
            // DELETE FILES
            // =================================

            deleteNoteImages(
                imagesToDelete
            );


            // =================================
            // DELETE DB NOTE
            // =================================

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