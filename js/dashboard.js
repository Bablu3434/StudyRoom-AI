const API_URL =
    "http://localhost:5000/api/dashboard";


const token =
    localStorage.getItem(
        "studyRoomToken"
    );


if (!token) {

    window.location.href =
        "login.html";

}


// =====================================
// API
// =====================================

async function apiFetch(
    url
) {

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

        return;
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
            dashboard.today.tasks
        );


        renderUpcomingTasks(
            dashboard.upcomingTasks
        );


        renderWeakTopics(
            dashboard.weakTopics
        );


        renderActivities(
            dashboard.recentActivities
        );

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

function renderUser(
    user
) {

    setText(
        "userName",
        user.name
    );


    setText(
        "welcomeName",
        user.name
    );


    setText(
        "userEmail",
        user.email
    );

}


// =====================================
// STATS
// =====================================

function renderStats(
    dashboard
) {

    const today =
        dashboard.today;


    const stats =
        dashboard.stats;


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
        `${today.completedTasks}/${today.totalTasks}`
    );


    setText(
        "taskCompletion",
        `${stats.taskCompletion}%`
    );


    setText(
        "quizAverage",
        `${stats.quizAverage}%`
    );


    setText(
        "subjectProgress",
        `${stats.subjectProgress}%`
    );


    setText(
        "totalSubjects",
        stats.totalSubjects
    );


    setText(
        "focusSessions",
        today.focusSessions
    );

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
        tasks.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-dashboard">

                <p>
                    No study tasks for today.
                </p>

                <a href="planner.html">
                    Add Study Task
                </a>

            </div>

        `;

        return;

    }


    tasks
        .slice(0, 5)
        .forEach(
            task => {

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


                const timerURL =

                    "timer.html?subject="

                    +

                    encodeURIComponent(
                        task.subject
                    )

                    +

                    "&minutes="

                    +

                    task.duration;


                row.innerHTML = `

                    <div class="task-main">

                        <strong>
                            ${escapeHTML(
                                task.subject
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                task.topic
                            )}
                        </span>

                    </div>


                    <div class="task-side">

                        <span>
                            ${task.duration} min
                        </span>

                        ${
                            task.completed

                                ? `
                                    <span
                                        class="done-badge"
                                    >
                                        Done
                                    </span>
                                `

                                : `
                                    <a
                                        href="${timerURL}"
                                        class="start-task-btn"
                                    >
                                        Start
                                    </a>
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
        task => {

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
                            task.subject
                        )}
                    </strong>

                    <p>
                        ${escapeHTML(
                            task.topic
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
        item => {

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

                "timer.html?subject="

                +

                encodeURIComponent(
                    `${item.subject} - ${item.topic}`
                )

                +

                "&minutes="

                +

                revisionMinutes;


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
                        ${item.accuracy}%
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
        activity => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "activity-item";


            let icon = "📚";


            if (
                activity.type ===
                "focus"
            ) {

                icon = "⏱️";

            }


            if (
                activity.type ===
                "quiz"
            ) {

                icon = "📝";

            }


            if (
                activity.type ===
                "task"
            ) {

                icon = "✅";

            }


            row.innerHTML = `

                <div class="activity-icon">
                    ${icon}
                </div>


                <div class="activity-content">

                    <strong>
                        ${escapeHTML(
                            activity.title
                        )}
                    </strong>

                    <p>
                        ${escapeHTML(
                            activity.description
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
// LOGOUT
// =====================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

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


    if (element) {

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


    if (hours === 0) {

        return `${remaining}m`;

    }


    if (remaining === 0) {

        return `${hours}h`;

    }


    return `${hours}h ${remaining}m`;

}


function formatDate(
    date
) {

    return new Date(
        date + "T00:00:00"
    )
    .toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short"
        }
    );

}

// =====================================
//daily plan date format
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
                "http://localhost:5000/api/ai/daily-plan",
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

            <div>

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


        document
            .getElementById(
                "retryDailyPlan"
            )
            ?.addEventListener(
                "click",
                loadDailyStudyPlan
            );

    }

}

// =====================================
// EXAM COUNTDOWN
// =====================================

function renderExamCountdown(
    exam
) {

    if (!exam) {

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


    if (
        exam.daysRemaining > 1
    ) {

        setText(
            "examDays",
            `${exam.daysRemaining} Days Left`
        );

    } else if (
        exam.daysRemaining === 1
    ) {

        setText(
            "examDays",
            "Exam Tomorrow"
        );

    } else if (
        exam.daysRemaining === 0
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
        `Exam Date: ${
            formatFullDate(
                exam.examDate
            )
        }`
    );

}


function formatFullDate(
    date
) {

    return new Date(
        `${date}T00:00:00`
    )
    .toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}




// =====================================
// START
// =====================================

loadDashboard();
loadDailyStudyPlan();