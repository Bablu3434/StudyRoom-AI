const API_URL =
    "http://localhost:5000/api/notes";


const token =
    localStorage.getItem(
        "studyRoomToken"
    );


if (!token) {

    window.location.href =
        "login.html";

}


// Elements

const noteModal =
    document.getElementById(
        "noteModal"
    );

const addNoteBtn =
    document.getElementById(
        "addNoteBtn"
    );

const closeNoteModal =
    document.getElementById(
        "closeNoteModal"
    );

const cancelNoteBtn =
    document.getElementById(
        "cancelNoteBtn"
    );

const noteForm =
    document.getElementById(
        "noteForm"
    );

const notesContainer =
    document.getElementById(
        "notesContainer"
    );

const searchNotes =
    document.getElementById(
        "searchNotes"
    );

const subjectFilter =
    document.getElementById(
        "subjectFilter"
    );


const editingNoteId =
    document.getElementById(
        "editingNoteId"
    );

const noteTitle =
    document.getElementById(
        "noteTitle"
    );

const noteSubject =
    document.getElementById(
        "noteSubject"
    );

const noteContent =
    document.getElementById(
        "noteContent"
    );

const pinNote =
    document.getElementById(
        "pinNote"
    );


let notes = [];


// ===================================
// API Helper
// ===================================

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


// ===================================
// Load Notes
// ===================================

async function loadNotes() {

    try {

        const data =
            await apiFetch(
                API_URL
            );


        notes =
            data.notes;


        updateSubjectFilter();

        renderNotes();

    } catch (error) {

        alert(
            error.message
        );

    }

}


// ===================================
// Modal
// ===================================

function openNoteModal() {

    noteForm.reset();

    editingNoteId.value =
        "";


    document.getElementById(
        "noteModalTitle"
    ).textContent =
        "Add Note";


    noteModal.classList.add(
        "show"
    );

}


function closeNoteBox() {

    noteModal.classList.remove(
        "show"
    );

}


addNoteBtn.addEventListener(
    "click",
    openNoteModal
);


closeNoteModal.addEventListener(
    "click",
    closeNoteBox
);


cancelNoteBtn.addEventListener(
    "click",
    closeNoteBox
);


noteModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === noteModal
        ) {

            closeNoteBox();

        }

    }
);


// ===================================
// Add / Update Note
// ===================================

noteForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const body = {

            title:
                noteTitle
                    .value
                    .trim(),

            subject:
                noteSubject
                    .value
                    .trim(),

            content:
                noteContent
                    .value
                    .trim(),

            pinned:
                pinNote.checked

        };


        try {

            const id =
                editingNoteId.value;


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


            closeNoteBox();

            await loadNotes();

        } catch (error) {

            alert(
                error.message
            );

        }

    }
);


// ===================================
// Edit
// ===================================

function editNote(id) {

    const note =
        notes.find(
            item =>
                item._id === id
        );


    if (!note)
        return;


    editingNoteId.value =
        note._id;


    noteTitle.value =
        note.title;


    noteSubject.value =
        note.subject;


    noteContent.value =
        note.content;


    pinNote.checked =
        note.pinned;


    document.getElementById(
        "noteModalTitle"
    ).textContent =
        "Edit Note";


    noteModal.classList.add(
        "show"
    );

}


// ===================================
// Delete
// ===================================

async function deleteNote(id) {

    if (
        !confirm(
            "Delete this note?"
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


        await loadNotes();

    } catch (error) {

        alert(
            error.message
        );

    }

}


// ===================================
// Pin / Unpin
// ===================================

async function togglePin(id) {

    try {

        await apiFetch(
            `${API_URL}/${id}/pin`,
            {
                method:
                    "PATCH"
            }
        );


        await loadNotes();

    } catch (error) {

        alert(
            error.message
        );

    }

}


// ===================================
// Subject Filter
// ===================================

function updateSubjectFilter() {

    const current =
        subjectFilter.value;


    const subjects = [

        ...new Set(
            notes.map(
                note =>
                    note.subject
            )
        )

    ].sort();


    subjectFilter.innerHTML = `

        <option value="all">
            All Subjects
        </option>

    `;


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


            subjectFilter.appendChild(
                option
            );

        }
    );


    if (
        subjects.includes(
            current
        )
    ) {

        subjectFilter.value =
            current;

    }

}


// ===================================
// Render Notes
// ===================================

function renderNotes() {

    const query =
        searchNotes.value
            .trim()
            .toLowerCase();


    const selectedSubject =
        subjectFilter.value;


    const filtered =
        notes.filter(
            note => {

                const searchMatch =

                    note.title
                        .toLowerCase()
                        .includes(query)

                    ||

                    note.subject
                        .toLowerCase()
                        .includes(query)

                    ||

                    note.content
                        .toLowerCase()
                        .includes(query);


                const subjectMatch =

                    selectedSubject ===
                    "all"

                    ||

                    note.subject ===
                    selectedSubject;


                return (
                    searchMatch &&
                    subjectMatch
                );

            }
        );


    notesContainer.innerHTML =
        "";


    if (
        filtered.length === 0
    ) {

        notesContainer.innerHTML = `

            <div class="empty-notes">

                <h3>
                    No notes found
                </h3>

                <p>
                    Add your first study note.
                </p>

            </div>

        `;

    }


    filtered.forEach(
        note => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "note-card" +
                (
                    note.pinned
                        ? " pinned"
                        : ""
                );


            card.innerHTML = `

                ${
                    note.pinned

                        ? `
                            <span class="pin-badge">
                                📌 Pinned
                            </span>
                        `

                        : ""
                }


                <div class="note-subject">

                    ${escapeHTML(
                        note.subject
                    )}

                </div>


                <h3>

                    ${escapeHTML(
                        note.title
                    )}

                </h3>


                <div class="note-text">

                    ${escapeHTML(
                        note.content
                    )}

                </div>


                <div class="note-footer">

                    <span class="note-date">

                        ${formatDate(
                            note.updatedAt ||
                            note.createdAt
                        )}

                    </span>


                    <div class="note-actions">

                        <button
                            class="pin-btn"
                        >
                            ${
                                note.pinned
                                    ? "Unpin"
                                    : "Pin"
                            }
                        </button>


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

                </div>

            `;


            card
                .querySelector(
                    ".pin-btn"
                )
                .addEventListener(
                    "click",
                    () =>
                        togglePin(
                            note._id
                        )
                );


            card
                .querySelector(
                    ".edit-btn"
                )
                .addEventListener(
                    "click",
                    () =>
                        editNote(
                            note._id
                        )
                );


            card
                .querySelector(
                    ".delete-btn"
                )
                .addEventListener(
                    "click",
                    () =>
                        deleteNote(
                            note._id
                        )
                );


            notesContainer.appendChild(
                card
            );

        }
    );


    updateStats();

}


// ===================================
// Stats
// ===================================

function updateStats() {

    const pinned =
        notes.filter(
            note =>
                note.pinned
        ).length;


    const subjects =
        new Set(
            notes.map(
                note =>
                    note.subject
            )
        );


    document.getElementById(
        "totalNotes"
    ).textContent =
        notes.length;


    document.getElementById(
        "pinnedNotes"
    ).textContent =
        pinned;


    document.getElementById(
        "subjectCount"
    ).textContent =
        subjects.size;

}


// ===================================
// Helpers
// ===================================

function formatDate(date) {

    return new Date(
        date
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

searchNotes.addEventListener(
    "input",
    renderNotes
);


subjectFilter.addEventListener(
    "change",
    renderNotes
);


// Start

loadNotes();