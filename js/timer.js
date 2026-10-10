const API_URL =
    "http://localhost:5000/api/focus-sessions";


const token =
    localStorage.getItem(
        "studyRoomToken"
    );


if (!token) {

    window.location.href =
        "login.html";

}


// =====================================
// Elements
// =====================================

const display =
    document.getElementById(
        "timerDisplay"
    );

const timerRing =
    document.getElementById(
        "timerRing"
    );

const timerLabel =
    document.getElementById(
        "timerLabel"
    );

const timerDescription =
    document.getElementById(
        "timerDescription"
    );

const statusText =
    document.getElementById(
        "timerStatus"
    );


const focusModeBtn =
    document.getElementById(
        "focusMode"
    );

const breakModeBtn =
    document.getElementById(
        "breakMode"
    );


const startBtn =
    document.getElementById(
        "startBtn"
    );

const pauseBtn =
    document.getElementById(
        "pauseBtn"
    );

const resetBtn =
    document.getElementById(
        "resetBtn"
    );

const subjectInput =
    document.getElementById(
        "subjectInput"
    );


let sessions = [];


// =====================================
// URL Parameters
// =====================================

const params =
    new URLSearchParams(
        window.location.search
    );


const selectedSubject =
    params.get("subject");


const requestedMinutes =
    Number(
        params.get("minutes")
    );


const focusMinutes =

    Number.isInteger(
        requestedMinutes
    )

    &&

    requestedMinutes >= 1

    &&

    requestedMinutes <= 300

        ? requestedMinutes

        : 25;


const breakMinutes =
    5;


if (selectedSubject) {

    subjectInput.value =
        selectedSubject.slice(
            0,
            100
        );

}


// =====================================
// Timer State
// =====================================

let currentMode =
    "focus";


let remainingSeconds =
    focusMinutes * 60;


let running =
    false;


let intervalId =
    null;


let endTime =
    null;


let activeSubject =
    "General Study";


// =====================================
// API Helper
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
            "Request failed"
        );

    }


    return data;
}


// =====================================
// Load Sessions
// =====================================

async function loadSessions() {

    try {

        const data =
            await apiFetch(
                API_URL
            );


        sessions =
            data.sessions;


        renderHistory();

    } catch (error) {

        console.error(
            error
        );


        statusText.textContent =
            "Could not load session history.";

    }

}


// =====================================
// Timer Helpers
// =====================================

function getTotalSeconds() {

    return currentMode === "focus"

        ? focusMinutes * 60

        : breakMinutes * 60;

}


function formatTime(seconds) {

    const minutes =
        Math.floor(
            seconds / 60
        );


    const secs =
        seconds % 60;


    return (
        String(minutes)
            .padStart(2, "0")

        +

        ":"

        +

        String(secs)
            .padStart(2, "0")
    );

}


function updateDisplay() {

    display.textContent =
        formatTime(
            remainingSeconds
        );


    const total =
        getTotalSeconds();


    const percentage =

        (
            (
                total -
                remainingSeconds
            )

            /

            total
        )

        * 100;


    timerRing.style.setProperty(
        "--progress",
        percentage + "%"
    );


    startBtn.disabled =
        running;


    pauseBtn.disabled =
        !running;


    document.title =
        `${formatTime(
            remainingSeconds
        )} | StudyRoom AI`;

}


function stopInterval() {

    if (
        intervalId !== null
    ) {

        clearInterval(
            intervalId
        );


        intervalId =
            null;

    }


    running =
        false;


    endTime =
        null;

}


// =====================================
// Set Mode
// =====================================

function setMode(
    mode,
    message
) {

    stopInterval();


    currentMode =
        mode;


    remainingSeconds =
        getTotalSeconds();


    focusModeBtn.classList.toggle(
        "active",
        mode === "focus"
    );


    breakModeBtn.classList.toggle(
        "active",
        mode === "break"
    );


    timerLabel.textContent =

        mode === "focus"

            ? "FOCUS SESSION"

            : "SHORT BREAK";


    timerDescription.textContent =

        mode === "focus"

            ? "Time to concentrate"

            : "Time to recharge";


    statusText.textContent =

        message

        ||

        (
            mode === "focus"

                ? "Ready for your focus session."

                : "Ready for your break."
        );


    updateDisplay();

}


// =====================================
// Start Timer
// =====================================

