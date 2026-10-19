const API_URL =
    "http://localhost:5000/api/tasks";


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

const taskModal =
    document.getElementById(
        "taskModal"
    );


const openTaskModal =
    document.getElementById(
        "openTaskModal"
    );


const closeModal =
    document.getElementById(
        "closeModal"
    );


const cancelBtn =
    document.getElementById(
        "cancelBtn"
    );


const taskForm =
    document.getElementById(
        "taskForm"
    );


const taskList =
    document.getElementById(
        "taskList"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


const filterStatus =
    document.getElementById(
        "filterStatus"
    );


const editingTaskId =
    document.getElementById(
        "editingTaskId"
    );


const subjectInput =
    document.getElementById(
        "subject"
    );


const topicInput =
    document.getElementById(
        "topic"
    );


const durationInput =
    document.getElementById(
        "duration"
    );


const studyDateInput =
    document.getElementById(
        "studyDate"
    );


const studyTimeInput =
    document.getElementById(
        "studyTime"
    );


const priorityInput =
    document.getElementById(
        "priority"
    );


let tasks = [];


let reminderInterval =
    null;


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
            `Server returned ${response.status}: ${text.slice(0, 100)}`
        );

    }


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Request failed"
        );

    }


    return data;

}


// =====================================
// LOAD TASKS
// =====================================

async function loadTasks() {

    try {

        const data =
            await apiFetch(
                API_URL
            );


        tasks =
            Array.isArray(
                data.tasks
            )
                ? data.tasks
                : [];


        renderTasks();


        checkTaskReminders();

    } catch (error) {

        console.error(
            "Load Tasks Error:",
            error
        );


        alert(
            error.message
        );

    }

}


// =====================================
// MODAL
// =====================================

if (openTaskModal) {

    openTaskModal.addEventListener(
        "click",
        function () {

            resetForm();


            taskModal.classList.add(
                "show"
            );

        }
    );

}


function hideModal() {

    taskModal.classList.remove(
        "show"
    );

}


if (closeModal) {

    closeModal.addEventListener(
        "click",
        hideModal
    );

}


if (cancelBtn) {

    cancelBtn.addEventListener(
        "click",
        hideModal
    );

}


if (taskModal) {

    taskModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                taskModal
            ) {

                hideModal();

            }

        }
    );

}


// =====================================
// LOCAL DATE
// =====================================

function getTodayDate() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


// =====================================
// DEFAULT TIME
// =====================================

function getDefaultStudyTime() {

    const now =
        new Date();


    now.setMinutes(
        now.getMinutes() + 30
    );


    const hours =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );


    const minutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    return `${hours}:${minutes}`;

}


// =====================================
// RESET FORM
// =====================================

function resetForm() {

    taskForm.reset();


    editingTaskId.value =
        "";


    studyDateInput.value =
        getTodayDate();


    studyTimeInput.value =
        getDefaultStudyTime();


    priorityInput.value =
        "medium";


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Add Study Task";

}


// =====================================
// ADD / UPDATE TASK
// =====================================

taskForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const body = {

            subject:
                subjectInput
                    .value
                    .trim(),

            topic:
                topicInput
                    .value
                    .trim(),

            duration:
                Number(
                    durationInput.value
                ),

            studyDate:
                studyDateInput.value,

            studyTime:
                studyTimeInput.value,

            priority:
                priorityInput.value

        };


        if (
            !body.studyTime
        ) {

            alert(
                "Please select study time."
            );

            return;

        }


        try {

            const id =
                editingTaskId.value;


            if (id) {

                await apiFetch(
                    `${API_URL}/${id}`,
                    {

                        method:
                            "PUT",

                        body:
                            JSON.stringify(
                                body
                            )

                    }
                );

            } else {

                await apiFetch(
                    API_URL,
                    {

                        method:
                            "POST",

                        body:
                            JSON.stringify(
                                body
                            )

                    }
                );

            }


            hideModal();


            resetForm();


            await loadTasks();

        } catch (error) {

            console.error(
                "Save Task Error:",
                error
            );


            alert(
                error.message
            );

        }

    }
);


// =====================================
// EDIT TASK
// =====================================

function editTask(id) {

    const task =
        tasks.find(
            item =>
                item._id === id
        );


    if (!task) {

        return;

    }


    editingTaskId.value =
        task._id;


    subjectInput.value =
        task.subject || "";


    topicInput.value =
        task.topic || "";


    durationInput.value =
        task.duration || 25;


    studyDateInput.value =
        task.studyDate ||
        getTodayDate();


    studyTimeInput.value =
        task.studyTime ||
        getDefaultStudyTime();


    priorityInput.value =
        task.priority ||
        "medium";


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Study Task";


    taskModal.classList.add(
        "show"
    );

}


// =====================================
// TOGGLE TASK
// =====================================

async function toggleComplete(id) {

    try {

        await apiFetch(
            `${API_URL}/${id}/toggle`,
            {
                method:
                    "PATCH"
            }
        );


        await loadTasks();

    } catch (error) {

        console.error(
            "Toggle Task Error:",
            error
        );


        alert(
            error.message
        );

    }

}


