// =======================================
// StudyRoom AI - Smart Notes
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


// User Based Storage

const notesStorageKey =
    "studyNotes_" +
    user.email.toLowerCase();


// Elements

const noteModal =
    document.getElementById("noteModal");

const addNoteBtn =
    document.getElementById("addNoteBtn");

const closeNoteModal =
    document.getElementById("closeNoteModal");

const cancelNoteBtn =
    document.getElementById("cancelNoteBtn");

const noteForm =
    document.getElementById("noteForm");

const notesContainer =
    document.getElementById("notesContainer");

const searchNotes =
    document.getElementById("searchNotes");

const subjectFilter =
    document.getElementById("subjectFilter");


// Fields

const editingNoteId =
    document.getElementById("editingNoteId");

const noteTitle =
    document.getElementById("noteTitle");

const noteSubject =
    document.getElementById("noteSubject");

const noteContent =
    document.getElementById("noteContent");

const pinNote =
    document.getElementById("pinNote");


// ---------------------------------------
// Storage
// ---------------------------------------

function getNotes() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(notesStorageKey)
                || "[]"
            );

        return Array.isArray(data)
            ? data
            : [];

    } catch {

        return [];

    }

}


function saveNotes(notes) {

    localStorage.setItem(
        notesStorageKey,
        JSON.stringify(notes)
    );

}


// ---------------------------------------
// Modal
// ---------------------------------------

function openNoteModal() {

    noteForm.reset();

    editingNoteId.value = "";

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
    function(event) {

        if (
            event.target === noteModal
        ) {

            closeNoteBox();

        }

    }
);


// ---------------------------------------
// Add / Edit Note
// ---------------------------------------

noteForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const title =
            noteTitle.value.trim();

        const subject =
            noteSubject.value.trim();

        const content =
            noteContent.value.trim();

        const pinned =
            pinNote.checked;


        if (
            !title ||
            !subject ||
            !content
        ) {

            alert(
                "Please complete all note fields."
            );

            return;

        }


        const notes =
            getNotes();


        const editId =
            editingNoteId.value;


        if (editId) {

            const index =
                notes.findIndex(
                    note =>
                        String(note.id)
                        === editId
                );


            if (index !== -1) {

                notes[index] = {

                    ...notes[index],

                    title,

                    subject,

                    content,

                    pinned,

                    updatedAt:
                        new Date()
                            .toISOString()

                };

            }

        } else {

            const newNote = {

                id:
                    Date.now(),

                title,

                subject,

                content,

                pinned,

                createdAt:
                    new Date()
                        .toISOString(),

                updatedAt:
                    null

            };


            notes.unshift(
                newNote
            );

        }


        saveNotes(notes);

        closeNoteBox();

        renderNotes();

    }
);


// ---------------------------------------
// Edit
// ---------------------------------------

function editNote(id) {

    const notes =
        getNotes();


    const note =
        notes.find(
            item =>
                item.id === id
        );


    if (!note)
        return;


    editingNoteId.value =
        note.id;

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


// ---------------------------------------
// Delete
// ---------------------------------------

function deleteNote(id) {

    const confirmDelete =
        confirm(
            "Delete this note?"
        );


    if (!confirmDelete)
        return;


    const notes =
        getNotes()
            .filter(
                note =>
                    note.id !== id
            );


    saveNotes(notes);

    renderNotes();

}


// ---------------------------------------
// Pin
// ---------------------------------------

function togglePin(id) {

    const notes =
        getNotes();


    const note =
        notes.find(
            item =>
                item.id === id
        );


    if (!note)
        return;


    note.pinned =
        !note.pinned;


    saveNotes(notes);

    renderNotes();

}


// ---------------------------------------
// Subject Filter
// ---------------------------------------

function updateSubjectFilter() {

    const notes =
        getNotes();


    const current =
        subjectFilter.value;


    const subjects = [

        ...new Set(
            notes.map(
                note =>
                    note.subject
            )
        )

    ];


    subjectFilter.innerHTML = `

        <option value="all">
            All Subjects
        </option>

    `;


    subjects
        .sort()
        .forEach(
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
        subjects.includes(current)
    ) {

        subjectFilter.value =
            current;

    }

}


// ---------------------------------------
// Render
// ---------------------------------------

function renderNotes() {

    const notes =
        getNotes();


    const query =
        searchNotes.value
            .trim()
            .toLowerCase();


    const selectedSubject =
        subjectFilter.value;


    const filtered =
        notes
            .filter(
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

                        selectedSubject === "all"

                        ||

                        note.subject ===
                            selectedSubject;


                    return (
                        searchMatch &&
                        subjectMatch
                    );

                }
            )
            .sort(
                (a, b) => {

                    if (
                        a.pinned !== b.pinned
                    ) {

                        return a.pinned
                            ? -1
                            : 1;

                    }


                    return (
                        new Date(
                            b.updatedAt ||
                            b.createdAt
                        )
                        -
                        new Date(
                            a.updatedAt ||
                            a.createdAt
                        )
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
                            note.id
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
                            note.id
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
                            note.id
                        )
                );


            notesContainer.appendChild(
                card
            );

        }
    );


    updateStats();

    updateSubjectFilter();

}


// ---------------------------------------
// Stats
// ---------------------------------------

function updateStats() {

    const notes =
        getNotes();


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


// ---------------------------------------
// Date
// ---------------------------------------

function formatDate(date) {

    return new Date(
        date
    ).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


// ---------------------------------------
// Security
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
// Search / Filter
// ---------------------------------------

searchNotes.addEventListener(
    "input",
    renderNotes
);


subjectFilter.addEventListener(
    "change",
    renderNotes
);


// Initial Load

renderNotes();