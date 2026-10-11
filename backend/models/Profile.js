const mongoose =
    require("mongoose");


const profileSchema =
    new mongoose.Schema(
        {
            user: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                unique: true,
                index: true
            },

            course: {
                type: String,
                trim: true,
                maxlength: 100,
                default: ""
            },

            semester: {
                type: String,
                trim: true,
                maxlength: 50,
                default: ""
            },

            dailyStudyGoal: {
                type: Number,
                min: 15,
                max: 720,
                default: 120
            },

            examDate: {
                type: Date,
                default: null
            },

            mainGoal: {
                type: String,
                trim: true,
                maxlength: 300,
                default: ""
            }
        },
        {
            timestamps: true
        }
    );


module.exports =
    mongoose.model(
        "Profile",
        profileSchema
    );