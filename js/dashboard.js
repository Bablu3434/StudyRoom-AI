const API_URL =
    "http://localhost:5000/api/dashboard";


const DAILY_PLAN_API =
    "http://localhost:5000/api/ai/daily-plan";


const token =
    localStorage.getItem(
        "studyRoomToken"
    );


// =====================================
// AUTH CHECK
// =====================================

if (!token) {

    window.location.href =
        "login.html";

}


// =====================================
// API FETCH
// =====================================

async function apiFetch(url) {

    const response =
        await fetch(
            url,
            {
                headers: {

                    Authorization:
                        `Bearer ${token}`

                }
            }
        );


    if (
        response.status === 401
    ) {

        localStorage.removeItem(
            "studyRoomToken"
        );

        localStorage.removeItem(
            "studyRoomUser"
        );


        window.location.href =
            "login.html";


        throw new Error(
            "Session expired"
        );

    }


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to load dashboard"
        );

    }


    return data;

}


// =====================================
// LOAD DASHBOARD
// =====================================

async function loadDashboard() {

    try {

        const data =
            await apiFetch(
                API_URL
            );


        if (
            !data ||
            !data.dashboard
        ) {

            throw new Error(
                "Dashboard data not found"
            );

        }


        const dashboard =
            data.dashboard;


        renderUser(
            dashboard.user
        );


        renderStats(
            dashboard
        );


        renderDailyGoal(
            dashboard.studyGoal
        );


        renderExamCountdown(
            dashboard.examCountdown
        );


        renderTodayTasks(
            dashboard.today?.tasks || []
        );


        renderUpcomingTasks(
            dashboard.upcomingTasks || []
        );


        renderWeakTopics(
            dashboard.weakTopics || []
        );


        renderActivities(
            dashboard.recentActivities || []
        );


        renderTodayDate();

    } catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

    }

}


// =====================================
// USER
// =====================================

function renderUser(user) {

    if (!user)
        return;


    setText(
        "userName",
        user.name || "Student"
    );


    setText(
        "welcomeName",
        user.name || "Student"
    );


    setText(
        "userEmail",
        user.email || ""
    );

}


// =====================================
// STATS
// =====================================

function renderStats(
    dashboard
) {

    const today =
        dashboard.today || {};


    const stats =
        dashboard.stats || {};


    setText(
        "todayFocus",
        formatMinutes(
            today.focusMinutes
        )
    );


    setText(
        "focusTime",
        formatMinutes(
            today.focusMinutes
        )
    );


    setText(
        "todayTasksCount",
        `${today.completedTasks || 0}/${today.totalTasks || 0}`
    );


    setText(
        "taskCompletion",
        `${stats.taskCompletion || 0}%`
    );


    setText(
        "quizAverage",
        `${stats.quizAverage || 0}%`
    );


    setText(
        "subjectProgress",
        `${stats.subjectProgress || 0}%`
    );


    setText(
        "totalSubjects",
        stats.totalSubjects || 0
    );


    setText(
        "focusSessions",
        today.focusSessions || 0
    );

}


// =====================================
// DAILY STUDY GOAL
// =====================================

function renderDailyGoal(goal) {

    const completed =
        Number(
            goal?.completedMinutes || 0
        );


    const target =
        Number(
            goal?.targetMinutes || 120
        );


    const remaining =
        Number(
            goal?.remainingMinutes ??
            Math.max(
                target - completed,
                0
            )
        );


    const progress =
        Math.min(
            100,
            Math.max(
                0,
                Number(
                    goal?.progress ||
                    (
                        target > 0
                            ? Math.round(
                                (
                                    completed /
                                    target
                                ) * 100
                            )
                            : 0
                    )
                )
            )
        );


    setText(
        "dailyGoalText",
        `${completed} / ${target} min`
    );


    setText(
        "dailyGoalPercent",
        `${progress}%`
    );


    setText(
        "dailyGoalRemaining",
        `${remaining} min remaining`
    );


    const bar =
        document.getElementById(
            "dailyGoalBar"
        );


    if (bar) {

        bar.style.width =
            `${progress}%`;

    }

}


// =====================================
// TODAY TASKS
// =====================================

