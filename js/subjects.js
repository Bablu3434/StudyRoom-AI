// =======================================
// StudyRoom AI - Subject Management
// =======================================


// Login Check

const loggedIn =
    localStorage.getItem("studyRoomLoggedIn") === "true";

const user =
    JSON.parse(
        localStorage.getItem("studyRoomUser") || "null"
    );


if (!loggedIn || !user) {

    window.location.replace("login.html");

}


// User based storage

const storageKey =
    "studySubjects_" +
    user.email.toLowerCase();


// Elements

const subjectContainer =
    document.getElementById("subjectContainer");

const searchSubject =
    document.getElementById("searchSubject");


const subjectModal =
    document.getElementById("subjectModal");

const topicModal =
    document.getElementById("topicModal");


const addSubjectBtn =
    document.getElementById("addSubjectBtn");

const closeSubjectModal =
    document.getElementById("closeSubjectModal");

const cancelSubjectBtn =
    document.getElementById("cancelSubjectBtn");


const closeTopicModal =
    document.getElementById("closeTopicModal");

const cancelTopicBtn =
    document.getElementById("cancelTopicBtn");


// Subject Form

const subjectForm =
    document.getElementById("subjectForm");

const editingSubjectId =
    document.getElementById("editingSubjectId");

const subjectName =
    document.getElementById("subjectName");

const subjectCode =
    document.getElementById("subjectCode");

const targetHours =
    document.getElementById("targetHours");


// Topic Form

const topicForm =
    document.getElementById("topicForm");

const topicSubjectId =
    document.getElementById("topicSubjectId");

const editingTopicId =
    document.getElementById("editingTopicId");

const topicName =
    document.getElementById("topicName");


// ---------------------------------------
// Storage
// ---------------------------------------

function getSubjects() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(storageKey)
                || "[]"
            );

        return Array.isArray(data)
            ? data
            : [];

    } catch {

        return [];

    }

}


function saveSubjects(subjects) {

    localStorage.setItem(
        storageKey,
        JSON.stringify(subjects)
    );

}


// ---------------------------------------
// Open Subject Modal
// ---------------------------------------

addSubjectBtn.addEventListener(
    "click",
    () => {

        resetSubjectForm();

        subjectModal.classList.add("show");

    }
);


// Close

function closeSubjectBox() {

    subjectModal.classList.remove("show");

}


closeSubjectModal.addEventListener(
    "click",
    closeSubjectBox
);

cancelSubjectBtn.addEventListener(
    "click",
    closeSubjectBox
);


// ---------------------------------------
// Subject Form
// ---------------------------------------

subjectForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const name =
            subjectName.value.trim();

        const code =
            subjectCode.value.trim();

        const hours =
            Number(targetHours.value);


        if (!name || hours < 1) {

            alert(
                "Please enter valid subject details."
            );

            return;

        }


        const subjects =
            getSubjects();


        const editId =
            editingSubjectId.value;


        if (editId) {

            const index =
                subjects.findIndex(
                    subject =>
                        String(subject.id)
                        === editId
                );


            if (index !== -1) {

                subjects[index] = {

                    ...subjects[index],

                    name,

                    code,

                    targetHours: hours

                };

            }

        } else {

            const newSubject = {

                id:
                    Date.now(),

                name,

                code,

                targetHours:
                    hours,

                topics: [],

                createdAt:
                    new Date()
                        .toISOString()

            };


            subjects.unshift(
                newSubject
            );

        }


        saveSubjects(subjects);

        closeSubjectBox();

        resetSubjectForm();

        renderSubjects();

    }
);


// Reset

function resetSubjectForm() {

    subjectForm.reset();

    editingSubjectId.value = "";

    targetHours.value = 20;

    document.getElementById(
        "subjectModalTitle"
    ).textContent =
        "Add Subject";

}


// Edit Subject

function editSubject(id) {

    const subjects =
        getSubjects();


    const subject =
        subjects.find(
            item =>
                item.id === id
        );


    if (!subject)
        return;


    editingSubjectId.value =
        subject.id;

    subjectName.value =
        subject.name;

    subjectCode.value =
        subject.code || "";

    targetHours.value =
        subject.targetHours || 20;


    document.getElementById(
        "subjectModalTitle"
    ).textContent =
        "Edit Subject";


    subjectModal.classList.add(
        "show"
    );

}


// Delete Subject

function deleteSubject(id) {

    const confirmation =
        confirm(
            "Delete this subject and all its topics?"
        );


    if (!confirmation)
        return;


    const subjects =
        getSubjects()
            .filter(
                subject =>
                    subject.id !== id
            );


    saveSubjects(subjects);

    renderSubjects();

}


// ---------------------------------------
// Topic Modal
// ---------------------------------------

