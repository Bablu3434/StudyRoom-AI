const Subject = require(
    "../models/Subject"
);


// GET ALL SUBJECTS

const getSubjects =
    async (req, res) => {

        try {

            const subjects =
                await Subject.find({
                    user: req.user._id
                })
                .sort({
                    createdAt: -1
                });


            res.json({
                success: true,
                subjects
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message:
                    "Failed to load subjects"
            });

        }

    };


// ADD SUBJECT

const createSubject =
    async (req, res) => {

        try {

            const {
                name,
                code,
                targetHours
            } = req.body;


            if (!name) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Subject name is required"
                    });

            }


            const subject =
                await Subject.create({

                    user:
                        req.user._id,

                    name:
                        name.trim(),

                    code:
                        code?.trim() || "",

                    targetHours:
                        Number(
                            targetHours
                        ) || 20

                });


            res.status(201).json({
                success: true,
                subject
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message:
                    "Failed to create subject"
            });

        }

    };


// UPDATE SUBJECT

const updateSubject =
    async (req, res) => {

        try {

            const subject =
                await Subject.findOne({
                    _id: req.params.id,
                    user: req.user._id
                });


            if (!subject) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Subject not found"
                    });

            }


            if (req.body.name) {
                subject.name =
                    req.body.name.trim();
            }


            if (
                req.body.code !==
                undefined
            ) {

                subject.code =
                    req.body.code.trim();

            }


            if (
                req.body.targetHours
            ) {

                subject.targetHours =
                    Number(
                        req.body.targetHours
                    );

            }


            await subject.save();


            res.json({
                success: true,
                subject
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message:
                    "Failed to update subject"
            });

        }

    };


// DELETE SUBJECT

const deleteSubject =
    async (req, res) => {

        try {

            const subject =
                await Subject.findOneAndDelete({

                    _id:
                        req.params.id,

                    user:
                        req.user._id

                });


            if (!subject) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Subject not found"
                    });

            }


            res.json({
                success: true,
                message:
                    "Subject deleted"
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message:
                    "Failed to delete subject"
            });

        }

    };


// ADD TOPIC

const addTopic =
    async (req, res) => {

        try {

            const subject =
                await Subject.findOne({

                    _id:
                        req.params.id,

                    user:
                        req.user._id

                });


            if (!subject) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Subject not found"
                    });

            }


            const name =
                req.body.name?.trim();


            if (!name) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Topic name is required"
                    });

            }


            subject.topics.push({
                name
            });


            await subject.save();


            res.status(201).json({
                success: true,
                subject
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message:
                    "Failed to add topic"
            });

        }

    };


// EDIT TOPIC

const updateTopic =
    async (req, res) => {

        try {

            const subject =
                await Subject.findOne({

                    _id:
                        req.params.id,

                    user:
                        req.user._id

                });


            if (!subject) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Subject not found"
                    });

            }


            const topic =
                subject.topics.id(
                    req.params.topicId
                );


            if (!topic) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Topic not found"
                    });

            }


            if (req.body.name) {

                topic.name =
                    req.body.name.trim();

            }


            await subject.save();


            res.json({
                success: true,
                subject
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message:
                    "Failed to update topic"
            });

        }

    };


// TOGGLE TOPIC

const toggleTopic =
    async (req, res) => {

        try {

            const subject =
                await Subject.findOne({

                    _id:
                        req.params.id,

                    user:
                        req.user._id

                });


            if (!subject) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Subject not found"
                    });

            }


            const topic =
                subject.topics.id(
                    req.params.topicId
                );


            if (!topic) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Topic not found"
                    });

            }


            topic.completed =
                !topic.completed;


            await subject.save();


            res.json({
                success: true,
                subject
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message:
                    "Failed to update topic"
            });

        }

    };


// DELETE TOPIC

const deleteTopic =
    async (req, res) => {

        try {

            const subject =
                await Subject.findOne({

                    _id:
                        req.params.id,

                    user:
                        req.user._id

                });


            if (!subject) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Subject not found"
                    });

            }


            const topic =
                subject.topics.id(
                    req.params.topicId
                );


            if (!topic) {

                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Topic not found"
                    });

            }


            subject.topics.pull(
                req.params.topicId
            );


            await subject.save();


            res.json({
                success: true,
                subject
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                message:
                    "Failed to delete topic"
            });

        }

    };


module.exports = {
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    toggleTopic,
    deleteTopic
};