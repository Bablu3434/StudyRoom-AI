const Note =
    require("../models/Note");

const cloudinary =
    require("../config/cloudinary");

const fs =
    require("fs");

const path =
    require("path");


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
// GET CLOUDINARY PUBLIC ID FROM URL
// Fallback for older Cloudinary records
// =====================================

function getPublicIdFromCloudinaryUrl(
    imageUrl
) {

    try {

        if (
            !imageUrl ||
            !imageUrl.includes(
                "res.cloudinary.com"
            )
        ) {

            return null;

        }


        const url =
            new URL(
                imageUrl
            );


        const uploadPart =
            "/upload/";


        const uploadIndex =
            url.pathname.indexOf(
                uploadPart
            );


        if (
            uploadIndex === -1
        ) {

            return null;

        }


        let publicPath =
            url.pathname.substring(
                uploadIndex +
                uploadPart.length
            );


        const parts =
            publicPath.split(
                "/"
            );


        // Remove Cloudinary version:
        // v123456789

        if (
            parts[0] &&
            /^v\d+$/.test(
                parts[0]
            )
        ) {

            parts.shift();

        }


        publicPath =
            parts.join(
                "/"
            );


        // Remove extension

        publicPath =
            publicPath.replace(
                /\.[^/.]+$/,
                ""
            );


        return (
            publicPath ||
            null
        );

    } catch (error) {

        return null;

    }

}


// =====================================
// DELETE OLD LOCAL IMAGE
// Compatibility with old notes
// =====================================

function deleteLocalImage(
    imageUrl
) {

    try {

        if (
            !imageUrl ||
            !imageUrl.startsWith(
                "/uploads/notes/"
            )
        ) {

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
            "Delete Local Image Error:",
            error
        );

    }

}


// =====================================
// DELETE ONE STORED IMAGE
// Cloudinary + old local support
// =====================================

async function deleteStoredImage(
    imageUrl,
    publicId
) {

    try {

        // =================================
        // CLOUDINARY IMAGE
        // =================================

        const cloudinaryPublicId =
            publicId ||
            getPublicIdFromCloudinaryUrl(
                imageUrl
            );


        if (
            cloudinaryPublicId
        ) {

            await cloudinary.uploader.destroy(
                cloudinaryPublicId,
                {
                    resource_type:
                        "image"
                }
            );


            return;

        }


        // =================================
        // OLD LOCAL IMAGE
        // =================================

        deleteLocalImage(
            imageUrl
        );

    } catch (error) {

        console.error(
            "Delete Stored Image Error:",
            error
        );

    }

}


// =====================================
// DELETE MULTIPLE STORED IMAGES
// =====================================

async function deleteStoredImages(
    imageEntries = []
) {

    await Promise.allSettled(

        imageEntries.map(
            entry =>
                deleteStoredImage(
                    entry.url,
                    entry.publicId
                )
        )

    );

}


// =====================================
// GET UPLOADED FILE ENTRIES
//
// Cloudinary storage gives:
//
// file.path     -> secure image URL
// file.filename -> Cloudinary public ID
// =====================================

function getUploadedImageEntries(
    files = []
) {

    return files
        .filter(
            file =>
                file &&
                file.path
        )
        .map(
            file => ({

                url:
                    file.path,

                publicId:
                    file.filename || ""

            })
        );

}


// =====================================
// CLEANUP NEW CLOUDINARY UPLOADS
// Used when DB validation/save fails
// =====================================

async function cleanupUploadedFiles(
    files = []
) {

    const entries =
        getUploadedImageEntries(
            files
        );


    await deleteStoredImages(
        entries
    );

}


// =====================================
// NORMALIZE STORED IMAGES
// Supports:
//
// imageUrls[]
// imagePublicIds[]
// legacy imageUrl
// =====================================

function getStoredImageEntries(
    note
) {

    const entries = [];


    const imageUrls =
        Array.isArray(
            note.imageUrls
        )
            ? note.imageUrls
            : [];


    const publicIds =
        Array.isArray(
            note.imagePublicIds
        )
            ? note.imagePublicIds
            : [];


    imageUrls.forEach(
        (url, index) => {

            if (!url) {

                return;

            }


            if (
                entries.some(
                    item =>
                        item.url === url
                )
            ) {

                return;

            }


            entries.push({

                url,

                publicId:
                    publicIds[index] ||
                    getPublicIdFromCloudinaryUrl(
                        url
                    ) ||
                    ""

            });

        }
    );


    // =================================
    // OLD SINGLE IMAGE SUPPORT
    // =================================

    if (
        note.imageUrl &&
        !entries.some(
            item =>
                item.url ===
                note.imageUrl
        )
    ) {

        entries.unshift({

            url:
                note.imageUrl,

            publicId:
                getPublicIdFromCloudinaryUrl(
                    note.imageUrl
                ) ||
                ""

        });

    }


    return entries;

}


