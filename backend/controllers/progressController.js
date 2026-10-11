const FocusSession =
    require("../models/FocusSession");

const StudyTask =
    require("../models/StudyTask");

const QuizAttempt =
    require("../models/QuizAttempt");

const Subject =
    require("../models/Subject");


// =====================================
// DATE HELPERS
// =====================================

function getDateKey(date) {

    return new Date(date)
        .toLocaleDateString(
            "en-CA",
            {
                timeZone:
                    "Asia/Kolkata"
            }
        );

}


function getDayLabel(date) {

    return new Date(date)
        .toLocaleDateString(
            "en-IN",
            {
                weekday: "short",
                timeZone:
                    "Asia/Kolkata"
            }
        );

}


// =====================================
// PROGRESS SUMMARY
// =====================================

const getProgressSummary =
    async (req, res) => {

        try {

            const userId =
                req.user._id;


            // Load everything

            const [
                sessions,
                tasks,
                quizAttempts,
                subjects
            ] = await Promise.all([

                FocusSession.find({
                    user: userId
                }),

                StudyTask.find({
                    user: userId
                }),

                QuizAttempt.find({
                    user: userId
                }),

                Subject.find({
                    user: userId
                })

            ]);


            // =====================================
            // TOTAL FOCUS TIME
            // =====================================

            const totalFocusMinutes =
                sessions.reduce(
                    (total, session) =>

                        total +
                        Number(
                            session.minutes || 0
                        ),

                    0
                );


            // =====================================
            // TODAY FOCUS
            // =====================================

            const todayKey =
                getDateKey(
                    new Date()
                );


            const todayFocusMinutes =
                sessions
                    .filter(
                        session =>

                            getDateKey(
                                session.completedAt
                            )

                            ===

                            todayKey
                    )
                    .reduce(
                        (total, session) =>

                            total +
                            Number(
                                session.minutes || 0
                            ),

                        0
                    );


            // =====================================
            // LAST 7 DAYS GRAPH
            // =====================================

            const last7Days = [];


            for (
                let i = 6;
                i >= 0;
                i--
            ) {

                const date =
                    new Date();


                date.setDate(
                    date.getDate() - i
                );


                const key =
                    getDateKey(date);


                const minutes =
                    sessions
                        .filter(
                            session =>

                                getDateKey(
                                    session.completedAt
                                )

                                ===

                                key
                        )
                        .reduce(
                            (sum, session) =>

                                sum +
                                Number(
                                    session.minutes || 0
                                ),

                            0
                        );


                last7Days.push({

                    date: key,

                    day:
                        getDayLabel(
                            date
                        ),

                    minutes

                });

            }


            // =====================================
            // STUDY STREAK
            // =====================================

            const activeDates =
                new Set(
                    sessions.map(
                        session =>

                            getDateKey(
                                session.completedAt
                            )
                    )
                );


            let streak = 0;


            let streakDate =
                new Date();


            // If nothing studied today,
            // begin checking from yesterday.

            if (
                !activeDates.has(
                    getDateKey(
                        streakDate
                    )
                )
            ) {

                streakDate.setDate(
                    streakDate.getDate() - 1
                );

            }


            while (
                activeDates.has(
                    getDateKey(
                        streakDate
                    )
                )
            ) {

                streak++;


                streakDate.setDate(
                    streakDate.getDate() - 1
                );

            }


            // =====================================
            // TASK PROGRESS
            // =====================================

            const totalTasks =
                tasks.length;


            const completedTasks =
                tasks.filter(
                    task =>
                        task.completed
                ).length;


            const taskCompletion =
                totalTasks === 0

                    ? 0

                    : Math.round(
                        (
                            completedTasks /
                            totalTasks
                        ) * 100
                    );


            // =====================================
            // QUIZ AVERAGE
            // =====================================

            const totalQuizQuestions =
                quizAttempts.reduce(
                    (total, quiz) =>

                        total +
                        Number(
                            quiz.totalQuestions || 0
                        ),

                    0
                );


            const totalCorrectAnswers =
                quizAttempts.reduce(
                    (total, quiz) =>

                        total +
                        Number(
                            quiz.score || 0
                        ),

                    0
                );


            const quizAverage =
                totalQuizQuestions === 0

                    ? 0

                    : Math.round(
                        (
                            totalCorrectAnswers /
                            totalQuizQuestions
                        ) * 100
                    );


            // =====================================
            // SUBJECT QUIZ PERFORMANCE
            // =====================================

            const subjectPerformanceMap =
                {};


            quizAttempts.forEach(
                quiz => {

                    const subject =
                        quiz.subject;


                    if (
                        !subjectPerformanceMap[
                            subject
                        ]
                    ) {

                        subjectPerformanceMap[
                            subject
                        ] = {

                            subject,

                            correct: 0,

                            total: 0

                        };

                    }


                    subjectPerformanceMap[
                        subject
                    ].correct +=
                        quiz.score;


                    subjectPerformanceMap[
                        subject
                    ].total +=
                        quiz.totalQuestions;

                }
            );


            const subjectQuizPerformance =
                Object.values(
                    subjectPerformanceMap
                )
                .map(
                    item => ({

                        ...item,

                        accuracy:

                            item.total === 0

                                ? 0

                                : Math.round(
                                    (
                                        item.correct /
                                        item.total
                                    ) * 100
                                )

                    })
                );


            const strongestSubject =
                subjectQuizPerformance.length === 0

                    ? null

                    : [...subjectQuizPerformance]
                        .sort(
                            (a, b) =>
                                b.accuracy -
                                a.accuracy
                        )[0];


            // =====================================
            // TOPIC PERFORMANCE
            // =====================================

            const topicMap =
                {};


            quizAttempts.forEach(
                quiz => {

                    const key =
                        `${quiz.subject}||${quiz.topic}`;


                    if (!topicMap[key]) {

                        topicMap[key] = {

                            subject:
                                quiz.subject,

                            topic:
                                quiz.topic,

                            correct: 0,

                            total: 0

                        };

                    }


                    topicMap[key].correct +=
                        quiz.score;


                    topicMap[key].total +=
                        quiz.totalQuestions;

                }
            );


            const topicPerformance =
                Object.values(
                    topicMap
                )
                .map(
                    item => ({

                        ...item,

                        accuracy:

                            item.total === 0

                                ? 0

                                : Math.round(
                                    (
                                        item.correct /
                                        item.total
                                    ) * 100
                                )

                    })
                );


            const weakestTopic =
                topicPerformance.length === 0

                    ? null

                    : [...topicPerformance]
                        .sort(
                            (a, b) =>
                                a.accuracy -
                                b.accuracy
                        )[0];


            // =====================================
            // SUBJECT TOPIC PROGRESS
            // =====================================

            const subjectProgress =
                subjects.map(
                    subject => {

                        const totalTopics =
                            subject.topics.length;


                        const completedTopics =
                            subject.topics.filter(
                                topic =>
                                    topic.completed
                            ).length;


                        const progress =
                            totalTopics === 0

                                ? 0

                                : Math.round(
                                    (
                                        completedTopics /
                                        totalTopics
                                    ) * 100
                                );


                        return {

                            id:
                                subject._id,

                            name:
                                subject.name,

                            code:
                                subject.code,

                            totalTopics,

                            completedTopics,

                            progress

                        };

                    }
                );


            // =====================================
            // RESPONSE
            // =====================================

            res.json({

                success: true,

                progress: {

                    totalFocusMinutes,

                    todayFocusMinutes,

                    totalSessions:
                        sessions.length,

                    streak,

                    last7Days,

                    tasks: {
                        total:
                            totalTasks,

                        completed:
                            completedTasks,

                        pending:
                            totalTasks -
                            completedTasks,

                        completion:
                            taskCompletion
                    },

                    quiz: {
                        totalAttempts:
                            quizAttempts.length,

                        average:
                            quizAverage
                    },

                    strongestSubject,

                    weakestTopic,

                    subjectProgress

                }

            });

        } catch (error) {

            console.error(
                "Progress Analytics Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load progress analytics"

            });

        }

    };


module.exports = {
    getProgressSummary
};