const multer =
    require("multer");

const {
    CloudinaryStorage
} = require(
    "multer-storage-cloudinary"
);

const cloudinary =
    require(
        "../config/cloudinary"
    );


// =====================================
// CLOUDINARY STORAGE
// =====================================

const storage =
    new CloudinaryStorage({

        cloudinary,

        params: async (
            req,
            file
        ) => {

            return {

                folder:
                    "studyroom-ai/notes",

                resource_type:
                    "image",

                allowed_formats: [
                    "jpg",
                    "jpeg",
                    "png",
                    "webp"
                ],

                public_id:
                    `note-${Date.now()}-${Math.round(
                        Math.random() *
                        1e9
                    )}`

            };

        }

    });


// =====================================
// IMAGE FILTER
// =====================================

const fileFilter =
    (
        req,
        file,
        cb
    ) => {

        const allowedTypes = [

            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"

        ];


        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {

            cb(
                null,
                true
            );

        } else {

            cb(
                new Error(
                    "Only JPG, PNG and WEBP images are allowed."
                ),
                false
            );

        }

    };


// =====================================
// MULTER UPLOAD
// =====================================

const noteUpload =
    multer({

        storage,

        fileFilter,

        limits: {

            fileSize:
                5 *
                1024 *
                1024

        }

    });


// =====================================
// EXPORT
// =====================================

module.exports =
    noteUpload;