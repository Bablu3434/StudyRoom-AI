const mongoose =
    require("mongoose");


const dailyPlanSchema =
    new mongoose.Schema(
        {
            user: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
                index: true
            },

            date: {
                type: String,
                required: true
            },

            plan: {
                type: String,
                required: true
            }
        },
        {
            timestamps: true
        }
    );


dailyPlanSchema.index(
    {
        user: 1,
        date: 1
    },
    {
        unique: true
    }
);


module.exports =
    mongoose.model(
        "DailyPlan",
        dailyPlanSchema
    );