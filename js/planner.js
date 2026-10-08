// Login protection

const loggedIn =
    localStorage.getItem("studyRoomLoggedIn") === "true";

const user =
    JSON.parse(
        localStorage.getItem("studyRoomUser") || "null"
    );

if (!loggedIn || !user) {
    window.location.replace("login.html");
}


// Separate tasks for each user

const taskStorageKey =
    "studyPlannerTasks_" +
    user.email.toLowerCase();


// Elements

const taskModal =
    document.getElementById("taskModal");

const openTaskModal =
    document.getElementById("openTaskModal");

const closeModal =
    document.getElementById("closeModal");

const cancelBtn =
    document.getElementById("cancelBtn");

const taskForm =
    document.getElementById("taskForm");

const taskList =
    document.getElementById("taskList");

const searchInput =
    document.getElementById("searchInput");

const filterStatus =
    document.getElementById("filterStatus");


// Fields

const editingTaskId =
    document.getElementById("editingTaskId");

const subjectInput =
    document.getElementById("subject");

const topicInput =
    document.getElementById("topic");

const durationInput =
    document.getElementById("duration");

const studyDateInput =
    document.getElementById("studyDate");

const priorityInput =
    document.getElementById("priority");


// Set default date

studyDateInput.value =
    new Date().toISOString().split("T")[0];


// Get Tasks

function getTasks() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(taskStorageKey) || "[]"
            );

        return Array.isArray(data)
            ? data
            : [];

    } catch {

        return [];

    }

}


// Save Tasks

function saveTasks(tasks) {

    localStorage.setItem(
        taskStorageKey,
        JSON.stringify(tasks)
    );

}


// Open Modal

openTaskModal.addEventListener(
    "click",
    function () {

        resetForm();

        taskModal.classList.add("show");

    }
);


// Close

function hideModal() {

    taskModal.classList.remove("show");

}

closeModal.addEventListener(
    "click",
    hideModal
);

cancelBtn.addEventListener(
    "click",
    hideModal
);


// Click outside modal

taskModal.addEventListener(
    "click",
    function (event) {

        if (event.target === taskModal) {

            hideModal();

        }

    }
);


// Reset Form

function resetForm() {

    taskForm.reset();

    editingTaskId.value = "";

    studyDateInput.value =
        new Date().toISOString()
            .split("T")[0];

    priorityInput.value =
        "medium";

    document.getElementById(
        "modalTitle"
    ).textContent =
        "Add Study Task";

}


// Submit

taskForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const subject =
            subjectInput.value.trim();

        const topic =
            topicInput.value.trim();

        const duration =
            Number(durationInput.value);

        const studyDate =
            studyDateInput.value;

        const priority =
            priorityInput.value;


        if (
            !subject ||
            !topic ||
            !studyDate ||
            duration < 1
        ) {

            alert(
                "Please enter valid task details."
            );

            return;

        }


        const tasks =
            getTasks();


        const editId =
            editingTaskId.value;


        if (editId) {

            const index =
                tasks.findIndex(
                    task =>
                        String(task.id) === editId
                );


            if (index !== -1) {

                tasks[index] = {
                    ...tasks[index],

                    subject,
                    topic,
                    duration,
                    studyDate,
                    priority
                };

            }

        } else {

            const newTask = {

                id:
                    Date.now(),

                subject,

                topic,

                duration,

                studyDate,

                priority,

                completed:
                    false,

                createdAt:
                    new Date()
                        .toISOString()

            };


            tasks.unshift(
                newTask
            );

        }


        saveTasks(tasks);

        hideModal();

        resetForm();

        renderTasks();

    }
);


// Edit Task

function editTask(id) {

    const tasks =
        getTasks();

    const task =
        tasks.find(
            item =>
                item.id === id
        );


    if (!task) return;


    editingTaskId.value =
        task.id;

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


// Delete Task

function deleteTask(id) {

    const confirmDelete =
        confirm(
            "Delete this study task?"
        );


    if (!confirmDelete)
        return;


    const tasks =
        getTasks()
            .filter(
                task =>
                    task.id !== id
            );


    saveTasks(tasks);

    renderTasks();

}


// Complete Task

function toggleComplete(id) {

    const tasks =
        getTasks();


    const task =
        tasks.find(
            item =>
                item.id === id
        );


    if (!task) return;


    task.completed =
        !task.completed;


    saveTasks(tasks);

    renderTasks();

}


// Format Date

function formatDate(date) {

    return new Date(
        date + "T00:00:00"
    ).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


// Render Tasks

function renderTasks() {

    const tasks =
        getTasks();


    const query =
        searchInput.value
            .toLowerCase()
            .trim();


    const status =
        filterStatus.value;


    const filteredTasks =
        tasks.filter(task => {


            const matchesSearch =

                task.subject
                    .toLowerCase()
                    .includes(query)

                ||

                task.topic
                    .toLowerCase()
                    .includes(query);


            const matchesStatus =

                status === "all"

                ||

                (
                    status === "completed"
                    &&
                    task.completed
                )

                ||

                (
                    status === "pending"
                    &&
                    !task.completed
                );


            return (
                matchesSearch &&
                matchesStatus
            );

        });


    taskList.innerHTML =
        "";


    if (
        filteredTasks.length === 0
    ) {

        taskList.innerHTML = `
            <div class="empty">
                No study tasks found.
                Click "Add Study Task"
                to create one.
            </div>
        `;

    }


    filteredTasks.forEach(
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


            item.innerHTML = `

                <input
                    type="checkbox"
                    class="task-check"
                    ${task.completed
                        ? "checked"
                        : ""}
                >


                <div class="task-content">

                    <h3>
                        ${escapeHTML(task.subject)}
                    </h3>

                    <p>
                        ${escapeHTML(task.topic)}
                    </p>

                </div>


                <div class="task-meta">

                    <strong>
                        ${task.duration} min
                    </strong>

                    <span>
                        ${formatDate(task.studyDate)}
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
                    href="
                        timer.html?subject=
                        ${encodeURIComponent(task.subject)}
                        &minutes=
                        ${task.duration}
                    "
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
                    function () {

                        toggleComplete(
                            task.id
                        );

                    }
                );


            item
                .querySelector(
                    ".edit-btn"
                )
                .addEventListener(
                    "click",
                    function () {

                        editTask(
                            task.id
                        );

                    }
                );


            item
                .querySelector(
                    ".delete-btn"
                )
                .addEventListener(
                    "click",
                    function () {

                        deleteTask(
                            task.id
                        );

                    }
                );


            taskList.appendChild(
                item
            );

        }
    );


    updateStats();

}


// Escape HTML

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;

}


// Stats

function updateStats() {

    const tasks =
        getTasks();


    const completed =
        tasks.filter(
            task =>
                task.completed
        );


    const pending =
        tasks.filter(
            task =>
                !task.completed
        );


    const totalMinutes =
        tasks.reduce(
            (sum, task) =>
                sum +
                Number(task.duration),
            0
        );


    document.getElementById(
        "totalTasks"
    ).textContent =
        tasks.length;


    document.getElementById(
        "completedTasks"
    ).textContent =
        completed.length;


    document.getElementById(
        "pendingTasks"
    ).textContent =
        pending.length;


    if (totalMinutes >= 60) {

        const hours =
            Math.floor(
                totalMinutes / 60
            );

        const minutes =
            totalMinutes % 60;


        document.getElementById(
            "totalTime"
        ).textContent =
            `${hours}h ${minutes}m`;

    } else {

        document.getElementById(
            "totalTime"
        ).textContent =
            `${totalMinutes}m`;

    }

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


// Initial Load

renderTasks();