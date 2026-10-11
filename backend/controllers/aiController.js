const OpenAI = require("openai");

const Profile = require("../models/Profile");
const DailyPlan = require("../models/DailyPlan");
const AIChat = require("../models/AIChat");
const QuizAttempt = require("../models/QuizAttempt");
const StudyTask = require("../models/StudyTask");
const FocusSession = require("../models/FocusSession");
const Subject = require("../models/Subject");


// ======================================================
// OPENAI CLIENT
// ======================================================

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


// ======================================================
// GET STUDENT CONTEXT
// ======================================================

async function getStudentContext(userId) {

    const [
        quizzes,
        tasks,
        sessions,
        subjects,
        profile
    ] = await Promise.all([

        QuizAttempt.find({
            user: userId
        })
            .sort({
                completedAt: -1
            })
            .limit(50),


        StudyTask.find({
            user: userId,
            completed: false
        })
            .sort({
                studyDate: 1
            })
            .limit(10),


        FocusSession.find({
            user: userId
        })
            .sort({
                completedAt: -1
            })
            .limit(20),


        Subject.find({
            user: userId
        }),


        Profile.findOne({
            user: userId
        })

    ]);


    // ==================================================
    // QUIZ TOPIC PERFORMANCE
    // ==================================================

    const topicMap = {};


    quizzes.forEach((quiz) => {

        const subject =
            quiz.subject || "General";


        const topic =
            quiz.topic || "General";


        const key =
            `${subject}||${topic}`;


        if (!topicMap[key]) {

            topicMap[key] = {

                subject,

                topic,

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

    });


    const performance =
        Object
            .values(topicMap)
            .map((item) => {

                const accuracy =
                    item.total === 0
                        ? 0
                        : Math.round(
                            (
                                item.correct /
                                item.total
                            ) * 100
                        );


                return {

                    subject:
                        item.subject,

                    topic:
                        item.topic,

                    accuracy

                };

            });


    // ==================================================
    // WEAK TOPICS
    // ==================================================

    const weakTopics =
        performance
            .filter(
                (item) =>
                    item.accuracy < 70
            )
            .sort(
                (a, b) =>
                    a.accuracy -
                    b.accuracy
            )
            .slice(0, 5);


    // ==================================================
    // STRONG TOPICS
    // ==================================================

    const strongTopics =
        performance
            .filter(
                (item) =>
                    item.accuracy >= 70
            )
            .sort(
                (a, b) =>
                    b.accuracy -
                    a.accuracy
            )
            .slice(0, 3);


    // ==================================================
    // RECENT FOCUS MINUTES
    // ==================================================

    const recentFocusMinutes =
        sessions.reduce(
            (sum, session) => {

                return (
                    sum +
                    Number(
                        session.minutes || 0
                    )
                );

            },
            0
        );


    // ==================================================
    // SUBJECT PROGRESS
    // ==================================================

    const subjectProgress =
        subjects.map((subject) => {

            const topics =
                Array.isArray(
                    subject.topics
                )
                    ? subject.topics
                    : [];


            const totalTopics =
                topics.length;


            const completedTopics =
                topics.filter(
                    (topic) =>
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

                name:
                    subject.name,

                progress

            };

        });


    // ==================================================
    // PENDING TASKS
    // ==================================================

    const pendingTasks =
        tasks.map((task) => ({

            subject:
                task.subject,

            topic:
                task.topic,

            duration:
                task.duration,

            date:
                task.studyDate,

            priority:
                task.priority

        }));


    // ==================================================
    // RETURN CONTEXT
    // ==================================================

    return {

        subjects:
            subjectProgress,

        weakTopics,

        strongTopics,

        pendingTasks,

        recentFocusMinutes,

        profile:
            profile
                ? {

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
                : null

    };

}


// ======================================================
// ASK AI
// POST /api/ai/ask
// ======================================================

const askAI =
    async (req, res) => {

        try {

            const {
                message,
                subject,
                topic,
                mode
            } = req.body || {};


            // ==========================================
            // VALIDATE MESSAGE
            // ==========================================

            if (
                typeof message !== "string" ||
                !message.trim()
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Please enter a question"

                    });

            }


            if (
                message.trim().length > 3000
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Question is too long"

                    });

            }


            // ==========================================
            // CHECK OPENAI CONFIG
            // ==========================================

            if (
                !process.env.OPENAI_API_KEY ||
                !process.env.OPENAI_MODEL
            ) {

                return res
                    .status(503)
                    .json({

                        success: false,

                        code:
                            "AI_NOT_CONFIGURED",

                        message:
                            "AI service is not configured."

                    });

            }


            // ==========================================
            // STUDENT CONTEXT
            // ==========================================

            const studentContext =
                await getStudentContext(
                    req.user._id
                );


            const selectedMode =
                mode || "explain";


            let modeInstruction =
                `
Explain clearly in simple,
student-friendly language.

Use examples when useful.
`;


            if (
                selectedMode ===
                "revision"
            ) {

                modeInstruction = `
Create concise revision notes.

Include:
- Key points
- Important terms
- Examples
- Common mistakes
`;

            }


            if (
                selectedMode ===
                "quiz"
            ) {

                modeInstruction = `
Create 5 practice questions.

Do not reveal answers immediately.

Put the answers at the end
under the heading "Answer Key".
`;

            }


            if (
                selectedMode ===
                "study-plan"
            ) {

                modeInstruction = `
Create a realistic study plan.

Prioritize weak topics first.

Include:
- Study time
- Revision
- Practice
- Short breaks
`;

            }


            const contextText =
                JSON.stringify(
                    studentContext,
                    null,
                    2
                );


            const instructions = `
You are StudyRoom AI,
a personalized learning assistant.

Use the student's academic information
only when it is relevant.

Student Study Data:

${contextText}

Current Subject:
${subject || "General"}

Current Topic:
${topic || "General"}

Mode:
${selectedMode}

Task:

${modeInstruction}

Rules:

- Give priority to weak topics only when supported by data.
- Consider pending study tasks.
- Suggest realistic study sessions.
- Use quiz performance when available.
- Do not invent weaknesses.
- If performance data is limited,
  explain that more quiz attempts are needed.
- Keep answers student-friendly.
- Use simple English.
- Use headings and bullet points when useful.
- Never mention internal database details.
`;


            // ==========================================
            // OPENAI RESPONSE
            // ==========================================

            const response =
                await client.responses.create({

                    model:
                        process.env.OPENAI_MODEL,

                    instructions,

                    input:
                        message.trim(),

                    max_output_tokens:
                        1200

                });


            const answer =
                response.output_text
                    ?.trim();


            if (!answer) {

                return res
                    .status(500)
                    .json({

                        success: false,

                        message:
                            "AI returned an empty response"

                    });

            }


            // ==========================================
            // SAVE CHAT
            // ==========================================

            await AIChat.create({

                user:
                    req.user._id,

                question:
                    message.trim(),

                answer,

                subject:
                    typeof subject === "string"
                        ? subject.trim()
                        : "",

                topic:
                    typeof topic === "string"
                        ? topic.trim()
                        : "",

                mode:
                    selectedMode

            });


            return res.json({

                success: true,

                answer,

                subject:
                    subject || "",

                topic:
                    topic || "",

                mode:
                    selectedMode

            });

        } catch (error) {

            console.error(
                "AI Error:",
                error.message
            );


            // ==========================================
            // OPENAI CREDITS EXHAUSTED
            // ==========================================

            if (
                error?.status === 429 ||
                error?.code ===
                    "credit_balance_exhausted" ||
                error?.error?.code ===
                    "credit_balance_exhausted"
            ) {

                return res
                    .status(503)
                    .json({

                        success: false,

                        code:
                            "AI_CREDITS_EXHAUSTED",

                        message:
                            "AI service is temporarily unavailable because API credits are exhausted."

                    });

            }


            return res
                .status(500)
                .json({

                    success: false,

                    code:
                        "AI_ERROR",

                    message:
                        "AI assistant could not generate a response"

                });

        }

    };


