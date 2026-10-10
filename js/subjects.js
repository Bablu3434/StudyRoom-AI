const API_URL =
    "http://localhost:5000/api/subjects";


const token =
    localStorage.getItem(
        "studyRoomToken"
    );


if (!token) {

    window.location.href =
        "login.html";

}


// Elements

const subjectContainer =
    document.getElementById(
        "subjectContainer"
    );

const searchSubject =
    document.getElementById(
        "searchSubject"
    );

const subjectModal =
    document.getElementById(
        "subjectModal"
    );

const topicModal =
    document.getElementById(
        "topicModal"
    );

const addSubjectBtn =
    document.getElementById(
        "addSubjectBtn"
    );

const closeSubjectModal =
    document.getElementById(
        "closeSubjectModal"
    );

const cancelSubjectBtn =
    document.getElementById(
        "cancelSubjectBtn"
    );

const closeTopicModal =
    document.getElementById(
        "closeTopicModal"
    );

const cancelTopicBtn =
    document.getElementById(
        "cancelTopicBtn"
    );


const subjectForm =
    document.getElementById(
        "subjectForm"
    );

const editingSubjectId =
    document.getElementById(
        "editingSubjectId"
    );

const subjectName =
    document.getElementById(
        "subjectName"
    );

const subjectCode =
    document.getElementById(
        "subjectCode"
    );

const targetHours =
    document.getElementById(
        "targetHours"
    );


const topicForm =
    document.getElementById(
        "topicForm"
    );

const topicSubjectId =
    document.getElementById(
        "topicSubjectId"
    );

const editingTopicId =
    document.getElementById(
        "editingTopicId"
    );

const topicName =
    document.getElementById(
        "topicName"
    );


let subjects = [];


// API Helper

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


// Load Subjects

async function loadSubjects() {

    try {

        const data =
            await apiFetch(
                API_URL
            );


        subjects =
            data.subjects;


        renderSubjects();

    } catch (error) {

        alert(
            error.message
        );

    }

}


// Add Subject

addSubjectBtn.addEventListener(
    "click",
    function () {

        subjectForm.reset();

        editingSubjectId.value =
            "";

        targetHours.value =
            20;

        document.getElementById(
            "subjectModalTitle"
        ).textContent =
            "Add Subject";


        subjectModal.classList.add(
            "show"
        );

    }
);


// Save / Update Subject

subjectForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const body = {

            name:
                subjectName.value.trim(),

            code:
                subjectCode.value.trim(),

            targetHours:
                Number(
                    targetHours.value
                )

        };


        try {

            const id =
                editingSubjectId.value;


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


            subjectModal.classList.remove(
                "show"
            );


            await loadSubjects();

        } catch (error) {

            alert(
                error.message
            );

        }

    }
);


// Edit Subject

function editSubject(id) {

    const subject =
        subjects.find(
            item =>
                item._id === id
        );


    if (!subject)
        return;


    editingSubjectId.value =
        subject._id;

    subjectName.value =
        subject.name;

    subjectCode.value =
        subject.code || "";

    targetHours.value =
        subject.targetHours;


    document.getElementById(
        "subjectModalTitle"
    ).textContent =
        "Edit Subject";


    subjectModal.classList.add(
        "show"
    );

}


// Delete Subject

async function deleteSubject(id) {

    if (
        !confirm(
            "Delete this subject and all topics?"
        )
    ) {

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


        await loadSubjects();

    } catch (error) {

        alert(
            error.message
        );

    }

}


// Open Topic

function openTopicModal(id) {

    const subject =
        subjects.find(
            item =>
                item._id === id
        );


    if (!subject)
        return;


    topicForm.reset();

    topicSubjectId.value =
        id;

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


// Save Topic

topicForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const subjectId =
            topicSubjectId.value;


        const topicId =
            editingTopicId.value;


        try {

            if (topicId) {

                await apiFetch(

                    `${API_URL}/${subjectId}/topics/${topicId}`,

                    {
                        method:
                            "PUT",

                        body:
                            JSON.stringify({
                                name:
                                    topicName.value.trim()
                            })
                    }

                );

            } else {

                await apiFetch(

                    `${API_URL}/${subjectId}/topics`,

                    {
                        method:
                            "POST",

                        body:
                            JSON.stringify({
                                name:
                                    topicName.value.trim()
                            })
                    }

                );

            }


            topicModal.classList.remove(
                "show"
            );


            await loadSubjects();

        } catch (error) {

            alert(
                error.message
            );

        }

    }
);


// Edit Topic

