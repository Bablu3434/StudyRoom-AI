// =====================================
// StudyRoom AI - Quiz System
// =====================================

const QUIZ_ATTEMPT_API =
    "http://localhost:5000/api/quiz/attempts";


const quizToken =
    localStorage.getItem(
        "studyRoomToken"
    );


const user =
    JSON.parse(
        localStorage.getItem(
            "studyRoomUser"
        ) || "null"
    );


// =====================================
// LOGIN PROTECTION
// =====================================

if (
    !quizToken ||
    !user
) {

    window.location.href =
        "login.html";

}


// =====================================
// API HELPER
// =====================================

async function quizApiFetch(
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
                        `Bearer ${quizToken}`,

                    ...options.headers

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
            "Login session expired."
        );

    }


    const contentType =
        response.headers.get(
            "content-type"
        );


    let data;


    if (
        contentType &&
        contentType.includes(
            "application/json"
        )
    ) {

        data =
            await response.json();

    } else {

        const text =
            await response.text();


        throw new Error(
            `Server returned ${response.status}: ${text.slice(
                0,
                120
            )}`
        );

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Quiz request failed"
        );

    }


    return data;

}


// =====================================
// STORAGE KEYS
// =====================================

const userEmail =
    user.email
        .toLowerCase();


const historyKey =
    "quizHistory_" +
    userEmail;


const performanceKey =
    "quizPerformance_" +
    userEmail;


// =====================================
// QUESTION BANK
// =====================================

const questionBank = [

    // =====================================
    // JAVA
    // =====================================

    {
        subject:
            "Java Programming",

        topic:
            "Variables",

        question:
            "Which keyword is used to declare a constant in Java?",

        options: [
            "static",
            "final",
            "const",
            "fixed"
        ],

        answer:
            1
    },


    {
        subject:
            "Java Programming",

        topic:
            "Variables",

        question:
            "Which data type is commonly used for whole numbers in Java?",

        options: [
            "String",
            "boolean",
            "int",
            "char"
        ],

        answer:
            2
    },


    {
        subject:
            "Java Programming",

        topic:
            "Inheritance",

        question:
            "Which keyword is used for class inheritance in Java?",

        options: [
            "implements",
            "inherits",
            "extends",
            "super"
        ],

        answer:
            2
    },


    {
        subject:
            "Java Programming",

        topic:
            "Inheritance",

        question:
            "Java supports multiple inheritance of classes directly.",

        options: [
            "True",
            "False",
            "Only with constructors",
            "Only with static classes"
        ],

        answer:
            1
    },


    {
        subject:
            "Java Programming",

        topic:
            "Polymorphism",

        question:
            "Method overloading is an example of which type of polymorphism?",

        options: [
            "Runtime",
            "Compile-time",
            "Dynamic only",
            "None"
        ],

        answer:
            1
    },


    {
        subject:
            "Java Programming",

        topic:
            "Polymorphism",

        question:
            "Method overriding is mainly associated with which concept?",

        options: [
            "Runtime polymorphism",
            "Variable declaration",
            "Looping",
            "Arrays"
        ],

        answer:
            0
    },


    // =====================================
    // DBMS
    // =====================================

    {
        subject:
            "DBMS",

        topic:
            "Normalization",

        question:
            "What is the main purpose of normalization?",

        options: [
            "Increase redundancy",
            "Reduce data redundancy",
            "Delete tables",
            "Increase duplicate records"
        ],

        answer:
            1
    },


    {
        subject:
            "DBMS",

        topic:
            "Normalization",

        question:
            "First Normal Form mainly removes which type of values?",

        options: [
            "Atomic values",
            "Repeating groups",
            "Primary keys",
            "Foreign keys"
        ],

        answer:
            1
    },


    {
        subject:
            "DBMS",

        topic:
            "SQL",

        question:
            "Which SQL command is used to retrieve data?",

        options: [
            "DELETE",
            "UPDATE",
            "SELECT",
            "DROP"
        ],

        answer:
            2
    },


    {
        subject:
            "DBMS",

        topic:
            "SQL",

        question:
            "Which SQL command removes a table completely?",

        options: [
            "DELETE",
            "REMOVE",
            "DROP",
            "CLEAR"
        ],

        answer:
            2
    },


    {
        subject:
            "DBMS",

        topic:
            "Keys",

        question:
            "Which key uniquely identifies each record in a table?",

        options: [
            "Foreign Key",
            "Primary Key",
            "Alternate Table",
            "Index"
        ],

        answer:
            1
    },


    // =====================================
    // MATHEMATICS
    // =====================================

    {
        subject:
            "Mathematics",

        topic:
            "Algebra",

        question:
            "What is the value of x if x + 5 = 10?",

        options: [
            "3",
            "5",
            "10",
            "15"
        ],

        answer:
            1
    },


    {
        subject:
            "Mathematics",

        topic:
            "Algebra",

        question:
            "What is 3 × 4 + 2?",

        options: [
            "14",
            "18",
            "20",
            "24"
        ],

        answer:
            0
    },


    {
        subject:
            "Mathematics",

        topic:
            "Integration",

        question:
            "Integration is commonly considered the reverse process of:",

        options: [
            "Multiplication",
            "Differentiation",
            "Division",
            "Factorization"
        ],

        answer:
            1
    },


    {
        subject:
            "Mathematics",

        topic:
            "Integration",

        question:
            "The integral of 1 with respect to x is:",

        options: [
            "1",
            "x + C",
            "0",
            "x²"
        ],

        answer:
            1
    }

];