// ======================================================
// RECOMMENDATIONS
// GET /api/ai/recommendations
// ======================================================

const getRecommendations =
    async (req, res) => {

        try {

            const context =
                await getStudentContext(
                    req.user._id
                );


            const recommendations =
                [];


            // ==========================================
            // WEAK TOPIC RECOMMENDATIONS
            // ==========================================

            context.weakTopics
                .slice(0, 3)
                .forEach((item) => {

                    let minutes =
                        20;


                    if (
                        item.accuracy < 40
                    ) {

                        minutes =
                            40;

                    } else if (
                        item.accuracy < 55
                    ) {

                        minutes =
                            30;

                    }


                    recommendations.push({

                        type:
                            "weak-topic",

                        title:
                            `Revise ${item.topic}`,

                        description:
                            `${item.subject} accuracy is ${item.accuracy}%.`,

                        minutes,

                        subject:
                            item.subject,

                        topic:
                            item.topic

                    });

                });


            // ==========================================
            // PENDING TASK FALLBACK
            // ==========================================

            if (
                recommendations.length === 0 &&
                context.pendingTasks.length > 0
            ) {

                const task =
                    context.pendingTasks[0];


                recommendations.push({

                    type:
                        "task",

                    title:
                        `Continue ${task.topic}`,

                    description:
                        `${task.subject} study task is pending.`,

                    minutes:
                        Number(
                            task.duration || 25
                        ),

                    subject:
                        task.subject,

                    topic:
                        task.topic

                });

            }


            return res.json({

                success: true,

                recommendations

            });

        } catch (error) {

            console.error(
                "Recommendation Error:",
                error.message
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Could not load recommendations"

                });

        }

    };


