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
// ELEMENTS
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
// LOAD SAVED SETTINGS
// =====================================

function getSavedSettings() {

    try {

        const saved =
            localStorage.getItem(
                "studyRoomSettings"
            );


        if (!saved) {

            return {};

        }


        return JSON.parse(
            saved
        ) || {};

    } catch (error) {

        console.error(
            "Could not read timer settings:",
            error
        );


        return {};

    }

}


const savedSettings =
    getSavedSettings();


// =====================================
// URL PARAMETERS
// =====================================

const params =
    new URLSearchParams(
        window.location.search
    );


const selectedSubject =
    params.get(
        "subject"
    );


const selectedTopic =
    params.get(
        "topic"
    );


const requestedMinutes =
    Number(
        params.get(
            "minutes"
        )
    );


// =====================================
// TIMER DURATIONS
// =====================================

// Saved default focus duration
const savedFocusMinutes =
    Number(
        savedSettings.focusDuration
    );


// Saved default break duration
const savedBreakMinutes =
    Number(
        savedSettings.breakDuration
    );


// URL duration gets first priority.
// Otherwise use Settings.
// Otherwise use 25 minutes.

const focusMinutes =

    Number.isInteger(
        requestedMinutes
    )

    &&

    requestedMinutes >= 1

    &&

    requestedMinutes <= 300

        ? requestedMinutes

        : (
            Number.isInteger(
                savedFocusMinutes
            )

            &&

            savedFocusMinutes >= 1

            &&

            savedFocusMinutes <= 300

                ? savedFocusMinutes

                : 25
        );


// Break duration comes from Settings

const breakMinutes =

    Number.isInteger(
        savedBreakMinutes
    )

    &&

    savedBreakMinutes >= 1

    &&

    savedBreakMinutes <= 120

        ? savedBreakMinutes

        : 5;


// =====================================
// PRE-FILL SUBJECT
// =====================================

if (
    selectedSubject &&
    subjectInput
) {

    subjectInput.value =
        selectedSubject.slice(
            0,
            100
        );

}


// =====================================
// TIMER STATE
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
            "Request failed"
        );

    }


    return data;

}


// =====================================
// LOAD SESSIONS
// =====================================

async function loadSessions() {

    try {

        const data =
            await apiFetch(
                API_URL
            );


        sessions =
            Array.isArray(
                data.sessions
            )
                ? data.sessions
                : [];


        renderHistory();

    } catch (error) {

        console.error(
            "Load Sessions Error:",
            error
        );


        if (statusText) {

            statusText.textContent =
                "Could not load session history.";

        }

    }

}


// =====================================
// TIMER HELPERS
// =====================================

function getTotalSeconds() {

    return currentMode ===
        "focus"

        ? focusMinutes * 60

        : breakMinutes * 60;

}


function formatTime(
    seconds
) {

    const minutes =
        Math.floor(
            seconds / 60
        );


    const secs =
        seconds % 60;


    return (
        String(
            minutes
        )
            .padStart(
                2,
                "0"
            )

        +

        ":"

        +

        String(
            secs
        )
            .padStart(
                2,
                "0"
            )
    );

}


// =====================================
// UPDATE DISPLAY
// =====================================

function updateDisplay() {

    if (display) {

        display.textContent =
            formatTime(
                remainingSeconds
            );

    }


    const total =
        getTotalSeconds();


    let percentage =
        0;


    if (
        total > 0
    ) {

        percentage =
            (
                (
                    total -
                    remainingSeconds
                )

                /

                total

            ) * 100;

    }


    if (timerRing) {

        timerRing.style.setProperty(
            "--progress",
            `${percentage}%`
        );

    }


    if (startBtn) {

        startBtn.disabled =
            running;

    }


    if (pauseBtn) {

        pauseBtn.disabled =
            !running;

    }


    document.title =
        `${formatTime(
            remainingSeconds
        )} | StudyRoom AI`;

}


// =====================================
// STOP INTERVAL
// =====================================

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
// SET MODE
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


    if (focusModeBtn) {

        focusModeBtn.classList.toggle(
            "active",
            mode === "focus"
        );

    }


    if (breakModeBtn) {

        breakModeBtn.classList.toggle(
            "active",
            mode === "break"
        );

    }


    if (timerLabel) {

        timerLabel.textContent =
            mode === "focus"

                ? "FOCUS SESSION"

                : "SHORT BREAK";

    }


    if (timerDescription) {

        timerDescription.textContent =
            mode === "focus"

                ? "Time to concentrate"

                : "Time to recharge";

    }


    if (statusText) {

        statusText.textContent =
            message

            ||

            (
                mode === "focus"

                    ? "Ready for your focus session."

                    : "Ready for your break."
            );

    }


    updateDisplay();

}