function openTopicModal(subjectId) {

    const subjects =
        getSubjects();


    const subject =
        subjects.find(
            item =>
                item.id === subjectId
        );


    if (!subject)
        return;


    topicForm.reset();

    topicSubjectId.value =
        subjectId;

    editingTopicId.value =
        "";


    document.getElementById(
        "topicModalTitle"
    ).textContent =
        "Add Topic";


    document.getElementById(
        "topicSubjectName"
    ).textContent =
        `Add topic to ${subject.name}`;


    topicModal.classList.add(
        "show"
    );

}


function closeTopicBox() {

    topicModal.classList.remove(
        "show"
    );

}


closeTopicModal.addEventListener(
    "click",
    closeTopicBox
);


cancelTopicBtn.addEventListener(
    "click",
    closeTopicBox
);


// Topic Submit

topicForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const subjectId =
            Number(
                topicSubjectId.value
            );


        const name =
            topicName.value.trim();


        if (!name)
            return;


        const subjects =
            getSubjects();


        const subject =
            subjects.find(
                item =>
                    item.id === subjectId
            );


        if (!subject)
            return;


        const editTopicId =
            editingTopicId.value;


        if (editTopicId) {

            const topic =
                subject.topics.find(
                    item =>
                        String(item.id)
                        === editTopicId
                );


            if (topic) {

                topic.name =
                    name;

            }

        } else {

            subject.topics.push({

                id:
                    Date.now(),

                name,

                completed:
                    false

            });

        }


        saveSubjects(subjects);

        closeTopicBox();

        renderSubjects();

    }
);


// Edit Topic

function editTopic(
    subjectId,
    topicId
) {

    const subjects =
        getSubjects();


    const subject =
        subjects.find(
            item =>
                item.id === subjectId
        );


    if (!subject)
        return;


    const topic =
        subject.topics.find(
            item =>
                item.id === topicId
        );


    if (!topic)
        return;


    topicSubjectId.value =
        subjectId;

    editingTopicId.value =
        topicId;

    topicName.value =
        topic.name;


    document.getElementById(
        "topicModalTitle"
    ).textContent =
        "Edit Topic";


    document.getElementById(
        "topicSubjectName"
    ).textContent =
        subject.name;


    topicModal.classList.add(
        "show"
    );

}


// Delete Topic

function deleteTopic(
    subjectId,
    topicId
) {

    const subjects =
        getSubjects();


    const subject =
        subjects.find(
            item =>
                item.id === subjectId
        );


    if (!subject)
        return;


    subject.topics =
        subject.topics.filter(
            topic =>
                topic.id !== topicId
        );


    saveSubjects(subjects);

    renderSubjects();

}


// Complete Topic

function toggleTopic(
    subjectId,
    topicId
) {

    const subjects =
        getSubjects();


    const subject =
        subjects.find(
            item =>
                item.id === subjectId
        );


    if (!subject)
        return;


    const topic =
        subject.topics.find(
            item =>
                item.id === topicId
        );


    if (!topic)
        return;


    topic.completed =
        !topic.completed;


    saveSubjects(subjects);

    renderSubjects();

}


// ---------------------------------------
// Progress
// ---------------------------------------

function getSubjectProgress(
    subject
) {

    const total =
        subject.topics.length;


    if (total === 0)
        return 0;


    const completed =
        subject.topics
            .filter(
                topic =>
                    topic.completed
            )
            .length;


    return Math.round(
        completed / total * 100
    );

}


// ---------------------------------------
// Render Subjects
// ---------------------------------------

