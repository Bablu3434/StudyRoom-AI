const StudyTask =
    require("../models/StudyTask");


// GET ALL TASKS

const getTasks =
    async (req, res) => {

        try {

            const tasks =
                await StudyTask.find({
                    user: req.user._id
                })
                .sort({
                    studyDate: 1,
                    createdAt: -1
                });


            res.json({
                success: true,
                tasks
            });

        } catch (error) {

            console.error(
                "Get Tasks Error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to load study tasks"
            });

        }

    };


// CREATE TASK

const createTask =
    async (req, res) => {

        try {

            const {
                subject,
                topic,
                duration,
                studyDate,
                priority
            } = req.body;


            if (
                !subject ||
                !topic ||
                !duration ||
                !studyDate
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Please fill all required fields"
                    });

            }


            const numericDuration =
                Number(duration);


            if (
                numericDuration < 1 ||
                numericDuration > 300
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Duration must be between 1 and 300 minutes"
                    });

            }


            const task =
                await StudyTask.create({

                    user:
                        req.user._id,

                    subject:
                        subject.trim(),

                    topic:
                        topic.trim(),

                    duration:
                        numericDuration,

                    studyDate,

                    priority:
                        priority || "medium"

                });


            res.status(201).json({
                success: true,
                message:
                    "Study task created",
                task
            });

        } catch (error) {

            console.error(
                "Create Task Error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to create study task"
            });

        }

    };


// UPDATE TASK

const updateTask =
    async (req, res) => {

        try {

            const task =
                await StudyTask.findOne({
                    _id: req.params.id,
                    user: req.user._id
                });


            if (!task) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Study task not found"
                    });

            }


            const {
                subject,
                topic,
                duration,
                studyDate,
                priority
            } = req.body;


            if (subject !== undefined) {
                task.subject =
                    subject.trim();
            }

            if (topic !== undefined) {
                task.topic =
                    topic.trim();
            }

            if (duration !== undefined) {

                const numericDuration =
                    Number(duration);

                if (
                    numericDuration < 1 ||
                    numericDuration > 300
                ) {

                    return res
                        .status(400)
                        .json({
                            success: false,
                            message:
                                "Duration must be between 1 and 300 minutes"
                        });

                }

                task.duration =
                    numericDuration;
            }

            if (studyDate !== undefined) {
                task.studyDate =
                    studyDate;
            }

            if (priority !== undefined) {
                task.priority =
                    priority;
            }


            await task.save();


            res.json({
                success: true,
                message:
                    "Study task updated",
                task
            });

        } catch (error) {

            console.error(
                "Update Task Error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to update study task"
            });

        }

    };


// TOGGLE COMPLETE

const toggleTask =
    async (req, res) => {

        try {

            const task =
                await StudyTask.findOne({
                    _id: req.params.id,
                    user: req.user._id
                });


            if (!task) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Study task not found"
                    });

            }


            task.completed =
                !task.completed;


            await task.save();


            res.json({
                success: true,
                task
            });

        } catch (error) {

            console.error(
                "Toggle Task Error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to update task status"
            });

        }

    };


// DELETE TASK

const deleteTask =
    async (req, res) => {

        try {

            const task =
                await StudyTask.findOneAndDelete({
                    _id: req.params.id,
                    user: req.user._id
                });


            if (!task) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Study task not found"
                    });

            }


            res.json({
                success: true,
                message:
                    "Study task deleted"
            });

        } catch (error) {

            console.error(
                "Delete Task Error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Failed to delete study task"
            });

        }

    };


module.exports = {
    getTasks,
    createTask,
    updateTask,
    toggleTask,
    deleteTask
};