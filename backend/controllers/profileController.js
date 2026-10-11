const Profile =
    require("../models/Profile");


// =====================================
// GET PROFILE
// =====================================

const getProfile =
    async (req, res) => {

        try {

            let profile =
                await Profile.findOne({
                    user:
                        req.user._id
                });


            if (!profile) {

                profile =
                    await Profile.create({

                        user:
                            req.user._id,

                        dailyStudyGoal:
                            120

                    });

            }


            res.json({

                success: true,

                profile: {

                    name:
                        req.user.name,

                    email:
                        req.user.email,

                    course:
                        profile.course,

                    semester:
                        profile.semester,

                    dailyStudyGoal:
                        profile.dailyStudyGoal,

                    examDate:
                        profile.examDate,

                    mainGoal:
                        profile.mainGoal

                }

            });

        } catch (error) {

            console.error(
                "Get Profile Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Could not load profile"

            });

        }

    };


// =====================================
// UPDATE PROFILE
// =====================================

const updateProfile =
    async (req, res) => {

        try {

            const {
                course,
                semester,
                dailyStudyGoal,
                examDate,
                mainGoal
            } = req.body;


            const goalMinutes =
                Number(
                    dailyStudyGoal
                );


            if (
                !Number.isFinite(
                    goalMinutes
                )
                ||
                goalMinutes < 15
                ||
                goalMinutes > 720
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Daily study goal must be between 15 and 720 minutes"

                    });

            }


            let parsedExamDate =
                null;


            if (examDate) {

                parsedExamDate =
                    new Date(
                        `${examDate}T00:00:00`
                    );


                if (
                    Number.isNaN(
                        parsedExamDate.getTime()
                    )
                ) {

                    return res
                        .status(400)
                        .json({

                            success: false,

                            message:
                                "Invalid exam date"

                        });

                }

            }


            const profile =
                await Profile.findOneAndUpdate(

                    {
                        user:
                            req.user._id
                    },

                    {
                        user:
                            req.user._id,

                        course:
                            course?.trim() || "",

                        semester:
                            semester?.trim() || "",

                        dailyStudyGoal:
                            goalMinutes,

                        examDate:
                            parsedExamDate,

                        mainGoal:
                            mainGoal?.trim() || ""
                    },

                    {
                        new: true,
                        upsert: true,
                        runValidators: true
                    }

                );


            res.json({

                success: true,

                message:
                    "Profile updated successfully",

                profile

            });

        } catch (error) {

            console.error(
                "Update Profile Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Could not update profile"

            });

        }

    };


module.exports = {
    getProfile,
    updateProfile
};