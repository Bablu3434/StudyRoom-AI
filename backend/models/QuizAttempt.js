const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
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

        score: {
            type: Number,
            required: true,
            min: 0
        },

        totalQuestions: {
            type: Number,
            required: true,
            min: 1,
            max: 100
        },

        percentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100
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
        "QuizAttempt",
        quizAttemptSchema
    );