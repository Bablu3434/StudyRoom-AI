const API_URL =
    "http://localhost:5000/api/progress/summary";


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

        return;
    }


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to load progress"
        );

    }


    return data;
}


// =====================================
// LOAD PROGRESS
// =====================================

async function loadProgress() {

    try {

        const data =
            await apiFetch(
                API_URL
            );


        const progress =
            data.progress;


        renderMainStats(
            progress
        );


        renderWeeklyChart(
            progress.last7Days
        );


        renderSubjectProgress(
            progress.subjectProgress
        );


        renderPerformance(
            progress
        );

    } catch (error) {

        console.error(
            error
        );


        const container =
            document.getElementById(
                "progressContent"
            );


        if (container) {

            container.innerHTML = `

                <div class="error-state">

                    <h3>
                        Could not load analytics
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message
                        )}
                    </p>

                </div>

            `;

        }

    }

}


// =====================================
// MAIN STATS
// =====================================

function renderMainStats(
    progress
) {

    setText(
        "totalFocusTime",
        formatMinutes(
            progress.totalFocusMinutes
        )
    );


    setText(
        "todayFocusTime",
        formatMinutes(
            progress.todayFocusMinutes
        )
    );


    setText(
        "studyStreak",
        `${progress.streak} day${
            progress.streak === 1
                ? ""
                : "s"
        }`
    );


    setText(
        "taskCompletion",
        `${progress.tasks.completion}%`
    );


    setText(
        "quizAverage",
        `${progress.quiz.average}%`
    );


    setText(
        "totalSessions",
        progress.totalSessions
    );


    // Alternative IDs

    setText(
        "focusTime",
        formatMinutes(
            progress.totalFocusMinutes
        )
    );


    setText(
        "streak",
        progress.streak
    );


    setText(
        "taskProgress",
        `${progress.tasks.completion}%`
    );


    setText(
        "averageQuizScore",
        `${progress.quiz.average}%`
    );

}


// =====================================
// WEEKLY GRAPH
// =====================================

function renderWeeklyChart(
    days
) {

    const container =

        document.getElementById(
            "weeklyChart"
        )

        ||

        document.getElementById(
            "studyChart"
        )

        ||

        document.getElementById(
            "weeklyBars"
        );


    if (!container)
        return;


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


    days.forEach(
        day => {

            const column =
                document.createElement(
                    "div"
                );


            column.className =
                "chart-column";


            const height =
                Math.max(
                    4,

                    (
                        day.minutes /
                        maxMinutes
                    ) * 100
                );


            column.innerHTML = `

                <div class="bar-wrapper">

                    <span class="bar-value">
                        ${day.minutes}m
                    </span>

                    <div
                        class="chart-bar"
                        style="
                            height:
                            ${height}%;
                        "
                    ></div>

                </div>


                <span class="day-label">

                    ${escapeHTML(
                        day.day
                    )}

                </span>

            `;


            container.appendChild(
                column
            );

        }
    );

}


// =====================================
// SUBJECT PROGRESS
// =====================================

function renderSubjectProgress(
    subjects
) {

    const container =

        document.getElementById(
            "subjectProgressList"
        )

        ||

        document.getElementById(
            "subjectProgressContainer"
        );


    if (!container)
        return;


    container.innerHTML =
        "";


    if (
        subjects.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                No subjects added yet.

            </div>

        `;

        return;

    }


    subjects.forEach(
        subject => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "subject-progress-item";


            item.innerHTML = `

                <div class="subject-progress-top">

                    <div>

                        <strong>

                            ${escapeHTML(
                                subject.name
                            )}

                        </strong>

                        <span>

                            ${subject.completedTopics}
                            /
                            ${subject.totalTopics}
                            topics

                        </span>

                    </div>


                    <strong>

                        ${subject.progress}%

                    </strong>

                </div>


                <div class="progress-track">

                    <div
                        class="progress-value"
                        style="
                            width:
                            ${subject.progress}%;
                        "
                    ></div>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


// =====================================
// STRONGEST + WEAKEST
// =====================================

function renderPerformance(
    progress
) {

    const strongest =
        progress.strongestSubject;


    const weakest =
        progress.weakestTopic;


    if (strongest) {

        setText(
            "strongestSubject",
            strongest.subject
        );


        setText(
            "strongestAccuracy",
            `${strongest.accuracy}%`
        );

    } else {

        setText(
            "strongestSubject",
            "No quiz data"
        );


        setText(
            "strongestAccuracy",
            "0%"
        );

    }


    if (weakest) {

        setText(
            "weakestTopic",
            weakest.topic
        );


        setText(
            "weakestTopicSubject",
            weakest.subject
        );


        setText(
            "weakestAccuracy",
            `${weakest.accuracy}%`
        );

    } else {

        setText(
            "weakestTopic",
            "No quiz data"
        );


        setText(
            "weakestAccuracy",
            "0%"
        );

    }

}


// =====================================
// HELPERS
// =====================================

function formatMinutes(
    totalMinutes
) {

    const minutes =
        Number(
            totalMinutes || 0
        );


    const hours =
        Math.floor(
            minutes / 60
        );


    const remaining =
        minutes % 60;


    if (hours === 0) {

        return `${remaining}m`;

    }


    if (remaining === 0) {

        return `${hours}h`;

    }


    return `${hours}h ${remaining}m`;

}


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


function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            text ?? ""
        );


    return div.innerHTML;

}


// =====================================
// START
// =====================================

loadProgress();