// =====================================
// GET ALL NOTES
// =====================================

const getNotes =
    async (
        req,
        res
    ) => {

        try {

            const notes =
                await Note.find({
                    user:
                        req.user._id
                })
                    .sort({
                        pinned:
                            -1,

                        updatedAt:
                            -1
                    });


            res.json({
                success:
                    true,

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
                    success:
                        false,

                    message:
                        "Failed to load notes"
                });

        }

    };


// =====================================
// CREATE NOTE
// MULTIPLE CLOUDINARY IMAGES
// =====================================

const createNote =
    async (
        req,
        res
    ) => {

        const uploadedFiles =
            req.files || [];


        try {

            const {
                title,
                subject,
                content,
                pinned
            } = req.body;


            // =================================
            // TITLE + SUBJECT REQUIRED
            // =================================

            if (
                !title?.trim() ||
                !subject?.trim()
            ) {

                await cleanupUploadedFiles(
                    uploadedFiles
                );


                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "Title and subject are required"
                    });

            }


            // =================================
            // TEXT OR PHOTO REQUIRED
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
                        success:
                            false,

                        message:
                            "Please write a note or upload at least one photo"
                    });

            }


            // =================================
            // MAXIMUM 10 PHOTOS
            // =================================

            if (
                uploadedFiles.length >
                10
            ) {

                await cleanupUploadedFiles(
                    uploadedFiles
                );


                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "A note can contain maximum 10 photos"
                    });

            }


            // =================================
            // CLOUDINARY DATA
            // =================================

            const uploadedImages =
                getUploadedImageEntries(
                    uploadedFiles
                );


            const imageUrls =
                uploadedImages.map(
                    image =>
                        image.url
                );


            const imagePublicIds =
                uploadedImages.map(
                    image =>
                        image.publicId
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

                    imageUrls,

                    imagePublicIds,

                    // Legacy frontend compatibility

                    imageUrl:
                        imageUrls[0] ||
                        null,

                    pinned:
                        toBoolean(
                            pinned
                        )

                });


            res
                .status(201)
                .json({
                    success:
                        true,

                    message:
                        "Note created successfully",

                    note
                });

        } catch (error) {

            console.error(
                "Create Note Error:",
                error
            );


            // Uploaded to Cloudinary but
            // DB operation failed

            await cleanupUploadedFiles(
                uploadedFiles
            );


            res
                .status(500)
                .json({
                    success:
                        false,

                    message:
                        "Failed to create note"
                });

        }

    };


// =====================================
// UPDATE NOTE
// ADD / REMOVE CLOUDINARY PHOTOS
// =====================================