// =====================================
// ELEMENTS
// =====================================

const subjectSelect =
    document.getElementById(
        "subjectSelect"
    );


const topicSelect =
    document.getElementById(
        "topicSelect"
    );


const questionCount =
    document.getElementById(
        "questionCount"
    );


const quizSetup =
    document.getElementById(
        "quizSetup"
    );


const quizArea =
    document.getElementById(
        "quizArea"
    );


const resultArea =
    document.getElementById(
        "resultArea"
    );


const startQuizBtn =
    document.getElementById(
        "startQuizBtn"
    );


const questionText =
    document.getElementById(
        "questionText"
    );


const currentTopic =
    document.getElementById(
        "currentTopic"
    );


const optionsContainer =
    document.getElementById(
        "optionsContainer"
    );


const questionCounter =
    document.getElementById(
        "questionCounter"
    );


const quizProgress =
    document.getElementById(
        "quizProgress"
    );


const liveScore =
    document.getElementById(
        "liveScore"
    );


const quizSubject =
    document.getElementById(
        "quizSubject"
    );


const answerMessage =
    document.getElementById(
        "answerMessage"
    );


const nextQuestionBtn =
    document.getElementById(
        "nextQuestionBtn"
    );


const quitQuizBtn =
    document.getElementById(
        "quitQuizBtn"
    );


const newQuizBtn =
    document.getElementById(
        "newQuizBtn"
    );


// =====================================
// QUIZ STATE
// =====================================

let quizQuestions =
    [];


let currentQuestionIndex =
    0;


let score =
    0;


let answered =
    false;


let selectedSubject =
    "";


let selectedTopic =
    "";


// Stores current quiz result topic-wise.
// This is what will be sent to MongoDB.

let currentTopicResults =
    {};


// Prevent same result from being saved twice.

let quizResultSaved =
    false;


// =====================================
// SUBJECT LIST
// =====================================

function loadSubjects() {

    const subjects = [

        ...new Set(
            questionBank.map(
                question =>
                    question.subject
            )
        )

    ];


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


            subjectSelect.appendChild(
                option
            );

        }
    );

}


loadSubjects();


// =====================================
// TOPICS
// =====================================