function renderSubjects() {

    const subjects =
        getSubjects();


    const search =
        searchSubject.value
            .trim()
            .toLowerCase();


    const filtered =
        subjects.filter(
            subject =>
                subject.name
                    .toLowerCase()
                    .includes(search)
        );


    subjectContainer.innerHTML =
        "";


    if (
        filtered.length === 0
    ) {

        subjectContainer.innerHTML = `

            <div class="empty-subjects">

                <h3>
                    No subjects found
                </h3>

                <p>
                    Add your first subject
                    to start tracking progress.
                </p>

            </div>

        `;

    }


    filtered.forEach(
        subject => {


            const completedTopics =
                subject.topics.filter(
                    topic =>
                        topic.completed
                ).length;


            const progress =
                getSubjectProgress(
                    subject
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "subject-card";


            const firstLetter =
                subject.name
                    .charAt(0)
                    .toUpperCase();


            card.innerHTML = `

                <div class="subject-top">

                    <div class="subject-info">

                        <div class="subject-icon">
                            ${escapeHTML(firstLetter)}
                        </div>

                        <div>

                            <h2>
                                ${escapeHTML(subject.name)}
                            </h2>

                            <p>
                                ${
                                    escapeHTML(
                                        subject.code
                                        || "No subject code"
                                    )
                                }
                            </p>

                        </div>

                    </div>


                    <div class="subject-actions">

                        <button
                            class="edit-subject"
                        >
                            Edit
                        </button>

                        <button
                            class="delete-subject"
                        >
                            Delete
                        </button>

                    </div>

                </div>


                <div class="progress-section">

                    <div class="progress-info">

                        <span>
                            Progress
                        </span>

                        <strong>
                            ${progress}%
                        </strong>

                    </div>

                    <div class="progress-bar">

                        <div
                            class="progress-fill"
                            style="
                                width:
                                ${progress}%
                            "
                        >
                        </div>

                    </div>

                </div>


                <div class="subject-stats">

                    <div class="mini-stat">

                        <strong>
                            ${subject.topics.length}
                        </strong>

                        <span>
                            Topics
                        </span>

                    </div>


                    <div class="mini-stat">

                        <strong>
                            ${completedTopics}
                        </strong>

                        <span>
                            Completed
                        </span>

                    </div>


                    <div class="mini-stat">

                        <strong>
                            ${subject.targetHours}h
                        </strong>

                        <span>
                            Target
                        </span>

                    </div>

                </div>


                <div class="topic-header">

                    <h3>
                        Topics
                    </h3>

                    <button
                        class="add-topic-btn"
                    >
                        + Add Topic
                    </button>

                </div>


                <div class="topic-list">
                </div>


                <div class="subject-bottom">

                    <a
                        class="focus-link"
                        href="
                            timer.html?subject=
                            ${encodeURIComponent(subject.name)}
                        "
                    >
                        Start Focus
                    </a>

                    <a
                        class="planner-link"
                        href="planner.html"
                    >
                        Study Planner
                    </a>

                </div>

            `;


            // Topic List

            const topicList =
                card.querySelector(
                    ".topic-list"
                );


            if (
                subject.topics.length === 0
            ) {

                topicList.innerHTML = `

                    <div class="empty-topics">

                        No topics added yet.

                    </div>

                `;

            }


            subject.topics.forEach(
                topic => {


                    const topicItem =
                        document.createElement(
                            "div"
                        );


                    topicItem.className =
                        "topic-item" +
                        (
                            topic.completed
                                ? " completed"
                                : ""
                        );


                    topicItem.innerHTML = `

                        <input
                            type="checkbox"
                            ${topic.completed
                                ? "checked"
                                : ""}
                        >

                        <span class="topic-name">
                            ${escapeHTML(topic.name)}
                        </span>


                        <div class="topic-buttons">

                            <button
                                class="topic-edit"
                            >
                                Edit
                            </button>

                            <button
                                class="topic-delete"
                            >
                                Delete
                            </button>

                        </div>

                    `;


                    topicItem
                        .querySelector(
                            "input"
                        )
                        .addEventListener(
                            "change",
                            () => {

                                toggleTopic(
                                    subject.id,
                                    topic.id
                                );

                            }
                        );


                    topicItem
                        .querySelector(
                            ".topic-edit"
                        )
                        .addEventListener(
                            "click",
                            () => {

                                editTopic(
                                    subject.id,
                                    topic.id
                                );

                            }
                        );


                    topicItem
                        .querySelector(
                            ".topic-delete"
                        )
                        .addEventListener(
                            "click",
                            () => {

                                deleteTopic(
                                    subject.id,
                                    topic.id
                                );

                            }
                        );


                    topicList.appendChild(
                        topicItem
                    );

                }
            );


            // Subject Actions

            card
                .querySelector(
                    ".edit-subject"
                )
                .addEventListener(
                    "click",
                    () => {

                        editSubject(
                            subject.id
                        );

                    }
                );


            card
                .querySelector(
                    ".delete-subject"
                )
                .addEventListener(
                    "click",
                    () => {

                        deleteSubject(
                            subject.id
                        );

                    }
                );


            card
                .querySelector(
                    ".add-topic-btn"
                )
                .addEventListener(
                    "click",
                    () => {

                        openTopicModal(
                            subject.id
                        );

                    }
                );


            subjectContainer.appendChild(
                card
            );

        }
    );


    updateStats();

}


// ---------------------------------------
// Statistics
// ---------------------------------------

function updateStats() {

    const subjects =
        getSubjects();


    let totalTopics = 0;

    let completedTopics = 0;


    subjects.forEach(
        subject => {

            totalTopics +=
                subject.topics.length;


            completedTopics +=
                subject.topics.filter(
                    topic =>
                        topic.completed
                ).length;

        }
    );


    const overallProgress =
        totalTopics === 0
            ? 0
            : Math.round(
                completedTopics /
                totalTopics *
                100
            );


    document.getElementById(
        "totalSubjects"
    ).textContent =
        subjects.length;


    document.getElementById(
        "totalTopics"
    ).textContent =
        totalTopics;


    document.getElementById(
        "completedTopics"
    ).textContent =
        completedTopics;


    document.getElementById(
        "overallProgress"
    ).textContent =
        overallProgress + "%";

}


// ---------------------------------------
// Escape HTML
// ---------------------------------------

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(text);

    return div.innerHTML;

}


// ---------------------------------------
// Search
// ---------------------------------------

searchSubject.addEventListener(
    "input",
    renderSubjects
);


// Click outside modal

subjectModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            subjectModal
        ) {

            closeSubjectBox();

        }

    }
);


topicModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            topicModal
        ) {

            closeTopicBox();

        }

    }
);


// Initial Load

renderSubjects();