// ======================================================
// GET AI HISTORY
// GET /api/ai/history
// ======================================================

const getAIHistory =
    async (req, res) => {

        try {

            const history =
                await AIChat
                    .find({

                        user:
                            req.user._id

                    })
                    .sort({

                        createdAt:
                            -1

                    })
                    .limit(30);


            return res.json({

                success: true,

                history:
                    history.reverse()

            });

        } catch (error) {

            console.error(
                "AI History Error:",
                error.message
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Could not load AI history"

                });

        }

    };


// ======================================================
// CLEAR AI HISTORY
// DELETE /api/ai/history
// ======================================================

const clearAIHistory =
    async (req, res) => {

        try {

            await AIChat.deleteMany({

                user:
                    req.user._id

            });


            return res.json({

                success: true,

                message:
                    "AI chat history cleared"

            });

        } catch (error) {

            console.error(
                "Clear History Error:",
                error.message
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Could not clear AI history"

                });

        }

    };


// ======================================================
// FALLBACK DAILY STUDY PLAN
// ======================================================

function buildFallbackDailyPlan(
    context
) {

    const lines = [

        "Today's Study Plan",
        ""

    ];


    let number = 1;


    // ==============================================
    // WEAK TOPICS
    // ==============================================

    context.weakTopics
        .slice(0, 2)
        .forEach((item) => {

            let minutes =
                20;


            if (
                item.accuracy < 40
            ) {

                minutes =
                    40;

            } else if (
                item.accuracy < 55
            ) {

                minutes =
                    30;

            }


            lines.push(
                `${number}. ${item.subject} - ${item.topic}`
            );


            lines.push(
                `   Time: ${minutes} minutes`
            );


            lines.push(
                "   Task: Revise this topic and practice a few questions."
            );


            lines.push("");


            number++;

        });


    // ==============================================
    // PENDING TASKS
    // ==============================================

    context.pendingTasks
        .slice(0, 2)
        .forEach((task) => {

            lines.push(
                `${number}. ${task.subject} - ${task.topic}`
            );


            lines.push(
                `   Time: ${task.duration || 25} minutes`
            );


            lines.push(
                "   Task: Complete your pending study task."
            );


            lines.push("");


            number++;

        });


    // ==============================================
    // NO DATA AVAILABLE
    // ==============================================

    if (
        number === 1
    ) {

        lines.push(
            "1. General Revision"
        );


        lines.push(
            "   Time: 25 minutes"
        );


        lines.push(
            "   Task: Review one subject and then take a short quiz."
        );


        lines.push("");

    }


    // ==============================================
    // FINAL REVISION
    // ==============================================

    lines.push(
        "Final Revision:"
    );


    lines.push(
        "Review the main points for 10 minutes."
    );


    lines.push("");


    // ==============================================
    // PROFILE GOAL
    // ==============================================

    if (
        context.profile?.mainGoal
    ) {

        lines.push(
            `Main Goal: ${context.profile.mainGoal}`
        );


        lines.push("");

    }


    if (
        context.profile?.dailyStudyGoal
    ) {

        lines.push(
            `Daily Target: ${context.profile.dailyStudyGoal} minutes`
        );


        lines.push("");

    }


    lines.push(
        "Motivation:"
    );


    lines.push(
        "Focus on one task at a time and stay consistent."
    );


    return lines.join("\n");

}


