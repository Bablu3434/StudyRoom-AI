// ==========================================
// StudyRoom AI - Progress Analytics
// ==========================================


// Login Check

const loggedIn =
    localStorage.getItem(
        "studyRoomLoggedIn"
    ) === "true";


const user =
    JSON.parse(
        localStorage.getItem(
            "studyRoomUser"
        ) || "null"
    );


if (!loggedIn || !user) {

    window.location.replace(
        "login.html"
    );

}


// ------------------------------------------
// Storage Keys
// ------------------------------------------

const email =
    user.email.toLowerCase();


const focusKey =
    "studyHistory_" + email;


const plannerKey =
    "studyPlannerTasks_" + email;


const subjectsKey =
    "studySubjects_" + email;


const quizHistoryKey =
    "quizHistory_" + email;


const quizPerformanceKey =
    "quizPerformance_" + email;


// ==========================================
// Safe Storage Reader
// ==========================================

function readArray(key) {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(key)
                || "[]"
            );

        return Array.isArray(data)
            ? data
            : [];

    } catch {

        return [];

    }

}


function readObject(key) {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(key)
                || "{}"
            );

        return (
            data &&
            typeof data === "object" &&
            !Array.isArray(data)
        )
            ? data
            : {};

    } catch {

        return {};

    }

}


// ==========================================
// Data
// ==========================================

const focusHistory =
    readArray(focusKey);


const plannerTasks =
    readArray(plannerKey);


const subjects =
    readArray(subjectsKey);


const quizHistory =
    readArray(quizHistoryKey);


const quizPerformance =
    readObject(
        quizPerformanceKey
    );


// ==========================================
// Helper Functions
// ==========================================

function localDateKey(date) {

    const d =
        new Date(date);


    const year =
        d.getFullYear();


    const month =
        String(
            d.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            d.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
    );

}


function minutesToText(minutes) {

    minutes =
        Math.round(
            Number(minutes) || 0
        );


    if (minutes < 60) {

        return `${minutes}m`;

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    const remaining =
        minutes % 60;


    if (remaining === 0) {

        return `${hours}h`;

    }


    return (
        `${hours}h ${remaining}m`
    );

}


function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text);


    return div.innerHTML;

}


// ==========================================
// Main Statistics
// ==========================================

function renderMainStats() {

    const totalFocusMinutes =
        focusHistory.reduce(
            (sum, session) =>
                sum +
                Number(
                    session.minutes || 0
                ),

            0
        );


    const todayKey =
        localDateKey(
            new Date()
        );


    const todayMinutes =
        focusHistory

            .filter(
                session =>
                    localDateKey(
                        session.completedAt
                    ) === todayKey
            )

            .reduce(
                (sum, session) =>
                    sum +
                    Number(
                        session.minutes || 0
                    ),

                0
            );


    document.getElementById(
        "totalFocusTime"
    ).textContent =
        minutesToText(
            totalFocusMinutes
        );


    document.getElementById(
        "todayFocusText"
    ).textContent =
        `${minutesToText(
            todayMinutes
        )} today`;


    // Task Completion

    const completedTasks =
        plannerTasks.filter(
            task =>
                task.completed
        ).length;


    const taskPercentage =
        plannerTasks.length === 0

            ? 0

            : Math.round(

                completedTasks /
                plannerTasks.length *
                100

            );


    document.getElementById(
        "taskCompletion"
    ).textContent =
        taskPercentage + "%";


    document.getElementById(
        "taskCompletionText"
    ).textContent =
        `${completedTasks} of ${
            plannerTasks.length
        } tasks`;


    // Quiz Average

    const quizAverage =
        quizHistory.length === 0

            ? 0

            : Math.round(

                quizHistory.reduce(
                    (sum, quiz) =>
                        sum +
                        Number(
                            quiz.percentage || 0
                        ),

                    0
                )

                /

                quizHistory.length

            );


    document.getElementById(
        "averageQuizScore"
    ).textContent =
        quizAverage + "%";


    document.getElementById(
        "quizCountText"
    ).textContent =
        `${quizHistory.length} ${
            quizHistory.length === 1
                ? "quiz"
                : "quizzes"
        } completed`;


    // Streak

    const streak =
        calculateStudyStreak();


    document.getElementById(
        "studyStreak"
    ).textContent =
        `${streak} ${
            streak === 1
                ? "Day"
                : "Days"
        }`;

}