// =====================================
// DELETE TASK
// =====================================

async function deleteTask(id) {

    const confirmDelete =
        confirm(
            "Delete this study task?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        await apiFetch(
            `${API_URL}/${id}`,
            {
                method:
                    "DELETE"
            }
        );


        clearTaskReminderMemory(
            id
        );


        await loadTasks();

    } catch (error) {

        console.error(
            "Delete Task Error:",
            error
        );


        alert(
            error.message
        );

    }

}


// =====================================
// FORMAT DATE
// =====================================

function formatDate(date) {

    if (!date) {

        return "No date";

    }


    return new Date(
        date + "T00:00:00"
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

}


// =====================================
// FORMAT TIME
// =====================================

function formatTime(time) {

    if (!time) {

        return "No time";

    }


    const [
        hours,
        minutes
    ] =
        time
            .split(":")
            .map(Number);


    const date =
        new Date();


    date.setHours(
        hours,
        minutes,
        0,
        0
    );


    return date
        .toLocaleTimeString(
            "en-IN",
            {

                hour:
                    "numeric",

                minute:
                    "2-digit",

                hour12:
                    true

            }
        );

}


// =====================================
// RENDER TASKS
// =====================================

function renderTasks() {

    const query =
        searchInput.value
            .toLowerCase()
            .trim();


    const status =
        filterStatus.value;


    const filtered =
        tasks.filter(
            task => {

                const subject =
                    String(
                        task.subject || ""
                    )
                        .toLowerCase();


                const topic =
                    String(
                        task.topic || ""
                    )
                        .toLowerCase();


                const searchMatch =
                    subject.includes(
                        query
                    )
                    ||
                    topic.includes(
                        query
                    );


                const statusMatch =

                    status === "all"

                    ||

                    (
                        status ===
                        "completed"
                        &&
                        task.completed
                    )

                    ||

                    (
                        status ===
                        "pending"
                        &&
                        !task.completed
                    );


                return (
                    searchMatch &&
                    statusMatch
                );

            }
        );


    taskList.innerHTML =
        "";


    if (
        filtered.length === 0
    ) {

        taskList.innerHTML = `

            <div class="empty">
                No study tasks found.
            </div>

        `;


        updateStats();


        return;

    }


    filtered.forEach(
        task => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "task-item" +
                (
                    task.completed
                        ? " completed-task"
                        : ""
                );


            const timerLink =

                "timer.html?subject="

                +

                encodeURIComponent(
                    task.subject
                )

                +

                "&topic="

                +

                encodeURIComponent(
                    task.topic
                )

                +

                "&minutes="

                +

                encodeURIComponent(
                    task.duration
                );


            item.innerHTML = `

                <input
                    type="checkbox"
                    class="task-check"
                    ${
                        task.completed
                            ? "checked"
                            : ""
                    }
                >


                <div class="task-content">

                    <h3>
                        ${escapeHTML(
                            task.subject
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            task.topic
                        )}
                    </p>

                </div>


                <div class="task-meta">

                    <strong>
                        ${Number(
                            task.duration
                        )} min
                    </strong>

                    <span>
                        ${formatDate(
                            task.studyDate
                        )}
                    </span>

                    <span>
                        ${formatTime(
                            task.studyTime
                        )}
                    </span>

                </div>


                <span
                    class="
                        priority
                        priority-${escapeHTML(
                            task.priority
                        )}
                    "
                >
                    ${escapeHTML(
                        task.priority
                    )}
                </span>


                <a
                    class="start-btn"
                    href="${timerLink}"
                >
                    Start
                </a>


                <div class="task-actions">

                    <button
                        type="button"
                        class="edit-btn"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-btn"
                    >
                        Delete
                    </button>

                </div>

            `;


            item
                .querySelector(
                    ".task-check"
                )
                .addEventListener(
                    "change",
                    () =>
                        toggleComplete(
                            task._id
                        )
                );


            item
                .querySelector(
                    ".edit-btn"
                )
                .addEventListener(
                    "click",
                    () =>
                        editTask(
                            task._id
                        )
                );


            item
                .querySelector(
                    ".delete-btn"
                )
                .addEventListener(
                    "click",
                    () =>
                        deleteTask(
                            task._id
                        )
                );


            taskList.appendChild(
                item
            );

        }
    );


    updateStats();

}


// =====================================
// STATISTICS
// =====================================

function updateStats() {

    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    const pending =
        tasks.length -
        completed;


    const totalMinutes =
        tasks.reduce(
            (sum, task) =>

                sum +
                Number(
                    task.duration || 0
                ),

            0
        );


    const totalTasksElement =
        document.getElementById(
            "totalTasks"
        );


    const completedTasksElement =
        document.getElementById(
            "completedTasks"
        );


    const pendingTasksElement =
        document.getElementById(
            "pendingTasks"
        );


    const totalTimeElement =
        document.getElementById(
            "totalTime"
        );


    if (totalTasksElement) {

        totalTasksElement.textContent =
            tasks.length;

    }


    if (completedTasksElement) {

        completedTasksElement.textContent =
            completed;

    }


    if (pendingTasksElement) {

        pendingTasksElement.textContent =
            pending;

    }


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    if (totalTimeElement) {

        totalTimeElement.textContent =

            hours > 0

                ? `${hours}h ${minutes}m`

                : `${minutes}m`;

    }

}