// =====================================
// START TIMER
// =====================================

function startTimer() {

    if (running) {

        return;

    }


    if (
        currentMode ===
        "focus"
    ) {

        const subject =
            subjectInput
                ?.value
                ?.trim();


        activeSubject =
            subject ||
            "General Study";


        // Add topic to saved session name
        // if it came from Dashboard/Planner

        if (
            selectedTopic &&
            selectedTopic.trim()
        ) {

            activeSubject =
                `${activeSubject} - ${selectedTopic.trim()}`;

        }

    }


    running =
        true;


    endTime =
        Date.now()

        +

        remainingSeconds *
        1000;


    if (statusText) {

        statusText.textContent =
            currentMode === "focus"

                ? "Your focus session is running."

                : "Enjoy your break.";

    }


    intervalId =
        setInterval(
            updateTimer,
            250
        );


    updateTimer();

}


// =====================================
// UPDATE TIMER
// =====================================

function updateTimer() {

    if (!running) {

        return;

    }


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
// PAUSE
// =====================================

function pauseTimer() {

    if (!running) {

        return;

    }


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


    if (statusText) {

        statusText.textContent =
            "Timer paused.";

    }


    updateDisplay();

}


// =====================================
// RESET
// =====================================

function resetTimer() {

    stopInterval();


    remainingSeconds =
        getTotalSeconds();


    if (statusText) {

        statusText.textContent =
            "Timer reset.";

    }


    updateDisplay();

}


// =====================================
// SAVE FOCUS SESSION
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
// FINISH TIMER
// =====================================

async function finishTimer() {

    const completedMode =
        currentMode;


    stopInterval();


    if (
        completedMode ===
        "focus"
    ) {

        if (statusText) {

            statusText.textContent =
                "Saving completed session...";

        }


        try {

            await saveSession();


            await loadSessions();


            setMode(

                "break",

                `Focus session saved! Take a ${breakMinutes}-minute break.`

            );

        } catch (error) {

            console.error(
                "Save Focus Session Error:",
                error
            );


            setMode(

                "break",

                `Focus finished, but the session could not be saved. Take a ${breakMinutes}-minute break.`

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
// HISTORY / STATISTICS
// =====================================

function renderHistory() {

    const today =
        new Date()
            .toDateString();


    const todaySessions =
        sessions.filter(
            (item) => {

                return (
                    new Date(
                        item.completedAt
                    )
                        .toDateString()

                    ===

                    today
                );

            }
        );


    const totalMinutes =
        todaySessions.reduce(
            (sum, item) => {

                return (
                    sum +
                    Number(
                        item.minutes || 0
                    )
                );

            },
            0
        );


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    const todayStudyTime =
        document.getElementById(
            "todayStudyTime"
        );


    if (todayStudyTime) {

        todayStudyTime.textContent =
            hours > 0

                ? `${hours}h ${minutes}m`

                : `${minutes} min`;

    }


    const todaySessionsElement =
        document.getElementById(
            "todaySessions"
        );


    if (todaySessionsElement) {

        todaySessionsElement.textContent =
            todaySessions.length;

    }


    const historyList =
        document.getElementById(
            "historyList"
        );


    if (!historyList) {

        return;

    }


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
            (item) => {

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
                    item.subject ||
                    "General Study";


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
// EVENTS
// =====================================

if (startBtn) {

    startBtn.addEventListener(
        "click",
        startTimer
    );

}


if (pauseBtn) {

    pauseBtn.addEventListener(
        "click",
        pauseTimer
    );

}


if (resetBtn) {

    resetBtn.addEventListener(
        "click",
        resetTimer
    );

}


if (focusModeBtn) {

    focusModeBtn.addEventListener(
        "click",
        () => {

            setMode(
                "focus"
            );

        }
    );

}


if (breakModeBtn) {

    breakModeBtn.addEventListener(
        "click",
        () => {

            setMode(
                "break"
            );

        }
    );

}


document.addEventListener(
    "visibilitychange",
    function () {

        if (
            running
        ) {

            updateTimer();

        }

    }
);


// =====================================
// INITIALIZE
// =====================================

if (focusModeBtn) {

    focusModeBtn.textContent =
        `Focus (${focusMinutes}m)`;

}


if (breakModeBtn) {

    breakModeBtn.textContent =
        `Break (${breakMinutes}m)`;

}


setMode(
    "focus"
);


loadSessions();