function renderTodayTasks(
    tasks
) {

    const container =

        document.getElementById(
            "todayTasks"
        )

        ||

        document.getElementById(
            "todayTaskList"
        )

        ||

        document.getElementById(
            "todayTasksList"
        );


    if (!container)
        return;


    container.innerHTML =
        "";


    if (
        !Array.isArray(tasks) ||
        tasks.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-dashboard">

                <p>
                    No study tasks for today.
                </p>

                <a
                    href="planner.html"
                    class="add-task-btn"
                >
                    Add Study Task
                </a>

            </div>

        `;

        return;

    }


    tasks
        .slice(0, 5)
        .forEach(
            (task) => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "dashboard-task";


                if (
                    task.completed
                ) {

                    row.classList.add(
                        "completed"
                    );

                }


                row.innerHTML = `

                    <div class="task-main">

                        <strong>
                            ${escapeHTML(
                                task.subject ||
                                "General"
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                task.topic ||
                                "Study"
                            )}
                        </span>

                    </div>


                    <div class="task-side">

                        <span>
                            ${
                                Number(
                                    task.duration
                                ) || 25
                            } min
                        </span>

                        ${
                            task.completed

                                ? `

                                    <button
                                        type="button"
                                        class="done-badge"
                                        disabled
                                    >
                                        ✓ Done
                                    </button>

                                `

                                : `

                                    <button
                                        type="button"

                                        class="start-task-btn"

                                        data-subject="${escapeHTML(
                                            task.subject ||
                                            "General"
                                        )}"

                                        data-topic="${escapeHTML(
                                            task.topic ||
                                            "Study"
                                        )}"

                                        data-minutes="${
                                            Number(
                                                task.duration
                                            ) || 25
                                        }"
                                    >
                                        Start
                                    </button>

                                `
                        }

                    </div>

                `;


                container.appendChild(
                    row
                );

            }
        );

}


// =====================================
// BUTTON EVENTS
// =====================================

document.addEventListener(
    "click",
    function (event) {

        // =================================
        // START TASK BUTTON
        // =================================

        const startButton =
            event.target.closest(
                ".start-task-btn"
            );


        if (
            startButton
        ) {

            event.preventDefault();


            const subject =
                startButton.dataset.subject ||
                "General";


            const topic =
                startButton.dataset.topic ||
                "Study";


            const minutes =
                Number(
                    startButton.dataset.minutes
                ) || 25;


            const timerURL =
                "timer.html"

                +

                `?subject=${encodeURIComponent(
                    subject
                )}`

                +

                `&topic=${encodeURIComponent(
                    topic
                )}`

                +

                `&minutes=${minutes}`;


            console.log(
                "Opening Timer:",
                {
                    subject,
                    topic,
                    minutes
                }
            );


            window.location.href =
                timerURL;


            return;

        }


        // =================================
        // ADD TASK BUTTON
        // =================================

        const addTaskElement =
            event.target.closest(
                "#addTaskBtn, .add-task-btn, [data-action='add-task']"
            );


        if (
            addTaskElement
        ) {

            event.preventDefault();


            window.location.href =
                "planner.html";


            return;

        }


        // =================================
        // FALLBACK FOR EXISTING BUTTON
        // =================================
        // Isse HTML change kiye bina bhi
        // "+ Add Task" button work karega.

        const clickedElement =
            event.target.closest(
                "button, a"
            );


        if (
            clickedElement
        ) {

            const text =
                clickedElement
                    .textContent
                    .trim()
                    .toLowerCase();


            if (
                text === "+ add task" ||
                text === "add task"
            ) {

                event.preventDefault();


                window.location.href =
                    "planner.html";

            }

        }

    }
);


// =====================================
// UPCOMING TASKS
// =====================================

function renderUpcomingTasks(
    tasks
) {

    const container =
        document.getElementById(
            "upcomingTasks"
        );


    if (!container)
        return;


    container.innerHTML =
        "";


    if (
        !Array.isArray(tasks) ||
        tasks.length === 0
    ) {

        container.innerHTML = `

            <p class="empty-dashboard">
                No upcoming tasks.
            </p>

        `;

        return;

    }


    tasks.forEach(
        (task) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "upcoming-task";


            row.innerHTML = `

                <div>

                    <strong>
                        ${escapeHTML(
                            task.subject ||
                            "General"
                        )}
                    </strong>

                    <p>
                        ${escapeHTML(
                            task.topic ||
                            "Study"
                        )}
                    </p>

                </div>


                <span>

                    ${formatDate(
                        task.studyDate
                    )}

                </span>

            `;


            container.appendChild(
                row
            );

        }
    );

}


// =====================================
// WEAK TOPICS
// =====================================

function renderWeakTopics(
    topics
) {

    const container =

        document.getElementById(
            "dashboardWeakTopics"
        )

        ||

        document.getElementById(
            "weakTopics"
        );


    if (!container)
        return;


    container.innerHTML =
        "";


    if (
        !Array.isArray(topics) ||
        topics.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-dashboard">

                <p>
                    No weak topics detected.
                </p>

                <a href="quiz.html">
                    Take Quiz
                </a>

            </div>

        `;

        return;

    }


    topics.forEach(
        (item) => {

            const revisionMinutes =

                item.accuracy < 40

                    ? 40

                    : item.accuracy < 55

                        ? 30

                        : 20;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "weak-dashboard-item";


            const revisionURL =

                "timer.html"

                +

                `?subject=${encodeURIComponent(
                    item.subject
                )}`

                +

                `&topic=${encodeURIComponent(
                    item.topic
                )}`

                +

                `&minutes=${revisionMinutes}`;


            row.innerHTML = `

                <div>

                    <strong>
                        ${escapeHTML(
                            item.topic
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            item.subject
                        )}
                    </span>

                </div>


                <div class="weak-right">

                    <strong>
                        ${
                            Number(
                                item.accuracy
                            ) || 0
                        }%
                    </strong>

                    <a
                        href="${revisionURL}"
                    >
                        Revise
                    </a>

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


// =====================================
// RECENT ACTIVITY
// =====================================

function renderActivities(
    activities
) {

    const container =

        document.getElementById(
            "recentActivity"
        )

        ||

        document.getElementById(
            "recentActivities"
        );


    if (!container)
        return;


    container.innerHTML =
        "";


    if (
        !Array.isArray(activities) ||
        activities.length === 0
    ) {

        container.innerHTML = `

            <p class="empty-dashboard">

                No recent activity yet.

            </p>

        `;

        return;

    }


    activities.forEach(
        (activity) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "activity-item";


            let icon =
                "📚";


            if (
                activity.type ===
                "focus"
            ) {

                icon =
                    "⏱️";

            }


            if (
                activity.type ===
                "quiz"
            ) {

                icon =
                    "📝";

            }


            if (
                activity.type ===
                "task"
            ) {

                icon =
                    "✅";

            }


            row.innerHTML = `

                <div class="activity-icon">
                    ${icon}
                </div>


                <div class="activity-content">

                    <strong>

                        ${escapeHTML(
                            activity.title ||
                            "Activity"
                        )}

                    </strong>

                    <p>

                        ${escapeHTML(
                            activity.description ||
                            ""
                        )}

                    </p>

                </div>


                <span class="activity-time">

                    ${formatActivityDate(
                        activity.date
                    )}

                </span>

            `;


            container.appendChild(
                row
            );

        }
    );

}


// =====================================
// DAILY AI STUDY PLAN
// =====================================

async function loadDailyStudyPlan() {

    const container =
        document.getElementById(
            "dailyStudyPlan"
        );


    if (!container)
        return;


    container.textContent =
        "Creating your personalized study plan...";


    try {

        const response =
            await fetch(
                DAILY_PLAN_API,
                {
                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }
                }
            );


        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "studyRoomToken"
            );

            localStorage.removeItem(
                "studyRoomUser"
            );


            window.location.href =
                "login.html";


            return;

        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Could not load daily plan"
            );

        }


        if (
            !data.dailyPlan?.plan
        ) {

            throw new Error(
                "Daily plan was empty"
            );

        }


        container.textContent =
            data.dailyPlan.plan;


        console.log(
            "Daily plan source:",
            data.source ||
            "database"
        );

    } catch (error) {

        console.error(
            "Daily Plan Frontend Error:",
            error
        );


        container.innerHTML = `

            <div class="daily-plan-error">

                <strong>
                    Could not load today's study plan.
                </strong>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

                <button
                    type="button"
                    id="retryDailyPlan"
                >
                    Try Again
                </button>

            </div>

        `;


        const retryButton =
            document.getElementById(
                "retryDailyPlan"
            );


        if (
            retryButton
        ) {

            retryButton.addEventListener(
                "click",
                loadDailyStudyPlan
            );

        }

    }

}


// =====================================
// EXAM COUNTDOWN
// =====================================

function renderExamCountdown(
    exam
) {

    if (
        !exam ||
        !exam.examDate
    ) {

        setText(
            "examDays",
            "Set Exam Date"
        );


        setText(
            "examDateText",
            "Add your exam date from Profile."
        );


        return;

    }


    const days =
        Number(
            exam.daysRemaining
        );


    if (
        days > 1
    ) {

        setText(
            "examDays",
            `${days} Days Left`
        );

    } else if (
        days === 1
    ) {

        setText(
            "examDays",
            "Exam Tomorrow"
        );

    } else if (
        days === 0
    ) {

        setText(
            "examDays",
            "Exam Today"
        );

    } else {

        setText(
            "examDays",
            "Exam Completed"
        );

    }


    setText(
        "examDateText",
        `Exam Date: ${formatFullDate(
            exam.examDate
        )}`
    );

}


// =====================================
// CURRENT DATE
// =====================================

function renderTodayDate() {

    const dateText =
        new Date()
            .toLocaleDateString(
                "en-US",
                {
                    weekday:
                        "long",

                    month:
                        "long",

                    day:
                        "numeric"
                }
            );


    const possibleIds = [

        "todayDate",

        "currentDate",

        "dashboardDate",

        "todayPlanDate"

    ];


    possibleIds.forEach(
        (id) => {

            const element =
                document.getElementById(
                    id
                );


            if (
                element
            ) {

                element.textContent =
                    dateText;

            }

        }
    );

}


// =====================================
// LOGOUT
// =====================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (
    logoutBtn
) {

    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "studyRoomToken"
            );


            localStorage.removeItem(
                "studyRoomUser"
            );


            window.location.href =
                "login.html";

        }
    );

}


// =====================================
// HELPERS
// =====================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.textContent =
            value;

    }

}


function formatMinutes(
    minutes
) {

    const total =
        Number(
            minutes || 0
        );


    const hours =
        Math.floor(
            total / 60
        );


    const remaining =
        total % 60;


    if (
        hours === 0
    ) {

        return `${remaining}m`;

    }


    if (
        remaining === 0
    ) {

        return `${hours}h`;

    }


    return `${hours}h ${remaining}m`;

}


function formatDate(
    date
) {

    if (!date)
        return "-";


    const parsedDate =
        new Date(
            `${date}T00:00:00`
        );


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "-";

    }


    return parsedDate
        .toLocaleDateString(
            "en-IN",
            {
                day:
                    "numeric",

                month:
                    "short"
            }
        );

}


function formatFullDate(
    date
) {

    if (!date)
        return "-";


    let parsedDate;


    if (
        typeof date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(
            date
        )
    ) {

        parsedDate =
            new Date(
                `${date}T00:00:00`
            );

    } else {

        parsedDate =
            new Date(
                date
            );

    }


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "-";

    }


    return parsedDate
        .toLocaleDateString(
            "en-IN",
            {
                day:
                    "numeric",

                month:
                    "long",

                year:
                    "numeric"
            }
        );

}


function formatActivityDate(
    date
) {

    if (!date)
        return "";


    const parsedDate =
        new Date(
            date
        );


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "";

    }


    const now =
        new Date();


    const difference =
        now.getTime() -
        parsedDate.getTime();


    const minutes =
        Math.floor(
            difference /
            60000
        );


    const hours =
        Math.floor(
            minutes / 60
        );


    const days =
        Math.floor(
            hours / 24
        );


    if (
        minutes < 1
    ) {

        return "Just now";

    }


    if (
        minutes < 60
    ) {

        return `${minutes}m ago`;

    }


    if (
        hours < 24
    ) {

        return `${hours}h ago`;

    }


    if (
        days < 7
    ) {

        return `${days}d ago`;

    }


    return parsedDate
        .toLocaleDateString(
            "en-IN",
            {
                day:
                    "numeric",

                month:
                    "short"
            }
        );

}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================
// START
// =====================================

loadDashboard();

loadDailyStudyPlan();