subjectSelect.addEventListener(
    "change",
    function () {

        const subject =
            this.value;


        topicSelect.innerHTML = `

            <option value="">
                Select Topic
            </option>

            <option value="all">
                All Topics
            </option>

        `;


        if (!subject) {

            topicSelect.disabled =
                true;

            return;

        }


        const topics = [

            ...new Set(

                questionBank
                    .filter(
                        question =>
                            question.subject ===
                            subject
                    )
                    .map(
                        question =>
                            question.topic
                    )

            )

        ];


        topics.forEach(
            topic => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    topic;


                option.textContent =
                    topic;


                topicSelect.appendChild(
                    option
                );

            }
        );


        topicSelect.disabled =
            false;

    }
);


// =====================================
// SHUFFLE
// =====================================

function shuffleArray(array) {

    const copy =
        [...array];


    for (
        let i =
            copy.length - 1;

        i > 0;

        i--
    ) {

        const randomIndex =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            copy[i],
            copy[randomIndex]
        ] = [
            copy[randomIndex],
            copy[i]
        ];

    }


    return copy;

}


// =====================================
// START QUIZ
// =====================================

startQuizBtn.addEventListener(
    "click",
    function () {

        selectedSubject =
            subjectSelect.value;


        selectedTopic =
            topicSelect.value;


        if (
            !selectedSubject ||
            !selectedTopic
        ) {

            alert(
                "Please select subject and topic."
            );

            return;

        }


        let availableQuestions =
            questionBank.filter(
                question =>
                    question.subject ===
                    selectedSubject
            );


        if (
            selectedTopic !==
            "all"
        ) {

            availableQuestions =
                availableQuestions.filter(
                    question =>
                        question.topic ===
                        selectedTopic
                );

        }


        const requestedCount =
            Number(
                questionCount.value
            );


        quizQuestions =
            shuffleArray(
                availableQuestions
            )
                .slice(
                    0,
                    Math.min(
                        requestedCount,
                        availableQuestions.length
                    )
                );


        if (
            quizQuestions.length === 0
        ) {

            alert(
                "No questions available for this topic."
            );

            return;

        }


        currentQuestionIndex =
            0;


        score =
            0;


        answered =
            false;


        currentTopicResults =
            {};


        quizResultSaved =
            false;


        liveScore.textContent =
            "0";


        nextQuestionBtn.textContent =
            "Next Question";


        quizSetup.classList.add(
            "hidden"
        );


        resultArea.classList.add(
            "hidden"
        );


        quizArea.classList.remove(
            "hidden"
        );


        quizSubject.textContent =
            selectedSubject;


        renderQuestion();

    }
);


// =====================================
// RENDER QUESTION
// =====================================

function renderQuestion() {

    answered =
        false;


    nextQuestionBtn.disabled =
        true;


    answerMessage.textContent =
        "";


    answerMessage.className =
        "answer-message";


    const question =
        quizQuestions[
            currentQuestionIndex
        ];


    questionText.textContent =
        question.question;


    currentTopic.textContent =
        question.topic;


    questionCounter.textContent =
        `Question ${
            currentQuestionIndex + 1
        } of ${
            quizQuestions.length
        }`;


    const progress =
        (
            (
                currentQuestionIndex
                +
                1
            )
            /
            quizQuestions.length
        ) * 100;


    quizProgress.style.width =
        progress + "%";


    optionsContainer.innerHTML =
        "";


    question.options.forEach(
        (option, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "option-btn";


            button.textContent =
                `${String.fromCharCode(
                    65 + index
                )}. ${option}`;


            button.addEventListener(
                "click",
                function () {

                    selectAnswer(
                        index,
                        button
                    );

                }
            );


            optionsContainer.appendChild(
                button
            );

        }
    );

}


// =====================================
// SELECT ANSWER
// =====================================

