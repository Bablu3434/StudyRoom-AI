const Profile =
    require("../models/Profile");
const StudyTask =
    require("../models/StudyTask");

const FocusSession =
    require("../models/FocusSession");

const QuizAttempt =
    require("../models/QuizAttempt");

const Subject =
    require("../models/Subject");


// Indian date: YYYY-MM-DD
function getTodayKey() {

    return new Date()
        .toLocaleDateString(
            "en-CA",
            {
                timeZone: "Asia/Kolkata"
            }
        );

}


const getDashboard =
    async (req, res) => {

        try {

            const userId =
                req.user._id;

            const today =
                getTodayKey();


            const [
                tasks,
                focusSessions,
                quizAttempts,
                subjects,
                profile
            ] = await Promise.all([

                StudyTask.find({
                    user: userId
                }),

                FocusSession.find({
                    user: userId
                }),

                QuizAttempt.find({
                    user: userId
                }),

                Subject.find({
                    user: userId
                }),

                Profile.findOne({
                      user: userId
             })

            ]);


            // ==============================
            // TODAY TASKS
            // ==============================

            const todayTasks =
                tasks
                    .filter(
                        task =>
                            task.studyDate === today
                    )
                    .sort(
                        (a, b) =>
                            Number(a.completed) -
                            Number(b.completed)
                    );


            const todayCompleted =
                todayTasks.filter(
                    task =>
                        task.completed
                ).length;


            // ==============================
            // TODAY FOCUS
            // ==============================

            const todayFocusSessions =
                focusSessions.filter(
                    session => {

                        const sessionDate =
                            new Date(
                                session.completedAt
                            )
                            .toLocaleDateString(
                                "en-CA",
                                {
                                    timeZone:
                                        "Asia/Kolkata"
                                }
                            );


                        return (
                            sessionDate === today
                        );

                    }
                );


            const todayFocusMinutes =
                todayFocusSessions.reduce(
                    (sum, session) =>

                        sum +
                        Number(
                            session.minutes || 0
                        ),

                    0
                );


            // new line 

            // ==============================
// DAILY STUDY GOAL
// ==============================

const dailyStudyGoal =
    profile?.dailyStudyGoal || 120;


const dailyGoalProgress =
    dailyStudyGoal === 0

        ? 0

        : Math.min(
            100,
            Math.round(
                (
                    todayFocusMinutes /
                    dailyStudyGoal
                ) * 100
            )
        );


const remainingGoalMinutes =
    Math.max(
        0,
        dailyStudyGoal -
        todayFocusMinutes
    );


// ==============================
// EXAM COUNTDOWN
// ==============================

let examCountdown = null;


if (
    profile?.examDate
) {

    const examKey =
        new Date(
            profile.examDate
        )
        .toLocaleDateString(
            "en-CA",
            {
                timeZone:
                    "Asia/Kolkata"
            }
        );


    const todayParts =
        today.split("-")
            .map(Number);


    const examParts =
        examKey.split("-")
            .map(Number);


    const todayUTC =
        Date.UTC(
            todayParts[0],
            todayParts[1] - 1,
            todayParts[2]
        );


    const examUTC =
        Date.UTC(
            examParts[0],
            examParts[1] - 1,
            examParts[2]
        );


    const daysRemaining =
        Math.round(
            (
                examUTC -
                todayUTC
            )
            /
            86400000
        );


    examCountdown = {

        examDate:
            examKey,

        daysRemaining

    };

}

// end line 


            // ==============================
            // TASK COMPLETION
            // ==============================

            const completedTasks =
                tasks.filter(
                    task =>
                        task.completed
                ).length;


            const taskCompletion =
                tasks.length === 0

                    ? 0

                    : Math.round(
                        (
                            completedTasks /
                            tasks.length
                        ) * 100
                    );


            // ==============================
            // QUIZ AVERAGE
            // ==============================

            const totalCorrect =
                quizAttempts.reduce(
                    (sum, quiz) =>

                        sum +
                        Number(
                            quiz.score || 0
                        ),

                    0
                );


            const totalQuestions =
                quizAttempts.reduce(
                    (sum, quiz) =>

                        sum +
                        Number(
                            quiz.totalQuestions || 0
                        ),

                    0
                );


            const quizAverage =
                totalQuestions === 0

                    ? 0

                    : Math.round(
                        (
                            totalCorrect /
                            totalQuestions
                        ) * 100
                    );


            // ==============================
            // SUBJECT PROGRESS
            // ==============================

            let totalTopics = 0;

            let completedTopics = 0;


            subjects.forEach(
                subject => {

                    totalTopics +=
                        subject.topics.length;


                    completedTopics +=
                        subject.topics.filter(
                            topic =>
                                topic.completed
                        ).length;

                }
            );


            const subjectProgress =
                totalTopics === 0

                    ? 0

                    : Math.round(
                        (
                            completedTopics /
                            totalTopics
                        ) * 100
                    );


            // ==============================
            // WEAK TOPICS
            // ==============================

            const topicMap = {};


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
                        Number(
                            quiz.score || 0
                        );


                    topicMap[key].total +=
                        Number(
                            quiz.totalQuestions || 0
                        );

                }
            );


            const weakTopics =
                Object
                    .values(topicMap)
                    .map(
                        item => ({

                            subject:
                                item.subject,

                            topic:
                                item.topic,

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
                    )
                    .filter(
                        item =>
                            item.accuracy < 70
                    )
                    .sort(
                        (a, b) =>
                            a.accuracy -
                            b.accuracy
                    )
                    .slice(0, 3);


            // ==============================
            // UPCOMING TASKS
            // ==============================

            const upcomingTasks =
                tasks
                    .filter(
                        task =>

                            !task.completed

                            &&

                            task.studyDate >=
                            today
                    )
                    .sort(
                        (a, b) =>

                            a.studyDate.localeCompare(
                                b.studyDate
                            )
                    )
                    .slice(0, 5);


            // ==============================
            // RECENT ACTIVITY
            // ==============================

            const activities = [];


            focusSessions.forEach(
                session => {

                    activities.push({

                        type: "focus",

                        title:
                            "Focus Session",

                        description:
                            `${session.subject} • ${session.minutes} min`,

                        date:
                            session.completedAt

                    });

                }
            );


            quizAttempts.forEach(
                quiz => {

                    activities.push({

                        type: "quiz",

                        title:
                            "Quiz Completed",

                        description:
                            `${quiz.subject} - ${quiz.topic} • ${quiz.percentage}%`,

                        date:
                            quiz.completedAt

                    });

                }
            );


            tasks
                .filter(
                    task =>
                        task.completed
                )
                .forEach(
                    task => {

                        activities.push({

                            type: "task",

                            title:
                                "Task Completed",

                            description:
                                `${task.subject} - ${task.topic}`,

                            date:
                                task.updatedAt

                        });

                    }
                );


            activities.sort(
                (a, b) =>

                    new Date(b.date) -
                    new Date(a.date)
            );


            const recentActivities =
                activities.slice(
                    0,
                    6
                );


            // ==============================
            // RESPONSE
            // ==============================

            res.json({

                success: true,
dashboard: {

    user: {
        name:
            req.user.name,

        email:
            req.user.email
    },

    today: {
        tasks:
            todayTasks,

        totalTasks:
            todayTasks.length,

        completedTasks:
            todayCompleted,

        focusMinutes:
            todayFocusMinutes,

        focusSessions:
            todayFocusSessions.length
    },

    studyGoal: {

        targetMinutes:
            dailyStudyGoal,

        completedMinutes:
            todayFocusMinutes,

        remainingMinutes:
            remainingGoalMinutes,

        progress:
            dailyGoalProgress

    },

    examCountdown,

    profile: {

        course:
            profile?.course || "",

        semester:
            profile?.semester || "",

        mainGoal:
            profile?.mainGoal || ""

    },

    stats: {
        totalSubjects:
            subjects.length,

        taskCompletion,

        quizAverage,

        subjectProgress
    },

    weakTopics,

    upcomingTasks,

    recentActivities

}

            });

        } catch (error) {

            console.error(
                "Dashboard Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to load dashboard"

            });

        }

    };


module.exports = {
    getDashboard
};