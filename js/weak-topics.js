const API_URL =
    "http://localhost:5000/api/quiz/weak-topics";


const token =
    localStorage.getItem(
        "studyRoomToken"
    );


if (!token) {
    window.location.href =
        "login.html";
}


let weakTopics = [];


// =====================================
// ELEMENTS
// =====================================

// Agar tumhare HTML me id weakTopicsContainer hai,
// to ye automatically work karega.

const weakTopicsContainer =
    document.getElementById(
        "weakTopicsContainer"
    )
    ||
    document.getElementById(
        "weakTopicList"
    )
    ||
    document.getElementById(
        "topicsContainer"
    );


// =====================================
// API HELPER
// =====================================

async function apiFetch(
    url,
    options = {}
) {

    const response =
        await fetch(
            url,
            {
                ...options,

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`,

                    ...options.headers
                }
            }
        );


    if (response.status === 401) {

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
            "Request failed"
        );

    }


    return data;
}


// =====================================
// LOAD WEAK TOPICS
// =====================================

async function loadWeakTopics() {

    try {

        showLoading();


        const data =
            await apiFetch(
                API_URL
            );


        weakTopics =
            data.weakTopics || [];


        renderWeakTopics();

        updateStats();

    } catch (error) {

        console.error(
            "Weak Topics Error:",
            error
        );


        showError(
            error.message
        );

    }

}


// =====================================
// PRIORITY
// =====================================

function getPriority(
    accuracy
) {

    if (accuracy < 40) {

        return {
            level: "High",
            className: "high",
            revisionMinutes: 40,
            message:
                "Needs immediate revision"
        };

    }


    if (accuracy < 55) {

        return {
            level: "Medium",
            className: "medium",
            revisionMinutes: 30,
            message:
                "Needs more practice"
        };

    }


    return {
        level: "Low",
        className: "low",
        revisionMinutes: 20,
        message:
            "A little revision should help"
    };

}


// =====================================
// RENDER
// =====================================

function renderWeakTopics() {

    if (!weakTopicsContainer) {

        console.error(
            "Weak topics container not found in HTML."
        );

        return;
    }


    weakTopicsContainer.innerHTML =
        "";


    if (weakTopics.length === 0) {

        weakTopicsContainer.innerHTML = `

            <div class="empty-weak-topics">

                <h3>
                    🎉 No weak topics found
                </h3>

                <p>
                    Great work! Complete more quizzes
                    to keep tracking your performance.
                </p>

                <a
                    href="quiz.html"
                    class="practice-btn"
                >
                    Take a Quiz
                </a>

            </div>

        `;

        return;
    }


    weakTopics.forEach(
        item => {

            const priority =
                getPriority(
                    item.accuracy
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                `weak-topic-card ${priority.className}`;


            const revisionURL =

                "timer.html?subject="

                +

                encodeURIComponent(
                    `${item.subject} - ${item.topic}`
                )

                +

                "&minutes="

                +

                priority.revisionMinutes;


            const quizURL =

                "quiz.html?subject="

                +

                encodeURIComponent(
                    item.subject
                )

                +

                "&topic="

                +

                encodeURIComponent(
                    item.topic
                );


            card.innerHTML = `

                <div class="weak-topic-header">

                    <div>

                        <span class="subject-name">

                            ${escapeHTML(
                                item.subject
                            )}

                        </span>

                        <h3>

                            ${escapeHTML(
                                item.topic
                            )}

                        </h3>

                    </div>


                    <span
                        class="
                            priority-badge
                            ${priority.className}
                        "
                    >

                        ${priority.level}
                        Priority

                    </span>

                </div>


                <div class="accuracy-section">

                    <div class="accuracy-top">

                        <span>
                            Accuracy
                        </span>

                        <strong>
                            ${item.accuracy}%
                        </strong>

                    </div>


                    <div class="accuracy-bar">

                        <div
                            class="
                                accuracy-fill
                                ${priority.className}
                            "

                            style="
                                width:
                                ${item.accuracy}%
                            "
                        ></div>

                    </div>

                </div>


                <div class="weak-stats">

                    <div>

                        <strong>
                            ${item.correct}
                        </strong>

                        <span>
                            Correct
                        </span>

                    </div>


                    <div>

                        <strong>
                            ${item.totalQuestions}
                        </strong>

                        <span>
                            Questions
                        </span>

                    </div>


                    <div>

                        <strong>
                            ${item.quizAttempts}
                        </strong>

                        <span>
                            Quizzes
                        </span>

                    </div>


                    <div>

                        <strong>
                            ${item.bestScore}%
                        </strong>

                        <span>
                            Best Score
                        </span>

                    </div>

                </div>


                <div class="recommendation">

                    <strong>
                        Recommendation
                    </strong>

                    <p>
                        ${priority.message}.
                        Revise for approximately

                        <b>
                            ${priority.revisionMinutes}
                            minutes
                        </b>

                        and then attempt another quiz.
                    </p>

                </div>


                <div class="weak-actions">

                    <a
                        href="${revisionURL}"
                        class="revision-btn"
                    >
                        Start Revision
                    </a>


                    <a
                        href="${quizURL}"
                        class="quiz-btn"
                    >
                        Practice Quiz
                    </a>

                </div>

            `;


            weakTopicsContainer.appendChild(
                card
            );

        }
    );

}


// =====================================
// STATS
// =====================================

function updateStats() {

    const high =
        weakTopics.filter(
            item =>
                item.accuracy < 40
        ).length;


    const medium =
        weakTopics.filter(
            item =>

                item.accuracy >= 40

                &&

                item.accuracy < 55

        ).length;


    const low =
        weakTopics.filter(
            item =>

                item.accuracy >= 55

                &&

                item.accuracy < 70

        ).length;


    setText(
        "totalWeakTopics",
        weakTopics.length
    );


    setText(
        "highPriorityTopics",
        high
    );


    setText(
        "mediumPriorityTopics",
        medium
    );


    setText(
        "lowPriorityTopics",
        low
    );


    // Alternative IDs support

    setText(
        "highPriority",
        high
    );


    setText(
        "mediumPriority",
        medium
    );


    setText(
        "lowPriority",
        low
    );

}


// =====================================
// LOADING
// =====================================

function showLoading() {

    if (!weakTopicsContainer)
        return;


    weakTopicsContainer.innerHTML = `

        <div class="loading-state">

            <h3>
                Loading performance...
            </h3>

            <p>
                Analysing your quiz results.
            </p>

        </div>

    `;

}


// =====================================
// ERROR
// =====================================

function showError(
    message
) {

    if (!weakTopicsContainer)
        return;


    weakTopicsContainer.innerHTML = `

        <div class="error-state">

            <h3>
                Could not load weak topics
            </h3>

            <p>
                ${escapeHTML(
                    message
                )}
            </p>

            <button
                id="retryWeakTopics"
            >
                Try Again
            </button>

        </div>

    `;


    document
        .getElementById(
            "retryWeakTopics"
        )
        ?.addEventListener(
            "click",
            loadWeakTopics
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


function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text ?? "");


    return div.innerHTML;

}


// =====================================
// START
// =====================================

loadWeakTopics();