function selectAnswer(
    selectedIndex,
    selectedButton
) {

    if (answered) {

        return;

    }


    answered =
        true;


    const question =
        quizQuestions[
            currentQuestionIndex
        ];


    const buttons =
        optionsContainer
            .querySelectorAll(
                ".option-btn"
            );


    buttons.forEach(
        button => {

            button.disabled =
                true;

        }
    );


    const isCorrect =
        selectedIndex ===
        question.answer;


    if (isCorrect) {

        score++;


        selectedButton
            .classList
            .add(
                "correct"
            );


        answerMessage.textContent =
            "✓ Correct answer!";


        answerMessage
            .classList
            .add(
                "correct-message"
            );

    } else {

        selectedButton
            .classList
            .add(
                "wrong"
            );


        const correctButton =
            buttons[
                question.answer
            ];


        if (correctButton) {

            correctButton
                .classList
                .add(
                    "correct"
                );

        }


        answerMessage.textContent =
            "✕ Incorrect. Correct answer is highlighted.";


        answerMessage
            .classList
            .add(
                "wrong-message"
            );

    }


    // Existing localStorage tracking

    updateTopicPerformance(
        question,
        isCorrect
    );


    // NEW MongoDB topic tracking

    recordTopicResult(
        question,
        isCorrect
    );


    liveScore.textContent =
        score;


    nextQuestionBtn.disabled =
        false;


    if (
        currentQuestionIndex ===
        quizQuestions.length - 1
    ) {

        nextQuestionBtn.textContent =
            "View Result";

    } else {

        nextQuestionBtn.textContent =
            "Next Question";

    }

}


// =====================================
// CURRENT QUIZ TOPIC RESULT
// =====================================

function recordTopicResult(
    question,
    isCorrect
) {

    const key =
        question.subject +
        "||" +
        question.topic;


    if (
        !currentTopicResults[key]
    ) {

        currentTopicResults[key] = {

            subject:
                question.subject,

            topic:
                question.topic,

            score:
                0,

            totalQuestions:
                0

        };

    }


    currentTopicResults[key]
        .totalQuestions++;


    if (isCorrect) {

        currentTopicResults[key]
            .score++;

    }

}


// =====================================
// NEXT QUESTION
// =====================================

nextQuestionBtn.addEventListener(
    "click",
    async function () {

        if (!answered) {

            return;

        }


        if (
            currentQuestionIndex <
            quizQuestions.length - 1
        ) {

            currentQuestionIndex++;


            renderQuestion();

        } else {

            nextQuestionBtn.disabled =
                true;


            await finishQuiz();

        }

    }
);


// =====================================
// PERFORMANCE TRACKING - LOCAL
// =====================================

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

    } catch (error) {

        console.error(
            "Performance Data Error:",
            error
        );


        return {};

    }

}


// =====================================
// UPDATE LOCAL TOPIC PERFORMANCE
// =====================================

function updateTopicPerformance(
    question,
    correct
) {

    const performance =
        getPerformance();


    const key =
        question.subject +
        "||" +
        question.topic;


    if (
        !performance[key]
    ) {

        performance[key] = {

            subject:
                question.subject,

            topic:
                question.topic,

            attempts:
                0,

            correct:
                0

        };

    }


    performance[key]
        .attempts++;


    if (correct) {

        performance[key]
            .correct++;

    }


    localStorage.setItem(
        performanceKey,
        JSON.stringify(
            performance
        )
    );

}


// =====================================
// SAVE CURRENT QUIZ TO DATABASE
// =====================================

async function saveQuizResultsToDatabase() {

    if (
        quizResultSaved
    ) {

        return;

    }


    const results =
        Object.values(
            currentTopicResults
        );


    if (
        results.length === 0
    ) {

        return;

    }


    for (
        const result of results
    ) {

        const data =
            await quizApiFetch(
                QUIZ_ATTEMPT_API,
                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            subject:
                                result.subject,

                            topic:
                                result.topic,

                            score:
                                result.score,

                            totalQuestions:
                                result.totalQuestions

                        })

                }
            );


        console.log(
            "Quiz attempt saved:",
            data.attempt
        );

    }


    quizResultSaved =
        true;


    console.log(
        "All topic results saved to MongoDB."
    );

}


// =====================================
// QUIZ FINISH
// =====================================

