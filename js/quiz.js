// =====================================
// StudyRoom AI - Quiz System
// =====================================


// -------------------------------------
// Login Protection
// -------------------------------------

const QUIZ_API =
    "http://localhost:5000/api/quiz";

const quizToken =
    localStorage.getItem(
        "studyRoomToken"
    );


if (!quizToken) {

    window.location.href =
        "login.html";

}


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

        return;
    }


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Quiz request failed"
        );

    }


    return data;
} //add new code 

async function saveQuizResultToDatabase(
    subject,
    topic,
    score,
    totalQuestions
) {

    try {

        const data =
            await quizApiFetch(
                `${QUIZ_API}/attempts`,
                {
                    method:
                        "POST",

                    body:
                        JSON.stringify({
                            subject,
                            topic,
                            score,
                            totalQuestions
                        })
                }
            );


        console.log(
            "Quiz saved:",
            data.attempt
        );


        return data.attempt;

    } catch (error) {

        console.error(
            "Quiz save error:",
            error
        );


        alert(
            "Quiz completed, but result could not be saved."
        );

    }

} //add new funcation 
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


// -------------------------------------
// Storage Keys
// -------------------------------------

const userEmail =
    user.email.toLowerCase();


const historyKey =
    "quizHistory_" +
    userEmail;


const performanceKey =
    "quizPerformance_" +
    userEmail;


// =====================================
// Question Bank
// =====================================

const questionBank = [

    // Java

    {
        subject: "Java Programming",

        topic: "Variables",

        question:
            "Which keyword is used to declare a constant in Java?",

        options: [
            "static",
            "final",
            "const",
            "fixed"
        ],

        answer: 1
    },


    {
        subject: "Java Programming",

        topic: "Variables",

        question:
            "Which data type is commonly used for whole numbers in Java?",

        options: [
            "String",
            "boolean",
            "int",
            "char"
        ],

        answer: 2
    },


    {
        subject: "Java Programming",

        topic: "Inheritance",

        question:
            "Which keyword is used for class inheritance in Java?",

        options: [
            "implements",
            "inherits",
            "extends",
            "super"
        ],

        answer: 2
    },


    {
        subject: "Java Programming",

        topic: "Inheritance",

        question:
            "Java supports multiple inheritance of classes directly.",

        options: [
            "True",
            "False",
            "Only with constructors",
            "Only with static classes"
        ],

        answer: 1
    },


    {
        subject: "Java Programming",

        topic: "Polymorphism",

        question:
            "Method overloading is an example of which type of polymorphism?",

        options: [
            "Runtime",
            "Compile-time",
            "Dynamic only",
            "None"
        ],

        answer: 1
    },


    {
        subject: "Java Programming",

        topic: "Polymorphism",

        question:
            "Method overriding is mainly associated with which concept?",

        options: [
            "Runtime polymorphism",
            "Variable declaration",
            "Looping",
            "Arrays"
        ],

        answer: 0
    },


    // DBMS

    {
        subject: "DBMS",

        topic: "Normalization",

        question:
            "What is the main purpose of normalization?",

        options: [
            "Increase redundancy",
            "Reduce data redundancy",
            "Delete tables",
            "Increase duplicate records"
        ],

        answer: 1
    },


    {
        subject: "DBMS",

        topic: "Normalization",

        question:
            "First Normal Form mainly removes which type of values?",

        options: [
            "Atomic values",
            "Repeating groups",
            "Primary keys",
            "Foreign keys"
        ],

        answer: 1
    },


    {
        subject: "DBMS",

        topic: "SQL",

        question:
            "Which SQL command is used to retrieve data?",

        options: [
            "DELETE",
            "UPDATE",
            "SELECT",
            "DROP"
        ],

        answer: 2
    },


    {
        subject: "DBMS",

        topic: "SQL",

        question:
            "Which SQL command removes a table completely?",

        options: [
            "DELETE",
            "REMOVE",
            "DROP",
            "CLEAR"
        ],

        answer: 2
    },


    {
        subject: "DBMS",

        topic: "Keys",

        question:
            "Which key uniquely identifies each record in a table?",

        options: [
            "Foreign Key",
            "Primary Key",
            "Alternate Table",
            "Index"
        ],

        answer: 1
    },


    // Mathematics

    {
        subject: "Mathematics",

        topic: "Algebra",

        question:
            "What is the value of x if x + 5 = 10?",

        options: [
            "3",
            "5",
            "10",
            "15"
        ],

        answer: 1
    },


    {
        subject: "Mathematics",

        topic: "Algebra",

        question:
            "What is 3 × 4 + 2?",

        options: [
            "14",
            "18",
            "20",
            "24"
        ],

        answer: 0
    },


    {
        subject: "Mathematics",

        topic: "Integration",

        question:
            "Integration is commonly considered the reverse process of:",

        options: [
            "Multiplication",
            "Differentiation",
            "Division",
            "Factorization"
        ],

        answer: 1
    },


    {
        subject: "Mathematics",

        topic: "Integration",

        question:
            "The integral of 1 with respect to x is:",

        options: [
            "1",
            "x + C",
            "0",
            "x²"
        ],

        answer: 1
    }

];


// =====================================
// Elements
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
// Quiz State
// =====================================

