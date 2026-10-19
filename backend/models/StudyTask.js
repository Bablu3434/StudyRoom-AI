const mongoose =
    require("mongoose");


const studyTaskSchema =
    new mongoose.Schema(
        {

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


            topic: {
                type:
                    String,
                required:
                    true,
                trim:
                    true,
                maxlength:
                    100
            },


            duration: {
                type:
                    Number,
                required:
                    true,
                min:
                    1,
                max:
                    300
            },


            // =====================================
            // STUDY DATE
            // Example: 2026-10-19
            // =====================================

            studyDate: {
                type:
                    String,
                required:
                    true
            },


            // =====================================
            // STUDY TIME
            // Example: 18:30
            // =====================================

            studyTime: {
                type:
                    String,
                required:
                    true,

                validate: {
                    validator:
                        function (value) {

                            return (
                                /^([01]\d|2[0-3]):([0-5]\d)$/
                                    .test(value)
                            );

                        },

                    message:
                        "Study time must be in HH:MM format"
                }
            },


            priority: {
                type:
                    String,

                enum: [
                    "low",
                    "medium",
                    "high"
                ],

                default:
                    "medium"
            },


            completed: {
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


module.exports =
    mongoose.model(
        "StudyTask",
        studyTaskSchema
    );