async function finishQuiz() {

    const percentage =
        Math.round(
            (
                score /
                quizQuestions.length
            ) * 100
        );


    // =====================================
    // SAVE LOCAL HISTORY
    // =====================================

    saveQuizHistory(
        percentage
    );


    // =====================================
    // SHOW RESULT
    // =====================================

    quizArea.classList.add(
        "hidden"
    );


    resultArea.classList.remove(
        "hidden"
    );


    document.getElementById(
        "resultScore"
    ).textContent =
        percentage + "%";


    document.getElementById(
        "correctAnswers"
    ).textContent =
        score;


    document.getElementById(
        "wrongAnswers"
    ).textContent =
        quizQuestions.length -
        score;


    document.getElementById(
        "totalAnswers"
    ).textContent =
        quizQuestions.length;


    const resultMessage =
        document.getElementById(
            "resultMessage"
        );


    if (
        percentage >= 80
    ) {

        resultMessage.textContent =
            "Excellent performance! 🚀";

    } else if (
        percentage >= 60
    ) {

        resultMessage.textContent =
            "Good work! Keep practicing.";

    } else {

        resultMessage.textContent =
            "Keep practicing your weak topics.";

    }


    // =====================================
    // UPDATE LOCAL UI
    // =====================================

    renderDashboardStats();


    renderHistory();


    renderWeakTopics();


    // =====================================
    // SAVE TO MONGODB
    // =====================================

    try {

        await saveQuizResultsToDatabase();


        console.log(
            "Quiz successfully synced with Weak Topic Detector."
        );

    } catch (error) {

        console.error(
            "Quiz Database Save Error:",
            error
        );


        resultMessage.textContent +=
            " Result could not be synced with the server.";

    }

}


// =====================================
// QUIZ HISTORY
// =====================================

function getHistory() {

    try {

        const history =
            JSON.parse(
                localStorage.getItem(
                    historyKey
                ) || "[]"
            );


        return Array.isArray(
            history
        )
            ? history
            : [];

    } catch (error) {

        console.error(
            "Quiz History Error:",
            error
        );


        return [];

    }

}


// =====================================
// SAVE QUIZ HISTORY
// =====================================

function saveQuizHistory(
    percentage
) {

    const history =
        getHistory();


    history.unshift({

        id:
            Date.now(),

        subject:
            selectedSubject,

        topic:
            selectedTopic === "all"
                ? "Mixed Topics"
                : selectedTopic,

        score,

        total:
            quizQuestions.length,

        percentage,

        date:
            new Date()
                .toISOString()

    });


    localStorage.setItem(
        historyKey,
        JSON.stringify(
            history.slice(
                0,
                50
            )
        )
    );

}


// =====================================
// STATISTICS
// =====================================

function renderDashboardStats() {

    const history =
        getHistory();


    const total =
        history.length;


    let average =
        0;


    let best =
        0;


    if (
        total > 0
    ) {

        average =
            Math.round(

                history.reduce(
                    (
                        sum,
                        quiz
                    ) =>
                        sum +
                        Number(
                            quiz.percentage || 0
                        ),

                    0
                )

                /

                total

            );


        best =
            Math.max(

                ...history.map(
                    quiz =>
                        Number(
                            quiz.percentage || 0
                        )
                )

            );

    }


    setText(
        "totalQuizzes",
        total
    );


    setText(
        "averageScore",
        average + "%"
    );


    setText(
        "bestScore",
        best + "%"
    );


    setText(
        "weakTopicCount",
        getWeakTopics().length
    );

}


// =====================================
// LOCAL WEAK TOPICS
// =====================================

function getWeakTopics() {

    const performance =
        getPerformance();


    return Object.values(
        performance
    )
        .map(
            item => {

                const accuracy =
                    item.attempts === 0

                        ? 0

                        : Math.round(
                            (
                                item.correct /
                                item.attempts
                            ) * 100
                        );


                return {

                    ...item,

                    accuracy

                };

            }
        )
        .filter(
            item =>

                item.attempts >= 1

                &&

                item.accuracy < 70
        )
        .sort(
            (
                a,
                b
            ) =>
                a.accuracy -
                b.accuracy
        );

}


