// ======================================
// StudyRoom AI - Weak Topic Detector
// ======================================


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


// Quiz System me isi key par
// performance save ho raha tha.

const performanceKey =
    "quizPerformance_" +
    user.email.toLowerCase();


// Elements

const topicsContainer =
    document.getElementById(
        "topicsContainer"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


const subjectFilter =
    document.getElementById(
        "subjectFilter"
    );


const priorityFilter =
    document.getElementById(
        "priorityFilter"
    );


// ======================================
// Get Performance
// ======================================

function getPerformance() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    performanceKey
                ) || "{}"
            );


        return (
            data &&
            typeof data === "object"
        )
            ? data
            : {};

    } catch {

        return {};

    }

}


// ======================================
// Analyze Topics
// ======================================

function getAnalyzedTopics() {

    const performance =
        getPerformance();


    return Object.values(
        performance
    )

    .map(
        item => {


            const attempts =
                Number(
                    item.attempts
                ) || 0;


            const correct =
                Number(
                    item.correct
                ) || 0;


            const wrong =
                attempts - correct;


            const accuracy =
                attempts === 0
                    ? 0
                    : Math.round(
                        (
                            correct /
                            attempts
                        ) * 100
                    );


            let priority;

            let revisionMinutes;


            // Priority Rules

            if (accuracy < 40) {

                priority =
                    "high";

                revisionMinutes =
                    40;

            } else if (
                accuracy < 55
            ) {

                priority =
                    "medium";

                revisionMinutes =
                    30;

            } else {

                priority =
                    "low";

                revisionMinutes =
                    20;

            }


            const improvementNeeded =
                Math.max(
                    0,
                    70 - accuracy
                );


            return {

                subject:
                    item.subject,

                topic:
                    item.topic,

                attempts,

                correct,

                wrong,

                accuracy,

                priority,

                revisionMinutes,

                improvementNeeded

            };

        }
    )

    // Less than 70% = Weak Topic

    .filter(
        topic =>
            topic.attempts >= 1 &&
            topic.accuracy < 70
    )

    // Lowest accuracy first

    .sort(
        (a, b) => {

            if (
                a.accuracy !==
                b.accuracy
            ) {

                return (
                    a.accuracy -
                    b.accuracy
                );

            }


            return (
                b.attempts -
                a.attempts
            );

        }
    );

}


// ======================================
// Recommendation
// ======================================

function getRecommendation(
    topic
) {

    if (
        topic.priority ===
        "high"
    ) {

        return (
            `Your accuracy in ${topic.topic} is only ` +
            `${topic.accuracy}%. Revise the basic concepts ` +
            `for ${topic.revisionMinutes} minutes before ` +
            `taking another quiz.`
        );

    }


    if (
        topic.priority ===
        "medium"
    ) {

        return (
            `Spend about ${topic.revisionMinutes} minutes ` +
            `revising ${topic.topic}, then practice ` +
            `another short quiz.`
        );

    }


    return (
        `${topic.topic} is close to the target. ` +
        `A ${topic.revisionMinutes}-minute revision ` +
        `and another practice quiz should help.`
    );

}


// ======================================
// Subject Filter
// ======================================

function updateSubjectFilter() {

    const topics =
        getAnalyzedTopics();


    const currentValue =
        subjectFilter.value;


    const subjects = [

        ...new Set(
            topics.map(
                topic =>
                    topic.subject
            )
        )

    ].sort();


    subjectFilter.innerHTML = `

        <option value="all">
            All Subjects
        </option>

    `;


    subjects.forEach(
        subject => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                subject;

            option.textContent =
                subject;


            subjectFilter.appendChild(
                option
            );

        }
    );


    if (
        subjects.includes(
            currentValue
        )
    ) {

        subjectFilter.value =
            currentValue;

    }

}


// ======================================
// Statistics
// ======================================

function updateStats() {

    const topics =
        getAnalyzedTopics();


    const highPriority =
        topics.filter(
            topic =>
                topic.priority ===
                "high"
        ).length;


    const totalAttempts =
        topics.reduce(
            (sum, topic) =>
                sum +
                topic.attempts,

            0
        );


    const averageAccuracy =
        topics.length === 0

            ? 0

            : Math.round(

                topics.reduce(
                    (sum, topic) =>
                        sum +
                        topic.accuracy,

                    0
                )

                /

                topics.length

            );


    document.getElementById(
        "weakTopicCount"
    ).textContent =
        topics.length;


    document.getElementById(
        "highPriorityCount"
    ).textContent =
        highPriority;


    document.getElementById(
        "averageAccuracy"
    ).textContent =
        averageAccuracy + "%";


    document.getElementById(
        "totalAttempts"
    ).textContent =
        totalAttempts;


    updateAIOverview(
        topics
    );

}


// ======================================
// AI Overview
// ======================================

function updateAIOverview(
    topics
) {

    const text =
        document.getElementById(
            "aiOverviewText"
        );


    if (
        topics.length === 0
    ) {

        text.textContent =
            "No weak topics detected yet. Complete more quizzes to build your performance analysis.";

        return;

    }


    const weakest =
        topics[0];


    text.textContent =
        `${weakest.topic} in ${weakest.subject} currently needs the most attention. ` +
        `Your accuracy is ${weakest.accuracy}%. ` +
        `A ${weakest.revisionMinutes}-minute revision session is recommended.`;

}