// ==========================================
// Study Streak
// ==========================================

function calculateStudyStreak() {

    if (
        focusHistory.length === 0
    ) {

        return 0;

    }


    const activeDays =
        new Set(

            focusHistory.map(
                session =>
                    localDateKey(
                        session.completedAt
                    )
            )

        );


    let currentDate =
        new Date();


    const todayKey =
        localDateKey(
            currentDate
        );


    // Agar aaj study nahi ki hai,
    // par yesterday kiya tha,
    // streak yesterday se calculate hogi.

    if (
        !activeDays.has(
            todayKey
        )
    ) {

        currentDate.setDate(
            currentDate.getDate() - 1
        );

    }


    let streak = 0;


    while (
        activeDays.has(
            localDateKey(
                currentDate
            )
        )
    ) {

        streak++;


        currentDate.setDate(
            currentDate.getDate() - 1
        );

    }


    return streak;

}


// ==========================================
// Weekly Study Chart
// ==========================================

function getLast7Days() {

    const days = [];


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date();


        date.setHours(
            0,
            0,
            0,
            0
        );


        date.setDate(
            date.getDate() - i
        );


        days.push({

            date,

            key:
                localDateKey(
                    date
                ),

            label:
                date.toLocaleDateString(
                    "en-US",
                    {
                        weekday:
                            "short"
                    }
                ),

            minutes:
                0

        });

    }


    focusHistory.forEach(
        session => {

            const key =
                localDateKey(
                    session.completedAt
                );


            const day =
                days.find(
                    item =>
                        item.key === key
                );


            if (day) {

                day.minutes +=
                    Number(
                        session.minutes || 0
                    );

            }

        }
    );


    return days;

}


function renderStudyChart() {

    const days =
        getLast7Days();


    const container =
        document.getElementById(
            "studyChart"
        );


    container.innerHTML =
        "";


    const maxMinutes =
        Math.max(
            ...days.map(
                day =>
                    day.minutes
            ),
            1
        );


    const weeklyMinutes =
        days.reduce(
            (sum, day) =>
                sum +
                day.minutes,

            0
        );


    document.getElementById(
        "weeklyFocusTotal"
    ).textContent =
        minutesToText(
            weeklyMinutes
        );


    days.forEach(
        day => {

            const percentage =
                Math.max(
                    2,
                    Math.round(
                        day.minutes /
                        maxMinutes *
                        100
                    )
                );


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "study-bar-item";


            item.innerHTML = `

                <strong>
                    ${minutesToText(
                        day.minutes
                    )}
                </strong>

                <div class="study-bar-wrapper">

                    <div
                        class="study-bar"
                        style="
                            height:
                            ${
                                day.minutes === 0
                                    ? 2
                                    : percentage
                            }%;
                        "
                        title="
                            ${day.label}:
                            ${minutesToText(
                                day.minutes
                            )}
                        "
                    >
                    </div>

                </div>

                <span>
                    ${day.label}
                </span>

            `;


            container.appendChild(
                item
            );

        }
    );

}


// ==========================================
// Quiz Chart
// ==========================================

