const mongoose = require("mongoose");

const studyTaskSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 60
        },

        topic: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        duration: {
            type: Number,
            required: true,
            min: 1,
            max: 300
        },

        studyDate: {
            type: String,
            required: true
        },

        priority: {
            type: String,
            enum: [
                "low",
                "medium",
                "high"
            ],
            default: "medium"
        },

        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "StudyTask",
        studyTaskSchema
    );