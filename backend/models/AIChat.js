const mongoose =
    require("mongoose");


const aiChatSchema =
    new mongoose.Schema(
        {
            user: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true
            },

            question: {
                type: String,
                required: true,
                trim: true,
                maxlength: 3000
            },

            answer: {
                type: String,
                required: true
            },

            subject: {
                type: String,
                trim: true,
                default: ""
            },

            topic: {
                type: String,
                trim: true,
                default: ""
            },

            mode: {
                type: String,
                default: "explain"
            }
        },
        {
            timestamps: true
        }
    );


module.exports =
    mongoose.model(
        "AIChat",
        aiChatSchema
    );