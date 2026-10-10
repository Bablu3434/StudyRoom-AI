const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
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


const subjectSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        code: {
            type: String,
            trim: true,
            default: ""
        },

        targetHours: {
            type: Number,
            default: 20,
            min: 1
        },

        topics: [topicSchema]
    },
    {
        timestamps: true
    }
);


module.exports =
    mongoose.model(
        "Subject",
        subjectSchema
    );