// ======================================================
// DAILY STUDY PLAN
// GET /api/ai/daily-plan
// ======================================================

const getDailyPlan =
    async (req, res) => {

        try {

            const today =
                new Date()
                    .toLocaleDateString(
                        "en-CA",
                        {

                            timeZone:
                                "Asia/Kolkata"

                        }
                    );


            // ==========================================
            // CHECK SAVED PLAN
            // ==========================================

            const existingPlan =
                await DailyPlan.findOne({

                    user:
                        req.user._id,

                    date:
                        today

                });


            if (
                existingPlan
            ) {

                return res.json({

                    success: true,

                    cached: true,

                    source:
                        "database",

                    dailyPlan:
                        existingPlan

                });

            }


            // ==========================================
            // STUDENT DATA
            // ==========================================

            const studentContext =
                await getStudentContext(
                    req.user._id
                );


            let plan = "";

            let source =
                "fallback";


            // ==========================================
            // TRY OPENAI
            // ==========================================

            if (
                process.env.OPENAI_API_KEY &&
                process.env.OPENAI_MODEL
            ) {

                try {

                    const contextText =
                        JSON.stringify(
                            studentContext,
                            null,
                            2
                        );


                    const instructions = `
You are StudyRoom AI.

Create a practical personalized
daily study plan.

Student Academic Data:

${contextText}

Rules:

- Prioritize weak topics.
- Consider pending tasks.
- Consider the daily study goal.
- Consider the exam date if available.
- Keep study sessions realistic.
- Include revision.
- Include practice.
- Include short breaks.
- Do not invent weak topics.
- Use simple English.
- Keep the plan concise.

Format:

Today's Study Plan

1. Subject - Topic
   Time: X minutes
   Task: ...

2. Subject - Topic
   Time: X minutes
   Task: ...

Final Revision:
...

Motivation:
...
`;


                    const response =
                        await client.responses.create({

                            model:
                                process.env.OPENAI_MODEL,

                            instructions,

                            input:
                                "Create my personalized study plan for today.",

                            max_output_tokens:
                                900

                        });


                    const aiPlan =
                        response.output_text
                            ?.trim();


                    if (
                        aiPlan
                    ) {

                        plan =
                            aiPlan;

                        source =
                            "ai";

                    }

                } catch (aiError) {

                    console.error(
                        "Daily Plan AI Error:",
                        aiError.message
                    );

                }

            }


            // ==========================================
            // AI FAILED -> LOCAL FALLBACK
            // ==========================================

            if (
                !plan
            ) {

                plan =
                    buildFallbackDailyPlan(
                        studentContext
                    );

                source =
                    "fallback";

            }


            // ==========================================
            // SAVE PLAN
            // ==========================================

            let savedPlan;


            try {

                savedPlan =
                    await DailyPlan.create({

                        user:
                            req.user._id,

                        date:
                            today,

                        plan

                    });

            } catch (saveError) {


                // Unique index duplicate

                if (
                    saveError?.code ===
                    11000
                ) {

                    savedPlan =
                        await DailyPlan.findOne({

                            user:
                                req.user._id,

                            date:
                                today

                        });


                    if (
                        !savedPlan
                    ) {

                        throw saveError;

                    }

                } else {

                    throw saveError;

                }

            }


            return res.json({

                success: true,

                cached: false,

                source,

                dailyPlan:
                    savedPlan

            });

        } catch (error) {

            console.error(
                "Daily Plan Error:",
                error.message
            );


            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        error.message ||
                        "Could not generate daily study plan"

                });

        }

    };


// ======================================================
// EXPORTS
// KEEP THIS AT THE VERY BOTTOM
// ======================================================

module.exports = {

    askAI,

    getRecommendations,

    getAIHistory,

    clearAIHistory,

    getDailyPlan

};