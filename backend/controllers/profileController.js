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


            // Create default profile
            // if it does not exist
            if (!profile) {

                profile =
                    await Profile.create({

                        user:
                            req.user._id,

                        dailyStudyGoal:
                            120

                    });

            }


            return res.json({

                success: true,

                profile: {

                    name:
                        req.user.name,

                    email:
                        req.user.email,

                    course:
                        profile.course || "",

                    semester:
                        profile.semester || "",

                    dailyStudyGoal:
                        profile.dailyStudyGoal || 120,

                    examDate:
                        profile.examDate || null,

                    mainGoal:
                        profile.mainGoal || ""

                }

            });

        } catch (error) {

            console.error(
                "Get Profile Error:",
                error
            );


            return res
                .status(500)
                .json({

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
            } = req.body || {};


            // =================================
            // BUILD ONLY PROVIDED FIELDS
            // =================================

            const updateData = {

                user:
                    req.user._id

            };


            // =================================
            // COURSE
            // =================================

            if (
                typeof course ===
                "string"
            ) {

                updateData.course =
                    course.trim();

            }


            // =================================
            // SEMESTER
            // =================================

            if (
                typeof semester ===
                "string"
            ) {

                updateData.semester =
                    semester.trim();

            }


            // =================================
            // DAILY STUDY GOAL
            // =================================

            if (
                dailyStudyGoal !==
                undefined
            ) {

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

                            success:
                                false,

                            message:
                                "Daily study goal must be between 15 and 720 minutes"

                        });

                }


                updateData.dailyStudyGoal =
                    goalMinutes;

            }


            // =================================
            // EXAM DATE
            // =================================

            if (
                examDate !==
                undefined
            ) {

                if (
                    examDate === null ||
                    examDate === ""
                ) {

                    updateData.examDate =
                        null;

                } else {

                    const parsedExamDate =
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

                                success:
                                    false,

                                message:
                                    "Invalid exam date"

                            });

                    }


                    updateData.examDate =
                        parsedExamDate;

                }

            }


            // =================================
            // MAIN GOAL
            // =================================

            if (
                typeof mainGoal ===
                "string"
            ) {

                updateData.mainGoal =
                    mainGoal.trim();

            }


            // =================================
            // UPDATE PROFILE
            // =================================

            const profile =
                await Profile.findOneAndUpdate(

                    {
                        user:
                            req.user._id
                    },

                    updateData,

                    {
                        returnDocument:
                            "after",

                        upsert:
                            true,

                        runValidators:
                            true,

                        setDefaultsOnInsert:
                            true
                    }

                );


            return res.json({

                success:
                    true,

                message:
                    "Profile updated successfully",

                profile

            });

        } catch (error) {

            console.error(
                "Update Profile Error:",
                error
            );


            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not update profile"

                });

        }

    };


// =====================================
// EXPORTS
// =====================================

module.exports = {

    getProfile,

    updateProfile

};