function editTopic(
    subjectId,
    topicId
) {

    const subject =
        subjects.find(
            item =>
                item._id ===
                subjectId
        );


    const topic =
        subject?.topics.find(
            item =>
                item._id ===
                topicId
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


    topicModal.classList.add(
        "show"
    );

}


// Toggle Topic

async function toggleTopic(
    subjectId,
    topicId
) {

    try {

        await apiFetch(

            `${API_URL}/${subjectId}/topics/${topicId}/toggle`,

            {
                method:
                    "PATCH"
            }

        );


        await loadSubjects();

    } catch (error) {

        alert(
            error.message
        );

    }

}


// Delete Topic

async function deleteTopic(
    subjectId,
    topicId
) {

    if (
        !confirm(
            "Delete this topic?"
        )
    ) {

        return;

    }


    try {

        await apiFetch(

            `${API_URL}/${subjectId}/topics/${topicId}`,

            {
                method:
                    "DELETE"
            }

        );


        await loadSubjects();

    } catch (error) {

        alert(
            error.message
        );

    }

}


// Progress

function getProgress(
    subject
) {

    const total =
        subject.topics.length;


    if (total === 0)
        return 0;


    const completed =
        subject.topics.filter(
            topic =>
                topic.completed
        ).length;


    return Math.round(
        completed /
        total *
        100
    );

}


// Render

function renderSubjects() {

    const search =
        searchSubject.value
            .toLowerCase()
            .trim();


    const filtered =
        subjects.filter(
            subject =>

                subject.name
                    .toLowerCase()
                    .includes(search)

                ||

                subject.code
                    ?.toLowerCase()
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
                    Add your first subject.
                </p>

            </div>

        `;

    }


    filtered.forEach(
        subject => {

            const completed =
                subject.topics.filter(
                    topic =>
                        topic.completed
                ).length;


            const progress =
                getProgress(
                    subject
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "subject-card";


            card.innerHTML = `

                <div class="subject-top">

                    <div class="subject-info">

                        <div class="subject-icon">

                            ${escapeHTML(
                                subject.name
                                    .charAt(0)
                                    .toUpperCase()
                            )}

                        </div>


                        <div>

                            <h2>
                                ${escapeHTML(
                                    subject.name
                                )}
                            </h2>

                            <p>
                                ${escapeHTML(
                                    subject.code ||
                                    "No subject code"
                                )}
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
                        ></div>

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
                            ${completed}
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


                <div
                    class="topic-list"
                ></div>


                <div class="subject-bottom">

                    <a
                        class="focus-link"

                        href="
                        timer.html?subject=${
                            encodeURIComponent(
                                subject.name
                            )
                        }
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

                    const row =
                        document.createElement(
                            "div"
                        );


                    row.className =
                        "topic-item" +
                        (
                            topic.completed
                                ? " completed"
                                : ""
                        );


                    row.innerHTML = `

                        <input
                            type="checkbox"

                            ${
                                topic.completed
                                    ? "checked"
                                    : ""
                            }
                        >


                        <span class="topic-name">

                            ${escapeHTML(
                                topic.name
                            )}

                        </span>


                        <div class="topic-buttons">

                            <button class="topic-edit">
                                Edit
                            </button>

                            <button class="topic-delete">
                                Delete
                            </button>

                        </div>

                    `;


                    row.querySelector(
                        "input"
                    )
                    .addEventListener(
                        "change",
                        () =>
                            toggleTopic(
                                subject._id,
                                topic._id
                            )
                    );


                    row.querySelector(
                        ".topic-edit"
                    )
                    .addEventListener(
                        "click",
                        () =>
                            editTopic(
                                subject._id,
                                topic._id
                            )
                    );


                    row.querySelector(
                        ".topic-delete"
                    )
                    .addEventListener(
                        "click",
                        () =>
                            deleteTopic(
                                subject._id,
                                topic._id
                            )
                    );


                    topicList.appendChild(
                        row
                    );

                }
            );


            card.querySelector(
                ".edit-subject"
            )
            .addEventListener(
                "click",
                () =>
                    editSubject(
                        subject._id
                    )
            );


            card.querySelector(
                ".delete-subject"
            )
            .addEventListener(
                "click",
                () =>
                    deleteSubject(
                        subject._id
                    )
            );


            card.querySelector(
                ".add-topic-btn"
            )
            .addEventListener(
                "click",
                () =>
                    openTopicModal(
                        subject._id
                    )
            );


            subjectContainer.appendChild(
                card
            );

        }
    );


    updateStats();

}


// Stats

function updateStats() {

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


    const percentage =
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
        percentage + "%";

}


// Escape

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(text);

    return div.innerHTML;

}


// Close Modals

closeSubjectModal.onclick =
cancelSubjectBtn.onclick =
    () =>
        subjectModal.classList.remove(
            "show"
        );


closeTopicModal.onclick =
cancelTopicBtn.onclick =
    () =>
        topicModal.classList.remove(
            "show"
        );


searchSubject.addEventListener(
    "input",
    renderSubjects
);


// Start

loadSubjects();