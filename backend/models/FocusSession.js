const mongoose = require("mongoose");

const focusSessionSchema = new mongoose.Schema(
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
            maxlength: 100
        },

        minutes: {
            type: Number,
            required: true,
            min: 1,
            max: 300
        },

        completedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.model(
        "FocusSession",
        focusSessionSchema
    );