function startTimer() {

    if (running)
        return;


    if (
        currentMode ===
        "focus"
    ) {

        activeSubject =

            subjectInput
                .value
                .trim()

            ||

            "General Study";

    }


    running =
        true;


    endTime =
        Date.now()

        +

        remainingSeconds *
        1000;


    statusText.textContent =

        currentMode === "focus"

            ? "Your focus session is running."

            : "Enjoy your break.";


    intervalId =
        setInterval(
            updateTimer,
            250
        );


    updateTimer();

}


// =====================================
// Update Timer
// =====================================

function updateTimer() {

    if (!running)
        return;


    remainingSeconds =
        Math.max(

            0,

            Math.ceil(

                (
                    endTime -
                    Date.now()
                )

                /

                1000
            )

        );


    if (
        remainingSeconds === 0
    ) {

        finishTimer();

        return;

    }


    updateDisplay();

}


// =====================================
// Pause
// =====================================

function pauseTimer() {

    if (!running)
        return;


    remainingSeconds =
        Math.max(

            0,

            Math.ceil(

                (
                    endTime -
                    Date.now()
                )

                /

                1000
            )

        );


    stopInterval();


    statusText.textContent =
        "Timer paused.";


    updateDisplay();

}


// =====================================
// Reset
// =====================================

function resetTimer() {

    stopInterval();


    remainingSeconds =
        getTotalSeconds();


    statusText.textContent =
        "Timer reset.";


    updateDisplay();

}


// =====================================
// Save Focus Session
// =====================================

async function saveSession() {

    const data =
        await apiFetch(
            API_URL,
            {
                method:
                    "POST",

                body:
                    JSON.stringify({

                        subject:
                            activeSubject,

                        minutes:
                            focusMinutes

                    })
            }
        );


    return data.session;

}


// =====================================
// Finish Timer
// =====================================

async function finishTimer() {

    const completedMode =
        currentMode;


    stopInterval();


    if (
        completedMode ===
        "focus"
    ) {

        statusText.textContent =
            "Saving completed session...";


        try {

            await saveSession();


            await loadSessions();


            setMode(

                "break",

                "Focus session saved! Take a 5-minute break."

            );

        } catch (error) {

            console.error(
                error
            );


            setMode(

                "break",

                "Focus finished, but the session could not be saved."

            );

        }

    } else {

        setMode(

            "focus",

            "Break complete! Start another focus session when ready."

        );

    }

}


// =====================================
// History / Statistics
// =====================================

function renderHistory() {

    const today =
        new Date()
            .toDateString();


    const todaySessions =
        sessions.filter(
            item =>

                new Date(
                    item.completedAt
                )
                .toDateString()

                ===

                today
        );


    const totalMinutes =
        todaySessions.reduce(
            (sum, item) =>

                sum +
                Number(
                    item.minutes || 0
                ),

            0
        );


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    document.getElementById(
        "todayStudyTime"
    ).textContent =

        hours > 0

            ? `${hours}h ${minutes}m`

            : `${minutes} min`;


    document.getElementById(
        "todaySessions"
    ).textContent =
        todaySessions.length;


    const historyList =
        document.getElementById(
            "historyList"
        );


    historyList.replaceChildren();


    if (
        sessions.length === 0
    ) {

        const empty =
            document.createElement(
                "p"
            );


        empty.className =
            "empty-history";


        empty.textContent =
            "No completed sessions yet.";


        historyList.appendChild(
            empty
        );


        return;

    }


    sessions
        .slice(0, 5)
        .forEach(
            item => {

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
                        "strong"
                    );


                title.textContent =
                    item.subject;


                const date =
                    document.createElement(
                        "p"
                    );


                date.textContent =
                    new Date(
                        item.completedAt
                    )
                    .toLocaleString(
                        "en-IN"
                    );


                const duration =
                    document.createElement(
                        "span"
                    );


                duration.textContent =
                    `${item.minutes} min`;


                info.append(
                    title,
                    date
                );


                row.append(
                    info,
                    duration
                );


                historyList.appendChild(
                    row
                );

            }
        );

}


// =====================================
// Events
// =====================================

startBtn.addEventListener(
    "click",
    startTimer
);


pauseBtn.addEventListener(
    "click",
    pauseTimer
);


resetBtn.addEventListener(
    "click",
    resetTimer
);


focusModeBtn.addEventListener(
    "click",
    () =>
        setMode(
            "focus"
        )
);


breakModeBtn.addEventListener(
    "click",
    () =>
        setMode(
            "break"
        )
);


document.addEventListener(
    "visibilitychange",
    function () {

        if (running) {

            updateTimer();

        }

    }
);


// =====================================
// Initial
// =====================================

focusModeBtn.textContent =
    `Focus (${focusMinutes}m)`;


setMode(
    "focus"
);


loadSessions();