// =====================================
// GET SETTINGS
// =====================================

function getStudyRoomSettings() {

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
            "Settings Parse Error:",
            error
        );


        return {};

    }

}


// =====================================
// TASK DATE + TIME
// =====================================

function getTaskDateTime(task) {

    if (
        !task.studyDate ||
        !task.studyTime
    ) {

        return null;

    }


    const taskDate =
        new Date(
            `${task.studyDate}T${task.studyTime}:00`
        );


    if (
        Number.isNaN(
            taskDate.getTime()
        )
    ) {

        return null;

    }


    return taskDate;

}


// =====================================
// REMINDER KEY
// =====================================

function getReminderKey(
    task,
    type
) {

    return (
        "studyRoomReminder_" +
        task._id +
        "_" +
        task.studyDate +
        "_" +
        task.studyTime +
        "_" +
        type
    );

}


// =====================================
// REMINDER ALREADY SENT?
// =====================================

function reminderWasSent(
    task,
    type
) {

    const key =
        getReminderKey(
            task,
            type
        );


    return (
        localStorage.getItem(
            key
        ) === "true"
    );

}


// =====================================
// MARK REMINDER SENT
// =====================================

function markReminderSent(
    task,
    type
) {

    const key =
        getReminderKey(
            task,
            type
        );


    localStorage.setItem(
        key,
        "true"
    );

}


// =====================================
// CLEAR OLD TASK REMINDER MEMORY
// =====================================

function clearTaskReminderMemory(
    taskId
) {

    const prefix =
        `studyRoomReminder_${taskId}_`;


    const keysToRemove =
        [];


    for (
        let index = 0;
        index < localStorage.length;
        index++
    ) {

        const key =
            localStorage.key(
                index
            );


        if (
            key &&
            key.startsWith(
                prefix
            )
        ) {

            keysToRemove.push(
                key
            );

        }

    }


    keysToRemove.forEach(
        key => {

            localStorage.removeItem(
                key
            );

        }
    );

}


// =====================================
// SHOW TASK REMINDER
// =====================================

function sendTaskReminder(
    task,
    type
) {

    if (
        typeof showStudyNotification !==
        "function"
    ) {

        return;

    }


    if (
        type === "before"
    ) {

        showStudyNotification(

            "StudyRoom AI Reminder",

            `${task.subject} - ${task.topic} starts in 10 minutes.`

        );


        return;

    }


    showStudyNotification(

        "Study Session Starting",

        `${task.subject} - ${task.topic} is scheduled to start now.`

    );

}


// =====================================
// CHECK TASK REMINDERS
// =====================================

function checkTaskReminders() {

    const settings =
        getStudyRoomSettings();


    if (
        settings.studyReminders !== true
    ) {

        return;

    }


    if (
        !("Notification" in window)
    ) {

        return;

    }


    if (
        Notification.permission !==
        "granted"
    ) {

        return;

    }


    const now =
        new Date();


    tasks.forEach(
        task => {

            if (
                task.completed
            ) {

                return;

            }


            const taskDate =
                getTaskDateTime(
                    task
                );


            if (!taskDate) {

                return;

            }


            const difference =
                taskDate.getTime() -
                now.getTime();


            const TEN_MINUTES =
                10 * 60 * 1000;


            const NINE_MINUTES =
                9 * 60 * 1000;


            const ONE_MINUTE =
                60 * 1000;


            // =====================================
            // 10 MINUTES BEFORE
            // =====================================

            if (
                difference <= TEN_MINUTES &&
                difference > NINE_MINUTES &&
                !reminderWasSent(
                    task,
                    "before"
                )
            ) {

                sendTaskReminder(
                    task,
                    "before"
                );


                markReminderSent(
                    task,
                    "before"
                );

            }


            // =====================================
            // STARTING NOW
            // =====================================

            if (
                difference <= 0 &&
                difference > -ONE_MINUTE &&
                !reminderWasSent(
                    task,
                    "start"
                )
            ) {

                sendTaskReminder(
                    task,
                    "start"
                );


                markReminderSent(
                    task,
                    "start"
                );

            }

        }
    );

}


// =====================================
// START REMINDER CHECKER
// =====================================

function startReminderChecker() {

    if (
        reminderInterval !== null
    ) {

        clearInterval(
            reminderInterval
        );

    }


    checkTaskReminders();


    reminderInterval =
        setInterval(
            checkTaskReminders,
            30000
        );

}


// =====================================
// SECURITY
// =====================================

function escapeHTML(text) {

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
// SEARCH
// =====================================

searchInput.addEventListener(
    "input",
    renderTasks
);


filterStatus.addEventListener(
    "change",
    renderTasks
);


// =====================================
// PAGE VISIBILITY
// =====================================

document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.visibilityState ===
            "visible"
        ) {

            checkTaskReminders();

        }

    }
);


// =====================================
// INITIAL
// =====================================

resetForm();


loadTasks();


startReminderChecker();