// =====================================
// RENDER LOCAL WEAK TOPICS
// =====================================

function renderWeakTopics() {

    const weakTopics =
        getWeakTopics();


    const container =
        document.getElementById(
            "weakTopicsList"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    if (
        weakTopics.length === 0
    ) {

        container.innerHTML = `

            <p class="empty-message">

                No weak topics detected.
                Keep practicing!

            </p>

        `;


        return;

    }


    weakTopics.forEach(
        item => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "weak-item";


            const info =
                document.createElement(
                    "div"
                );


            const title =
                document.createElement(
                    "h3"
                );


            title.textContent =
                item.topic;


            const subject =
                document.createElement(
                    "p"
                );


            subject.textContent =
                `${item.subject} • ${
                    item.correct
                }/${
                    item.attempts
                } correct`;


            const scoreElement =
                document.createElement(
                    "span"
                );


            scoreElement.className =
                "weak-score";


            scoreElement.textContent =
                item.accuracy +
                "% Accuracy";


            info.append(
                title,
                subject
            );


            row.append(
                info,
                scoreElement
            );


            container.appendChild(
                row
            );

        }
    );

}


// =====================================
// RENDER HISTORY
// =====================================

function renderHistory() {

    const history =
        getHistory();


    const historyList =
        document.getElementById(
            "historyList"
        );


    if (!historyList) {

        return;

    }


    historyList.innerHTML =
        "";


    if (
        history.length === 0
    ) {

        historyList.innerHTML = `

            <p class="empty-message">

                No quizzes completed yet.

            </p>

        `;


        return;

    }


    history
        .slice(
            0,
            8
        )
        .forEach(
            quiz => {

                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    "history-item";


                const info =
                    document.createElement(
                        "div"
                    );


                const title =
                    document.createElement(
                        "h3"
                    );


                title.textContent =
                    quiz.subject;


                const topic =
                    document.createElement(
                        "p"
                    );


                topic.textContent =
                    quiz.topic;


                const scoreElement =
                    document.createElement(
                        "div"
                    );


                scoreElement.className =
                    "history-score";


                scoreElement.textContent =
                    quiz.percentage +
                    "%";


                const date =
                    document.createElement(
                        "div"
                    );


                date.className =
                    "history-date";


                date.textContent =
                    new Date(
                        quiz.date
                    )
                        .toLocaleDateString(
                            "en-IN",
                            {

                                day:
                                    "numeric",

                                month:
                                    "short",

                                year:
                                    "numeric"

                            }
                        );


                info.append(
                    title,
                    topic
                );


                row.append(
                    info,
                    scoreElement,
                    date
                );


                historyList.appendChild(
                    row
                );

            }
        );

}


// =====================================
// HELPER
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


// =====================================
// QUIT QUIZ
// =====================================

quitQuizBtn.addEventListener(
    "click",
    function () {

        const quit =
            confirm(
                "Quit this quiz? Current progress will be lost."
            );


        if (!quit) {

            return;

        }


        quizArea.classList.add(
            "hidden"
        );


        quizSetup.classList.remove(
            "hidden"
        );


        currentTopicResults =
            {};


        quizResultSaved =
            false;


        nextQuestionBtn.textContent =
            "Next Question";

    }
);


// =====================================
// NEW QUIZ
// =====================================

newQuizBtn.addEventListener(
    "click",
    function () {

        resultArea.classList.add(
            "hidden"
        );


        quizSetup.classList.remove(
            "hidden"
        );


        currentTopicResults =
            {};


        quizResultSaved =
            false;


        nextQuestionBtn.textContent =
            "Next Question";

    }
);


// =====================================
// INITIAL LOAD
// =====================================

renderDashboardStats();


renderHistory();


renderWeakTopics();