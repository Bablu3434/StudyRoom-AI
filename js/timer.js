
// StudyRoom AI - Focus Timer

// Demo login check
const loggedIn =
    localStorage.getItem("studyRoomLoggedIn") === "true";

const user = JSON.parse(
    localStorage.getItem("studyRoomUser") || "null"
);

if (!loggedIn || !user) {
    window.location.replace("login.html");
}

// Each demo user gets separate study history
const storageKey = "studyHistory_" +
    (user?.email || "guest").toLowerCase();

// Elements
const display = document.getElementById("timerDisplay");
const timerRing = document.getElementById("timerRing");
const timerLabel = document.getElementById("timerLabel");
const timerDescription = document.getElementById("timerDescription");
const statusText = document.getElementById("timerStatus");

const focusModeBtn = document.getElementById("focusMode");
const breakModeBtn = document.getElementById("breakMode");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const subjectInput = document.getElementById("subjectInput");

// Get selected subject/duration from dashboard
const params = new URLSearchParams(window.location.search);

const selectedSubject = params.get("subject");
const requestedMinutes = Number(params.get("minutes"));

const focusMinutes =
    Number.isInteger(requestedMinutes) &&
    requestedMinutes >= 1 &&
    requestedMinutes <= 180
        ? requestedMinutes
        : 25;

const breakMinutes = 5;

if (selectedSubject) {
    subjectInput.value = selectedSubject.slice(0, 70);
}

// Timer state
let currentMode = "focus";
let remainingSeconds = focusMinutes * 60;
let running = false;
let intervalId = null;
let endTime = null;
let activeSubject = "General Study";

function getTotalSeconds() {
    return currentMode === "focus"
        ? focusMinutes * 60
        : breakMinutes * 60;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0");
}

function updateDisplay() {
    display.textContent = formatTime(remainingSeconds);

    const totalSeconds = getTotalSeconds();

    const percentage =
        ((totalSeconds - remainingSeconds) /
            totalSeconds) * 100;

    timerRing.style.setProperty(
        "--progress",
        percentage + "%"
    );

    startBtn.disabled = running;
    pauseBtn.disabled = !running;

    document.title =
        formatTime(remainingSeconds) + " | StudyRoom AI";
}

function stopInterval() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }

    running = false;
    endTime = null;
}

function setMode(mode, message) {
    stopInterval();

    currentMode = mode;
    remainingSeconds = getTotalSeconds();

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

    statusText.textContent = message ||
        (mode === "focus"
            ? "Ready for your focus session."
            : "Ready for your break.");

    updateDisplay();
}

// Start timer
function startTimer() {
    if (running) return;

    if (currentMode === "focus") {
        activeSubject =
            subjectInput.value.trim() || "General Study";
    }

    running = true;

    // Date.now prevents interval drift
    endTime = Date.now() + remainingSeconds * 1000;

    statusText.textContent =
        currentMode === "focus"
            ? "Your focus session is running."
            : "Enjoy your break.";

    intervalId = setInterval(updateTimer, 250);

    updateTimer();
}

function updateTimer() {
    if (!running) return;

    remainingSeconds = Math.max(
        0,
        Math.ceil((endTime - Date.now()) / 1000)
    );

    if (remainingSeconds === 0) {
        finishTimer();
        return;
    }

    updateDisplay();
}

// Pause timer
function pauseTimer() {
    if (!running) return;

    remainingSeconds = Math.max(
        0,
        Math.ceil((endTime - Date.now()) / 1000)
    );

    stopInterval();

    statusText.textContent = "Timer paused.";
    updateDisplay();
}

// Reset timer
function resetTimer() {
    stopInterval();

    remainingSeconds = getTotalSeconds();

    statusText.textContent = "Timer reset.";
    updateDisplay();
}

// Store completed sessions only
function saveSession() {
    const history = getHistory();

    const session = {
        subject: activeSubject,
        minutes: focusMinutes,
        completedAt: new Date().toISOString()
    };

    history.unshift(session);

    try {
        localStorage.setItem(
            storageKey,
            JSON.stringify(history)
        );
    } catch (error) {
        statusText.textContent =
            "Session finished, but history couldn't be saved.";
    }

    renderHistory();
}

function getHistory() {
    try {
        const data = JSON.parse(
            localStorage.getItem(storageKey) || "[]"
        );

        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

// Session completed
function finishTimer() {
    const completedMode = currentMode;

    stopInterval();

    if (completedMode === "focus") {
        saveSession();

        setMode(
            "break",
            "Focus complete! You can now take a 5-minute break."
        );
    } else {
        setMode(
            "focus",
            "Break complete! Start another session whenever you're ready."
        );
    }
}

// Render statistics and history
function renderHistory() {
    const history = getHistory();

    const today = new Date().toDateString();

    const todaySessions = history.filter(item =>
        new Date(item.completedAt).toDateString() === today
    );

    const totalMinutes = todaySessions.reduce(
        (sum, item) => sum + Number(item.minutes || 0),
        0
    );

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    document.getElementById("todayStudyTime").textContent =
        hours > 0
            ? `${hours}h ${minutes}m`
            : `${minutes} min`;

    document.getElementById("todaySessions").textContent =
        todaySessions.length;

    const historyList = document.getElementById("historyList");

    historyList.replaceChildren();

    if (history.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-history";
        empty.textContent = "No completed sessions yet.";
        historyList.appendChild(empty);
        return;
    }

    history.slice(0, 5).forEach(item => {
        const row = document.createElement("div");
        row.className = "history-item";

        const info = document.createElement("div");

        const title = document.createElement("strong");
        title.textContent = item.subject;

        const date = document.createElement("p");
        date.textContent = new Date(
            item.completedAt
        ).toLocaleString("en-IN");

        const duration = document.createElement("span");
        duration.textContent = `${item.minutes} min`;

        info.append(title, date);
        row.append(info, duration);

        historyList.appendChild(row);
    });
}

// Events
startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

focusModeBtn.addEventListener("click", () => {
    setMode("focus");
});

breakModeBtn.addEventListener("click", () => {
    setMode("break");
});

// Refresh display when browser tab becomes active
document.addEventListener("visibilitychange", () => {
    if (running) updateTimer();
});

// Initial render
focusModeBtn.textContent = `Focus (${focusMinutes}m)`;

setMode("focus");
renderHistory();