let quizQuestions = [];

let currentQuestionIndex = 0;

let score = 0;

let answered = false;

let selectedSubject = "";

let selectedTopic = "";


// =====================================
// Subject List
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
// Topics
// =====================================

subjectSelect.addEventListener(
    "change",
    function() {

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
// Shuffle
// =====================================

function shuffleArray(array) {

    const copy =
        [...array];


    for (
        let i = copy.length - 1;
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
// Start Quiz
// =====================================

startQuizBtn.addEventListener(
    "click",
    function() {

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
            selectedTopic !== "all"
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


        currentQuestionIndex = 0;

        score = 0;

        answered = false;


        liveScore.textContent =
            "0";


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
// Render Question
// =====================================

function renderQuestion() {

    answered = false;


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
            currentQuestionIndex /
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


            button.className =
                "option-btn";


            button.textContent =
                `${String.fromCharCode(
                    65 + index
                )}. ${option}`;


            button.addEventListener(
                "click",
                function() {

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
// Select Answer
// =====================================

function selectAnswer(
    selectedIndex,
    selectedButton
) {

    if (answered)
        return;


    answered = true;


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


        selectedButton.classList.add(
            "correct"
        );


        answerMessage.textContent =
            "✓ Correct answer!";


        answerMessage.classList.add(
            "correct-message"
        );

    } else {

        selectedButton.classList.add(
            "wrong"
        );


        buttons[
            question.answer
        ]
        .classList.add(
            "correct"
        );


        answerMessage.textContent =
            "✕ Incorrect. Correct answer is highlighted.";


        answerMessage.classList.add(
            "wrong-message"
        );

    }


    updateTopicPerformance(
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
// Next Question
// =====================================

nextQuestionBtn.addEventListener(
    "click",
    function() {

        if (!answered)
            return;


        if (
            currentQuestionIndex <
            quizQuestions.length - 1
        ) {

            currentQuestionIndex++;

            renderQuestion();

        } else {

            finishQuiz();

        }

    }
);


// =====================================
// Performance Tracking
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

    } catch {

        return {};

    }

}


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


    if (!performance[key]) {

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


    performance[key].attempts++;


    if (correct) {

        performance[key].correct++;

    }


    localStorage.setItem(
        performanceKey,
        JSON.stringify(
            performance
        )
    );

}


// =====================================
// Quiz Finish
// =====================================

function finishQuiz() {

    const percentage =
        Math.round(
            (
                score /
                quizQuestions.length
            ) * 100
        );


    saveQuizHistory(
        percentage
    );


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


    if (percentage >= 80) {

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


    renderDashboardStats();

    renderHistory();

    renderWeakTopics();

}


// =====================================
// Quiz History
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

    } catch {

        return [];

    }

}


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

        score:
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
// Statistics
// =====================================

function renderDashboardStats() {

    const history =
        getHistory();


    const total =
        history.length;


    let average = 0;

    let best = 0;


    if (total > 0) {

        average =
            Math.round(

                history.reduce(
                    (
                        sum,
                        quiz
                    ) =>
                        sum +
                        quiz.percentage,

                    0
                ) / total

            );


        best =
            Math.max(

                ...history.map(
                    quiz =>
                        quiz.percentage
                )

            );

    }


    document.getElementById(
        "totalQuizzes"
    ).textContent =
        total;


    document.getElementById(
        "averageScore"
    ).textContent =
        average + "%";


    document.getElementById(
        "bestScore"
    ).textContent =
        best + "%";


    document.getElementById(
        "weakTopicCount"
    ).textContent =
        getWeakTopics().length;

}


// =====================================
// Weak Topics
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
            item.attempts >= 1 &&
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


function renderWeakTopics() {

    const weakTopics =
        getWeakTopics();


    const container =
        document.getElementById(
            "weakTopicsList"
        );


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


            const score =
                document.createElement(
                    "span"
                );


            score.className =
                "weak-score";


            score.textContent =
                item.accuracy +
                "% Accuracy";


            info.append(
                title,
                subject
            );


            row.append(
                info,
                score
            );


            container.appendChild(
                row
            );

        }
    );

}


// =====================================
// Render History
// =====================================

function renderHistory() {

    const history =
        getHistory();


    const historyList =
        document.getElementById(
            "historyList"
        );


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
        .slice(0, 8)
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


                const score =
                    document.createElement(
                        "div"
                    );


                score.className =
                    "history-score";


                score.textContent =
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
                    score,
                    date
                );


                historyList.appendChild(
                    row
                );

            }
        );

}


// =====================================
// Quit Quiz
// =====================================

quitQuizBtn.addEventListener(
    "click",
    function() {

        const quit =
            confirm(
                "Quit this quiz? Current progress will be lost."
            );


        if (!quit)
            return;


        quizArea.classList.add(
            "hidden"
        );


        quizSetup.classList.remove(
            "hidden"
        );

    }
);


// =====================================
// New Quiz
// =====================================

newQuizBtn.addEventListener(
    "click",
    function() {

        resultArea.classList.add(
            "hidden"
        );


        quizSetup.classList.remove(
            "hidden"
        );

    }
);


// =====================================
// Initial Load
// =====================================

renderDashboardStats();

renderHistory();

renderWeakTopics();