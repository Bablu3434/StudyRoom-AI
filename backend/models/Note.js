const mongoose =
    require("mongoose");


const noteSchema =
    new mongoose.Schema(
        {

            // =====================================
            // USER
            // =====================================

            user: {

                type:
                    mongoose.Schema.Types.ObjectId,

                ref:
                    "User",

                required:
                    true,

                index:
                    true

            },


            // =====================================
            // TITLE
            // =====================================

            title: {

                type:
                    String,

                required:
                    true,

                trim:
                    true,

                maxlength:
                    100

            },


            // =====================================
            // SUBJECT
            // =====================================

            subject: {

                type:
                    String,

                required:
                    true,

                trim:
                    true,

                maxlength:
                    60

            },


            // =====================================
            // NOTE CONTENT
            // Text optional because photo-only
            // note bhi save ho sakta hai
            // =====================================

            content: {

                type:
                    String,

                default:
                    "",

                trim:
                    true

            },


            // =====================================
            // MULTIPLE IMAGES
            // Maximum limit route/controller
            // handle karega
            // =====================================

            imageUrls: {

                type: [
                    String
                ],

                default:
                    []

            },


            imagePublicIds: {
    type: [
        String
    ],
    default: []
},


            // =====================================
            // OLD SINGLE IMAGE
            // Existing notes ke liye temporarily
            // rakha hai
            // =====================================

            imageUrl: {

                type:
                    String,

                default:
                    null

            },


            // =====================================
            // PIN
            // =====================================

            pinned: {

                type:
                    Boolean,

                default:
                    false

            }

        },

        {

            timestamps:
                true

        }
    );


// =====================================
// EXPORT MODEL
// =====================================

module.exports =
    mongoose.model(
        "Note",
        noteSchema
    );