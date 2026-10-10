const QuizAttempt =
    require("../models/QuizAttempt");


// =====================================
// SAVE QUIZ ATTEMPT
// =====================================

const saveQuizAttempt =
    async (req, res) => {

        try {

            const {
                subject,
                topic,
                score,
                totalQuestions
            } = req.body;


            const numericScore =
                Number(score);

            const numericTotal =
                Number(totalQuestions);


            if (
                !subject ||
                !topic ||
                !Number.isInteger(numericScore) ||
                !Number.isInteger(numericTotal)
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid quiz result"
                    });

            }


            if (
                numericTotal < 1 ||
                numericTotal > 100 ||
                numericScore < 0 ||
                numericScore > numericTotal
            ) {

                return res
                    .status(400)
                    .json({
                        success: false,
                        message:
                            "Invalid score or total questions"
                    });

            }


            const percentage =
                Math.round(
                    (
                        numericScore /
                        numericTotal
                    ) * 100
                );


            const attempt =
                await QuizAttempt.create({

                    user:
                        req.user._id,

                    subject:
                        subject.trim(),

                    topic:
                        topic.trim(),

                    score:
                        numericScore,

                    totalQuestions:
                        numericTotal,

                    percentage,

                    completedAt:
                        new Date()

                });


            res.status(201).json({
                success: true,
                message:
                    "Quiz result saved",
                attempt
            });

        } catch (error) {

            console.error(
                "Save Quiz Error:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Failed to save quiz result"
            });

        }

    };


// =====================================
// QUIZ HISTORY
// =====================================

const getQuizHistory =
    async (req, res) => {

        try {

            const history =
                await QuizAttempt.find({
                    user: req.user._id
                })
                .sort({
                    completedAt: -1
                })
                .limit(100);


            res.json({
                success: true,
                history
            });

        } catch (error) {

            console.error(
                "Quiz History Error:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Failed to load quiz history"
            });

        }

    };


// =====================================
// PERFORMANCE
// =====================================

async function createPerformanceData(
    userId
) {

    return await QuizAttempt.aggregate([
        {
            $match: {
                user: userId
            }
        },

        {
            $group: {

                _id: {
                    subject:
                        "$subject",

                    topic:
                        "$topic"
                },

                quizAttempts: {
                    $sum: 1
                },

                correct: {
                    $sum: "$score"
                },

                totalQuestions: {
                    $sum:
                        "$totalQuestions"
                },

                bestScore: {
                    $max:
                        "$percentage"
                },

                lastAttempt: {
                    $max:
                        "$completedAt"
                }
            }
        },

        {
            $project: {

                _id: 0,

                subject:
                    "$_id.subject",

                topic:
                    "$_id.topic",

                quizAttempts: 1,

                correct: 1,

                totalQuestions: 1,

                bestScore: 1,

                lastAttempt: 1,

                accuracy: {

                    $round: [

                        {
                            $multiply: [

                                {
                                    $divide: [
                                        "$correct",
                                        "$totalQuestions"
                                    ]
                                },

                                100
                            ]
                        },

                        0
                    ]

                }
            }
        },

        {
            $sort: {
                accuracy: 1,
                subject: 1
            }
        }
    ]);

}


// GET PERFORMANCE

const getQuizPerformance =
    async (req, res) => {

        try {

            const performance =
                await createPerformanceData(
                    req.user._id
                );


            res.json({
                success: true,
                performance
            });

        } catch (error) {

            console.error(
                "Quiz Performance Error:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Failed to load quiz performance"
            });

        }

    };


// =====================================
// WEAK TOPICS
// Accuracy below 70%
// =====================================

const getWeakTopics =
    async (req, res) => {

        try {

            const performance =
                await createPerformanceData(
                    req.user._id
                );


            const weakTopics =
                performance.filter(
                    item =>
                        item.accuracy < 70
                );


            res.json({
                success: true,
                weakTopics
            });

        } catch (error) {

            console.error(
                "Weak Topics Error:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    "Failed to load weak topics"
            });

        }

    };


module.exports = {
    saveQuizAttempt,
    getQuizHistory,
    getQuizPerformance,
    getWeakTopics
};