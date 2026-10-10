const FocusSession =
    require("../models/FocusSession");


// GET ALL FOCUS SESSIONS

const getFocusSessions =
    async (req, res) => {

        try {

            const sessions =
                await FocusSession.find({
                    user: req.user._id
                })
                .sort({
                    completedAt: -1
                });


            res.json({
                success: true,
                sessions
            });

        } catch (error) {

            console.error(
                "Get Focus Sessions Error:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Failed to load focus sessions"
            });

        }

    };


// CREATE COMPLETED SESSION

const createFocusSession =
    async (req, res) => {

        try {

            const {
                subject,
                minutes
            } = req.body;


            const numericMinutes =
                Number(minutes);


            if (
                !subject ||
                !Number.isFinite(
                    numericMinutes
                ) ||
                numericMinutes < 1 ||
                numericMinutes > 300
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Enter valid session details"
                    });

            }


            const session =
                await FocusSession.create({

                    user:
                        req.user._id,

                    subject:
                        subject.trim(),

                    minutes:
                        numericMinutes,

                    completedAt:
                        new Date()

                });


            res.status(201).json({
                success: true,
                message:
                    "Focus session saved",
                session
            });

        } catch (error) {

            console.error(
                "Create Focus Session Error:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Failed to save focus session"
            });

        }

    };


module.exports = {
    getFocusSessions,
    createFocusSession
};