// ======================================
// Render Topics
// ======================================

function renderTopics() {

    const allTopics =
        getAnalyzedTopics();


    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedSubject =
        subjectFilter.value;


    const selectedPriority =
        priorityFilter.value;


    const topics =
        allTopics.filter(
            topic => {


                const matchesSearch =

                    topic.topic
                        .toLowerCase()
                        .includes(search)

                    ||

                    topic.subject
                        .toLowerCase()
                        .includes(search);


                const matchesSubject =

                    selectedSubject ===
                    "all"

                    ||

                    topic.subject ===
                    selectedSubject;


                const matchesPriority =

                    selectedPriority ===
                    "all"

                    ||

                    topic.priority ===
                    selectedPriority;


                return (
                    matchesSearch &&
                    matchesSubject &&
                    matchesPriority
                );

            }
        );


    topicsContainer.innerHTML =
        "";


    // No weak topics

    if (
        topics.length === 0
    ) {

        const hasWeakTopics =
            allTopics.length > 0;


        topicsContainer.innerHTML = `

            <div class="empty-state">

                <div class="icon">
                    ${
                        hasWeakTopics
                            ? "🔍"
                            : "🎉"
                    }
                </div>

                <h2>
                    ${
                        hasWeakTopics
                            ? "No matching topics"
                            : "No Weak Topics Detected"
                    }
                </h2>

                <p>

                    ${
                        hasWeakTopics

                        ? "Try changing your search or filters."

                        : "Complete some quizzes. Topics with accuracy below 70% will automatically appear here."
                    }

                </p>

                ${
                    hasWeakTopics

                    ? ""

                    : `
                        <a href="quiz.html">
                            Start Quiz
                        </a>
                    `
                }

            </div>

        `;


        updateStats();

        return;

    }


    topics.forEach(
        topic => {


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "topic-card";


            const revisionSubject =
                `${topic.subject} - ${topic.topic}`;


            const timerLink =

                "timer.html?subject=" +

                encodeURIComponent(
                    revisionSubject
                )

                +

                "&minutes=" +

                topic.revisionMinutes;


            const quizLink =

                "quiz.html?subject=" +

                encodeURIComponent(
                    topic.subject
                )

                +

                "&topic=" +

                encodeURIComponent(
                    topic.topic
                );


            card.innerHTML = `

                <div class="topic-top">

                    <div>

                        <p class="subject-name">

                            ${escapeHTML(
                                topic.subject
                            )}

                        </p>

                        <h2>

                            ${escapeHTML(
                                topic.topic
                            )}

                        </h2>

                    </div>


                    <span
                        class="
                            priority-badge
                            priority-${topic.priority}
                        "
                    >

                        ${topic.priority}
                        priority

                    </span>

                </div>


                <div class="accuracy-section">

                    <div class="accuracy-title">

                        <span>
                            Current Accuracy
                        </span>

                        <strong>
                            ${topic.accuracy}%
                        </strong>

                    </div>


                    <div class="progress-bar">

                        <div
                            class="progress-fill"
                            style="
                                width:
                                ${topic.accuracy}%;
                            "
                        >
                        </div>

                    </div>

                </div>


                <div class="topic-stats">

                    <div class="mini-stat">

                        <strong>
                            ${topic.attempts}
                        </strong>

                        <span>
                            Attempts
                        </span>

                    </div>


                    <div class="mini-stat">

                        <strong>
                            ${topic.correct}
                        </strong>

                        <span>
                            Correct
                        </span>

                    </div>


                    <div class="mini-stat">

                        <strong>
                            ${topic.wrong}
                        </strong>

                        <span>
                            Incorrect
                        </span>

                    </div>

                </div>


                <div class="recommendation">

                    <strong>
                        AI Recommendation
                    </strong>

                    <p>
                        ${escapeHTML(
                            getRecommendation(
                                topic
                            )
                        )}
                    </p>

                </div>


                <p class="improvement-text">

                    Target accuracy:
                    <strong>70%</strong>

                    •

                    Need
                    <strong>
                        ${topic.improvementNeeded}
                        percentage points
                    </strong>
                    improvement

                </p>


                <div class="topic-actions">

                    <a
                        href="${timerLink}"
                        class="revision-btn"
                    >
                        ⏱ Start Revision
                    </a>


                    <a
                        href="${quizLink}"
                        class="quiz-btn"
                    >
                        🧠 Practice Quiz
                    </a>

                </div>

            `;


            topicsContainer.appendChild(
                card
            );

        }
    );


    updateStats();

}


// ======================================
// Escape HTML
// ======================================

function escapeHTML(
    text
) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        String(text);


    return element.innerHTML;

}


// ======================================
// Events
// ======================================

searchInput.addEventListener(
    "input",
    renderTopics
);


subjectFilter.addEventListener(
    "change",
    renderTopics
);


priorityFilter.addEventListener(
    "change",
    renderTopics
);


// ======================================
// Initial Load
// ======================================

updateSubjectFilter();

renderTopics();