const updateNote =
    async (
        req,
        res
    ) => {

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

                await cleanupUploadedFiles(
                    uploadedFiles
                );


                return res
                    .status(404)
                    .json({
                        success:
                            false,

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
            // CURRENT SAVED IMAGES
            // =================================

            let currentImages =
                getStoredImageEntries(
                    note
                );


            // Images to remove from Cloudinary
            // AFTER successful DB save

            const imagesToDelete =
                [];


            // =================================
            // TITLE
            // =================================

            if (
                title !== undefined
            ) {

                if (
                    !title.trim()
                ) {

                    await cleanupUploadedFiles(
                        uploadedFiles
                    );


                    return res
                        .status(400)
                        .json({
                            success:
                                false,

                            message:
                                "Title cannot be empty"
                        });

                }


                note.title =
                    title.trim();

            }


            // =================================
            // SUBJECT
            // =================================

            if (
                subject !== undefined
            ) {

                if (
                    !subject.trim()
                ) {

                    await cleanupUploadedFiles(
                        uploadedFiles
                    );


                    return res
                        .status(400)
                        .json({
                            success:
                                false,

                            message:
                                "Subject cannot be empty"
                        });

                }


                note.subject =
                    subject.trim();

            }


            // =================================
            // CONTENT
            // =================================

            if (
                content !== undefined
            ) {

                note.content =
                    content.trim();

            }


            // =================================
            // PIN
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
            // OLD FRONTEND:
            // REMOVE ALL IMAGES
            // =================================

            if (
                removeImage ===
                    "true" ||
                removeImage ===
                    true
            ) {

                imagesToDelete.push(
                    ...currentImages
                );


                currentImages =
                    [];

            }


            // =================================
            // REMOVE SELECTED IMAGES
            //
            // removeImages =
            // JSON.stringify([...URLs])
            // =================================

            if (
                removeImages
            ) {

                let urlsToRemove =
                    [];


                try {

                    if (
                        Array.isArray(
                            removeImages
                        )
                    ) {

                        urlsToRemove =
                            removeImages;

                    } else {

                        urlsToRemove =
                            JSON.parse(
                                removeImages
                            );

                    }

                } catch (error) {

                    console.warn(
                        "Invalid removeImages value:",
                        error
                    );

                }


                if (
                    Array.isArray(
                        urlsToRemove
                    )
                ) {

                    currentImages =
                        currentImages.filter(
                            image => {

                                if (
                                    urlsToRemove.includes(
                                        image.url
                                    )
                                ) {

                                    imagesToDelete.push(
                                        image
                                    );


                                    return false;

                                }


                                return true;

                            }
                        );

                }

            }


            // =================================
            // NEW CLOUDINARY IMAGES
            // =================================

            const newImages =
                getUploadedImageEntries(
                    uploadedFiles
                );


            // =================================
            // MAXIMUM 10 IMAGES TOTAL
            // =================================

            if (
                currentImages.length +
                newImages.length >
                10
            ) {

                await cleanupUploadedFiles(
                    uploadedFiles
                );


                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "A note can contain maximum 10 photos"
                    });

            }


            const finalImages = [
                ...currentImages,
                ...newImages
            ];


            // =================================
            // MUST HAVE TEXT OR PHOTO
            // =================================

            const hasContent =
                Boolean(
                    note.content?.trim()
                );


            const hasImages =
                finalImages.length > 0;


            if (
                !hasContent &&
                !hasImages
            ) {

                await cleanupUploadedFiles(
                    uploadedFiles
                );


                return res
                    .status(400)
                    .json({
                        success:
                            false,

                        message:
                            "A note must contain text or at least one photo"
                    });

            }


            // =================================
            // SAVE NEW IMAGE DATA
            // =================================

            note.imageUrls =
                finalImages.map(
                    image =>
                        image.url
                );


            // Keep array indexes aligned.
            // Old local images can have "".

            note.imagePublicIds =
                finalImages.map(
                    image =>
                        image.publicId ||
                        ""
                );


            // Legacy compatibility

            note.imageUrl =
                note.imageUrls[0] ||
                null;


            // =================================
            // SAVE DATABASE FIRST
            // =================================

            await note.save();


            // =================================
            // NOW DELETE REMOVED CLOUDINARY
            // IMAGES
            //
            // DB save already succeeded,
            // so note won't point to deleted images.
            // =================================

            await deleteStoredImages(
                imagesToDelete
            );


            res.json({
                success:
                    true,

                message:
                    "Note updated successfully",

                note
            });

        } catch (error) {

            console.error(
                "Update Note Error:",
                error
            );


            // Only delete newly uploaded
            // Cloudinary files on failure.

            await cleanupUploadedFiles(
                uploadedFiles
            );


            res
                .status(500)
                .json({
                    success:
                        false,

                    message:
                        "Failed to update note"
                });

        }

    };


// =====================================
// TOGGLE PIN
// =====================================

const togglePin =
    async (
        req,
        res
    ) => {

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
                        success:
                            false,

                        message:
                            "Note not found"
                    });

            }


            note.pinned =
                !note.pinned;


            await note.save();


            res.json({
                success:
                    true,

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
                    success:
                        false,

                    message:
                        "Failed to update pin"
                });

        }

    };


// =====================================
// DELETE NOTE
// DELETE CLOUDINARY IMAGES TOO
// =====================================

const deleteNote =
    async (
        req,
        res
    ) => {

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
                        success:
                            false,

                        message:
                            "Note not found"
                    });

            }


            // =================================
            // COLLECT ALL STORED IMAGES
            // =================================

            const storedImages =
                getStoredImageEntries(
                    note
                );


            // =================================
            // DELETE NOTE FROM DATABASE
            // =================================

            await note.deleteOne();


            // =================================
            // DELETE IMAGES FROM CLOUDINARY
            // / LOCAL LEGACY STORAGE
            // =================================

            await deleteStoredImages(
                storedImages
            );


            res.json({
                success:
                    true,

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
                    success:
                        false,

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