const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        subject: {
            type: String,
            required: true,
            trim: true,
            maxlength: 60
        },

        content: {
            type: String,
            required: true,
            trim: true
        },

        pinned: {
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
        "Note",
        noteSchema
    );