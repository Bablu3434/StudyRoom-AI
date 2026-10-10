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


// Elements

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

const priorityInput =
    document.getElementById(
        "priority"
    );


let tasks = [];


// ====================================
// API Helper
// ====================================

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


// ====================================
// Load Tasks
// ====================================

async function loadTasks() {

    try {

        const data =
            await apiFetch(
                API_URL
            );


        tasks =
            data.tasks;


        renderTasks();

    } catch (error) {

        alert(
            error.message
        );

    }

}


// ====================================
// Modal
// ====================================

openTaskModal.addEventListener(
    "click",
    function () {

        resetForm();

        taskModal.classList.add(
            "show"
        );

    }
);


function hideModal() {

    taskModal.classList.remove(
        "show"
    );

}


closeModal.addEventListener(
    "click",
    hideModal
);


cancelBtn.addEventListener(
    "click",
    hideModal
);


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


// ====================================
// Reset Form
// ====================================

function resetForm() {

    taskForm.reset();

    editingTaskId.value =
        "";


    studyDateInput.value =
        new Date()
            .toISOString()
            .split("T")[0];


    priorityInput.value =
        "medium";


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Add Study Task";

}


// ====================================
// Add / Update Task
// ====================================

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

            priority:
                priorityInput.value

        };


        try {

            const id =
                editingTaskId.value;


            if (id) {

                await apiFetch(
                    `${API_URL}/${id}`,
                    {
                        method: "PUT",

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
                        method: "POST",

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

            alert(
                error.message
            );

        }

    }
);


// ====================================
// Edit Task
// ====================================

function editTask(id) {

    const task =
        tasks.find(
            item =>
                item._id === id
        );


    if (!task)
        return;


    editingTaskId.value =
        task._id;


    subjectInput.value =
        task.subject;


    topicInput.value =
        task.topic;


    durationInput.value =
        task.duration;


    studyDateInput.value =
        task.studyDate;


    priorityInput.value =
        task.priority;


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Study Task";


    taskModal.classList.add(
        "show"
    );

}


// ====================================
// Toggle Task
// ====================================

async function toggleComplete(id) {

    try {

        await apiFetch(
            `${API_URL}/${id}/toggle`,
            {
                method: "PATCH"
            }
        );


        await loadTasks();

    } catch (error) {

        alert(
            error.message
        );

    }

}


// ====================================
// Delete Task
// ====================================

async function deleteTask(id) {

    const confirmDelete =
        confirm(
            "Delete this study task?"
        );


    if (!confirmDelete)
        return;


    try {

        await apiFetch(
            `${API_URL}/${id}`,
            {
                method:
                    "DELETE"
            }
        );


        await loadTasks();

    } catch (error) {

        alert(
            error.message
        );

    }

}


// ====================================
// Date
// ====================================

function formatDate(date) {

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


// ====================================
// Render
// ====================================

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

                const searchMatch =

                    task.subject
                        .toLowerCase()
                        .includes(query)

                    ||

                    task.topic
                        .toLowerCase()
                        .includes(query);


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


    if (filtered.length === 0) {

        taskList.innerHTML = `

            <div class="empty">
                No study tasks found.
            </div>

        `;

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
                "timer.html?subject=" +

                encodeURIComponent(
                    task.subject
                )

                +

                "&minutes=" +

                task.duration;


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
                        ${task.duration}
                        min
                    </strong>

                    <span>
                        ${formatDate(
                            task.studyDate
                        )}
                    </span>

                </div>


                <span
                    class="
                        priority
                        priority-${task.priority}
                    "
                >
                    ${task.priority}
                </span>


                <a
                    class="start-btn"
                    href="${timerLink}"
                >
                    Start
                </a>


                <div class="task-actions">

                    <button
                        class="edit-btn"
                    >
                        Edit
                    </button>

                    <button
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


// ====================================
// Statistics
// ====================================

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
                    task.duration
                ),

            0
        );


    document.getElementById(
        "totalTasks"
    ).textContent =
        tasks.length;


    document.getElementById(
        "completedTasks"
    ).textContent =
        completed;


    document.getElementById(
        "pendingTasks"
    ).textContent =
        pending;


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    document.getElementById(
        "totalTime"
    ).textContent =

        hours > 0

            ? `${hours}h ${minutes}m`

            : `${minutes}m`;

}


// ====================================
// Security
// ====================================

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text);


    return div.innerHTML;

}


// Search

searchInput.addEventListener(
    "input",
    renderTasks
);


filterStatus.addEventListener(
    "change",
    renderTasks
);


// Initial date

resetForm();


// Start

loadTasks();