function renderQuizChart() {

    const container =
        document.getElementById(
            "quizChart"
        );


    container.innerHTML =
        "";


    if (
        quizHistory.length === 0
    ) {

        container.innerHTML = `

            <p class="empty-message">
                Complete a quiz to see
                performance analytics.
            </p>

        `;


        document.getElementById(
            "bestQuizScore"
        ).textContent =
            "Best 0%";


        return;

    }


    const best =
        Math.max(

            ...quizHistory.map(
                quiz =>
                    Number(
                        quiz.percentage || 0
                    )
            )

        );


    document.getElementById(
        "bestQuizScore"
    ).textContent =
        `Best ${best}%`;


    const recent =
        quizHistory
            .slice(0, 6)
            .reverse();


    recent.forEach(
        quiz => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "quiz-row";


            const label =
                quiz.topic ||
                quiz.subject ||
                "Quiz";


            const score =
                Number(
                    quiz.percentage || 0
                );


            row.innerHTML = `

                <div
                    class="quiz-row-label"
                    title="${escapeHTML(
                        label
                    )}"
                >
                    ${escapeHTML(
                        label
                    )}
                </div>


                <div class="quiz-track">

                    <div
                        class="quiz-fill"
                        style="
                            width:
                            ${score}%;
                        "
                    >
                    </div>

                </div>


                <div class="quiz-score">
                    ${score}%
                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


// ==========================================
// Strongest Subject
// ==========================================

function getSubjectQuizStats() {

    const stats = {};


    quizHistory.forEach(
        quiz => {

            if (!quiz.subject)
                return;


            if (!stats[quiz.subject]) {

                stats[quiz.subject] = {

                    total:
                        0,

                    count:
                        0

                };

            }


            stats[
                quiz.subject
            ].total +=
                Number(
                    quiz.percentage || 0
                );


            stats[
                quiz.subject
            ].count++;

        }
    );


    return Object.entries(
        stats
    )
    .map(
        (
            [
                subject,
                data
            ]
        ) => ({

            subject,

            average:
                Math.round(
                    data.total /
                    data.count
                ),

            quizzes:
                data.count

        })
    );

}


function renderHighlights() {

    const subjectStats =
        getSubjectQuizStats();


    if (
        subjectStats.length > 0
    ) {

        subjectStats.sort(
            (a, b) =>
                b.average -
                a.average
        );


        const strongest =
            subjectStats[0];


        document.getElementById(
            "strongestSubject"
        ).textContent =
            strongest.subject;


        document.getElementById(
            "strongestSubjectScore"
        ).textContent =
            `${strongest.average}% average across ${
                strongest.quizzes
            } ${
                strongest.quizzes === 1
                    ? "quiz"
                    : "quizzes"
            }`;

    }


    // Weakest topic

    const analyzed =
        Object.values(
            quizPerformance
        )

        .filter(
            item =>
                Number(
                    item.attempts
                ) > 0
        )

        .map(
            item => {

                const attempts =
                    Number(
                        item.attempts
                    );


                const correct =
                    Number(
                        item.correct
                    );


                const accuracy =
                    Math.round(
                        correct /
                        attempts *
                        100
                    );


                return {

                    ...item,

                    attempts,

                    correct,

                    accuracy

                };

            }
        )

        .sort(
            (a, b) =>
                a.accuracy -
                b.accuracy
        );


    if (
        analyzed.length > 0
    ) {

        const weakest =
            analyzed[0];


        document.getElementById(
            "weakestTopic"
        ).textContent =
            weakest.topic;


        document.getElementById(
            "weakestTopicScore"
        ).textContent =
            `${weakest.accuracy}% accuracy in ${weakest.subject}`;

    }

}


// ==========================================
// Subject Progress
// ==========================================

function renderSubjectProgress() {

    const container =
        document.getElementById(
            "subjectProgressList"
        );


    container.innerHTML =
        "";


    if (
        subjects.length === 0
    ) {

        container.innerHTML = `

            <p class="empty-message">
                Add subjects and topics to
                start tracking progress.
            </p>

        `;

        return;

    }


    subjects.forEach(
        subject => {

            const topics =
                Array.isArray(
                    subject.topics
                )
                    ? subject.topics
                    : [];


            const completed =
                topics.filter(
                    topic =>
                        topic.completed
                ).length;


            const percentage =
                topics.length === 0

                    ? 0

                    : Math.round(
                        completed /
                        topics.length *
                        100
                    );


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "subject-progress-item";


            item.innerHTML = `

                <div
                    class="subject-progress-name"
                >

                    <strong>
                        ${escapeHTML(
                            subject.name
                        )}
                    </strong>

                    <span>
                        ${completed} of
                        ${topics.length}
                        topics
                    </span>

                </div>


                <div class="subject-track">

                    <div
                        class="subject-fill"
                        style="
                            width:
                            ${percentage}%;
                        "
                    >
                    </div>

                </div>


                <div
                    class="subject-percentage"
                >
                    ${percentage}%
                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


// ==========================================
// Planner Progress
// ==========================================

function renderPlannerProgress() {

    const completed =
        plannerTasks.filter(
            task =>
                task.completed
        ).length;


    const percentage =
        plannerTasks.length === 0

            ? 0

            : Math.round(
                completed /
                plannerTasks.length *
                100
            );


    document.getElementById(
        "plannerProgressPercentage"
    ).textContent =
        percentage + "%";


    document.getElementById(
        "plannerProgressBar"
    ).style.width =
        percentage + "%";


    const details =
        document.getElementById(
            "plannerDetails"
        );


    if (
        plannerTasks.length === 0
    ) {

        details.textContent =
            "No study tasks added yet.";

    } else {

        details.textContent =
            `${completed} completed and ${
                plannerTasks.length -
                completed
            } pending out of ${
                plannerTasks.length
            } total tasks.`;

    }

}


// ==========================================
// Topic Overview
// ==========================================

function renderTopicOverview() {

    let totalTopics = 0;

    let completedTopics = 0;


    subjects.forEach(
        subject => {

            const topics =
                Array.isArray(
                    subject.topics
                )
                    ? subject.topics
                    : [];


            totalTopics +=
                topics.length;


            completedTopics +=
                topics.filter(
                    topic =>
                        topic.completed
                ).length;

        }
    );


    const percentage =
        totalTopics === 0

            ? 0

            : Math.round(
                completedTopics /
                totalTopics *
                100
            );


    document.getElementById(
        "topicProgressPercentage"
    ).textContent =
        percentage + "%";


    document.getElementById(
        "totalTopicCount"
    ).textContent =
        totalTopics;


    document.getElementById(
        "completedTopicCount"
    ).textContent =
        completedTopics;


    document.getElementById(
        "topicCircle"
    ).style.setProperty(
        "--circle-progress",
        percentage + "%"
    );

}


// ==========================================
// Weekly Summary
// ==========================================

function renderWeeklySummary() {

    const days =
        getLast7Days();


    const weeklyMinutes =
        days.reduce(
            (sum, day) =>
                sum +
                day.minutes,

            0
        );


    const completedTasks =
        plannerTasks.filter(
            task =>
                task.completed
        ).length;


    const taskPercentage =
        plannerTasks.length === 0

            ? 0

            : Math.round(
                completedTasks /
                plannerTasks.length *
                100
            );


    const quizAverage =
        quizHistory.length === 0

            ? null

            : Math.round(

                quizHistory.reduce(
                    (sum, quiz) =>
                        sum +
                        Number(
                            quiz.percentage || 0
                        ),

                    0
                )

                /

                quizHistory.length

            );


    const summary =
        document.getElementById(
            "weeklySummary"
        );


    if (
        weeklyMinutes === 0 &&
        plannerTasks.length === 0 &&
        quizHistory.length === 0
    ) {

        summary.textContent =
            "Start a focus session, add study tasks or complete a quiz to generate your performance summary.";

        return;

    }


    let text =
        `In the last 7 days you completed ${minutesToText(
            weeklyMinutes
        )} of focus study.`;


    if (
        plannerTasks.length > 0
    ) {

        text +=
            ` Your planner completion rate is ${taskPercentage}%.`;

    }


    if (
        quizAverage !== null
    ) {

        text +=
            ` Your average quiz score is ${quizAverage}%.`;

    }


    const weakTopics =
        Object.values(
            quizPerformance
        )
        .filter(
            item =>
                Number(
                    item.attempts
                ) > 0
        )
        .map(
            item => ({

                ...item,

                accuracy:
                    Math.round(
                        Number(
                            item.correct
                        ) /
                        Number(
                            item.attempts
                        ) *
                        100
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
        );


    if (
        weakTopics.length > 0
    ) {

        text +=
            ` Focus next on ${weakTopics[0].topic}, where your current accuracy is ${weakTopics[0].accuracy}%.`;

    }


    summary.textContent =
        text;

}


// ==========================================
// Initial Render
// ==========================================

renderMainStats();

renderStudyChart();

renderQuizChart();

renderHighlights();

renderSubjectProgress();

renderPlannerProgress();

renderTopicOverview();

renderWeeklySummary();