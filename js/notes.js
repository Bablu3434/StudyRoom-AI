// =====================================
// StudyRoom AI - Notes System
// Text + Live Camera + Image Upload
// =====================================

const API_URL =
    "http://localhost:5000/api/notes";

const BACKEND_URL =
    "http://localhost:5000";


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


// =====================================
// PHOTO ELEMENTS
// =====================================

const takePhotoBtn =
    document.getElementById(
        "takePhotoBtn"
    );

const uploadPhotoBtn =
    document.getElementById(
        "uploadPhotoBtn"
    );

const noteImageInput =
    document.getElementById(
        "noteImageInput"
    );

const noteImagePreviewBox =
    document.getElementById(
        "noteImagePreviewBox"
    );

const noteImagePreview =
    document.getElementById(
        "noteImagePreview"
    );

const removeNoteImage =
    document.getElementById(
        "removeNoteImage"
    );


// =====================================
// LIVE CAMERA ELEMENTS
// =====================================

const cameraBox =
    document.getElementById(
        "cameraBox"
    );

const cameraVideo =
    document.getElementById(
        "cameraVideo"
    );

const cameraCanvas =
    document.getElementById(
        "cameraCanvas"
    );

const capturePhotoBtn =
    document.getElementById(
        "capturePhotoBtn"
    );

const closeCameraBtn =
    document.getElementById(
        "closeCameraBtn"
    );


// =====================================
// STATE
// =====================================

let notes = [];

let selectedNoteImage =
    null;

let existingImageUrl =
    null;

let removeExistingImage =
    false;

let cameraStream =
    null;


// =====================================
// API HELPER
// JSON + FormData Support
// =====================================

async function apiFetch(
    url,
    options = {}
) {

    const headers = {

        Authorization:
            `Bearer ${token}`,

        ...options.headers

    };


    // FormData ke saath
    // Content-Type manually nahi dena.

    if (
        !(options.body instanceof FormData)
    ) {

        headers["Content-Type"] =
            "application/json";

    }


    const response =
        await fetch(
            url,
            {
                ...options,
                headers
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
            "Login session expired."
        );

    }


    const contentType =
        response.headers.get(
            "content-type"
        );


    let data = {};


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


        if (text) {

            throw new Error(
                text
            );

        }

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
// LOAD NOTES
// =====================================

async function loadNotes() {

    try {

        const data =
            await apiFetch(
                API_URL
            );


        notes =
            data.notes || [];


        updateSubjectFilter();

        renderNotes();

    } catch (error) {

        console.error(
            "Load Notes Error:",
            error
        );


        alert(
            error.message
        );

    }

}


// =====================================
// STOP LIVE CAMERA
// =====================================

function stopCamera() {

    if (
        cameraStream
    ) {

        cameraStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );


        cameraStream =
            null;

    }


    if (
        cameraVideo
    ) {

        cameraVideo.srcObject =
            null;

    }


    if (
        cameraBox
    ) {

        cameraBox
            .classList
            .add(
                "hidden"
            );

    }

}


// =====================================
// OPEN LIVE CAMERA
// =====================================

async function openCamera() {

    try {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            alert(
                "Your browser does not support live camera access."
            );

            return;

        }


        // Stop old stream first

        stopCamera();


        try {

            // Mobile par back camera prefer karega

            cameraStream =
                await navigator.mediaDevices
                    .getUserMedia({

                        video: {

                            facingMode: {
                                ideal:
                                    "environment"
                            },

                            width: {
                                ideal:
                                    1280
                            },

                            height: {
                                ideal:
                                    720
                            }

                        },

                        audio:
                            false

                    });

        } catch (firstError) {

            console.warn(
                "Preferred camera failed. Trying default camera.",
                firstError
            );


            // Laptop/Desktop fallback

            cameraStream =
                await navigator.mediaDevices
                    .getUserMedia({

                        video:
                            true,

                        audio:
                            false

                    });

        }


        cameraVideo.srcObject =
            cameraStream;


        cameraBox
            .classList
            .remove(
                "hidden"
            );


        try {

            await cameraVideo.play();

        } catch (playError) {

            console.warn(
                "Camera autoplay warning:",
                playError
            );

        }


        // Camera section visible karne ke liye

        cameraBox.scrollIntoView({
            behavior:
                "smooth",

            block:
                "nearest"
        });

    } catch (error) {

        console.error(
            "Camera Error:",
            error
        );


        if (
            error.name ===
            "NotAllowedError"
        ) {

            alert(
                "Camera permission denied. Please allow camera permission from your browser."
            );

        } else if (
            error.name ===
            "NotFoundError"
        ) {

            alert(
                "No camera was found on this device."
            );

        } else if (
            error.name ===
            "NotReadableError"
        ) {

            alert(
                "Camera is already being used by another application."
            );

        } else if (
            !window.isSecureContext
        ) {

            alert(
                "Camera requires localhost or HTTPS. Open this website through localhost or a secure HTTPS connection."
            );

        } else {

            alert(
                "Could not open the camera. Please check browser camera permission."
            );

        }

    }

}


// =====================================
// CAPTURE PHOTO FROM CAMERA
// =====================================

function captureCameraPhoto() {

    if (
        !cameraVideo ||
        !cameraCanvas
    ) {

        return;

    }


    if (
        !cameraVideo.videoWidth ||
        !cameraVideo.videoHeight
    ) {

        alert(
            "Camera is still loading. Please wait a moment and try again."
        );

        return;

    }


    cameraCanvas.width =
        cameraVideo.videoWidth;


    cameraCanvas.height =
        cameraVideo.videoHeight;


    const context =
        cameraCanvas.getContext(
            "2d"
        );


    if (!context) {

        alert(
            "Could not capture photo."
        );

        return;

    }


    context.drawImage(
        cameraVideo,
        0,
        0,
        cameraCanvas.width,
        cameraCanvas.height
    );


    cameraCanvas.toBlob(

        function (blob) {

            if (!blob) {

                alert(
                    "Could not capture photo."
                );

                return;

            }


            const file =
                new File(

                    [blob],

                    `study-note-${Date.now()}.jpg`,

                    {
                        type:
                            "image/jpeg"
                    }

                );


            // Same preview function
            // upload aur camera dono ke liye

            previewNoteImage(
                file
            );


            stopCamera();

        },

        "image/jpeg",

        0.9

    );

}


// =====================================
// RESET PHOTO STATE
// =====================================

function resetPhotoState() {

    stopCamera();


    selectedNoteImage =
        null;


    existingImageUrl =
        null;


    removeExistingImage =
        false;


    if (
        noteImageInput
    ) {

        noteImageInput.value =
            "";

    }


    if (
        noteImagePreview
    ) {

        noteImagePreview.src =
            "";

    }


    if (
        noteImagePreviewBox
    ) {

        noteImagePreviewBox
            .classList
            .add(
                "hidden"
            );

    }

}


// =====================================
// SHOW IMAGE PREVIEW
// =====================================

function showImagePreview(
    src
) {

    if (
        !noteImagePreview ||
        !noteImagePreviewBox
    ) {

        return;

    }


    noteImagePreview.src =
        src;


    noteImagePreviewBox
        .classList
        .remove(
            "hidden"
        );

}


// =====================================
// PREVIEW SELECTED PHOTO
// =====================================

function previewNoteImage(
    file
) {

    if (!file) {

        return;

    }


    if (
        !file.type.startsWith(
            "image/"
        )
    ) {

        alert(
            "Please select an image file."
        );

        return;

    }


    // Max 5 MB

    if (
        file.size >
        5 * 1024 * 1024
    ) {

        alert(
            "Image size must be less than 5 MB."
        );

        return;

    }


    selectedNoteImage =
        file;


    removeExistingImage =
        false;


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            showImagePreview(
                event.target.result
            );

        };


    reader.readAsDataURL(
        file
    );

}


// =====================================
// TAKE PHOTO BUTTON
// =====================================

if (
    takePhotoBtn
) {

    takePhotoBtn.addEventListener(
        "click",
        openCamera
    );

}


// =====================================
// CAPTURE PHOTO BUTTON
// =====================================

if (
    capturePhotoBtn
) {

    capturePhotoBtn.addEventListener(
        "click",
        captureCameraPhoto
    );

}


// =====================================
// CLOSE CAMERA BUTTON
// =====================================

if (
    closeCameraBtn
) {

    closeCameraBtn.addEventListener(
        "click",
        stopCamera
    );

}


// =====================================
// UPLOAD PHOTO BUTTON
// =====================================

if (
    uploadPhotoBtn &&
    noteImageInput
) {

    uploadPhotoBtn.addEventListener(
        "click",
        function () {

            stopCamera();


            noteImageInput.click();

        }
    );

}


// =====================================
// GALLERY / PC IMAGE SELECTED
// =====================================

if (
    noteImageInput
) {

    noteImageInput.addEventListener(
        "change",
        function () {

            const file =
                this.files?.[0];


            if (
                file
            ) {

                previewNoteImage(
                    file
                );

            }

        }
    );

}


// =====================================
// REMOVE PHOTO
// =====================================

if (
    removeNoteImage
) {

    removeNoteImage.addEventListener(
        "click",
        function () {

            stopCamera();


            // Existing DB photo remove

            if (
                existingImageUrl &&
                !selectedNoteImage
            ) {

                removeExistingImage =
                    true;

            }


            selectedNoteImage =
                null;


            if (
                noteImageInput
            ) {

                noteImageInput.value =
                    "";

            }


            if (
                noteImagePreview
            ) {

                noteImagePreview.src =
                    "";

            }


            if (
                noteImagePreviewBox
            ) {

                noteImagePreviewBox
                    .classList
                    .add(
                        "hidden"
                    );

            }

        }
    );

}


// =====================================
// OPEN ADD NOTE MODAL
// =====================================

function openNoteModal() {

    noteForm.reset();


    editingNoteId.value =
        "";


    resetPhotoState();


    document.getElementById(
        "noteModalTitle"
    ).textContent =
        "Add Note";


    noteModal.classList.add(
        "show"
    );

}


// =====================================
// CLOSE NOTE MODAL
// =====================================

function closeNoteBox() {

    stopCamera();


    noteModal.classList.remove(
        "show"
    );


    resetPhotoState();

}


// =====================================
// MODAL EVENTS
// =====================================

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
            event.target ===
            noteModal
        ) {

            closeNoteBox();

        }

    }
);


// =====================================
// ADD / UPDATE NOTE
// =====================================

noteForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        stopCamera();


        const title =
            noteTitle
                .value
                .trim();


        const subject =
            noteSubject
                .value
                .trim();


        const content =
            noteContent
                .value
                .trim();


        // =================================
        // VALIDATION
        // =================================

        if (
            !title ||
            !subject
        ) {

            alert(
                "Please enter title and subject."
            );

            return;

        }


        const hasExistingImage =
            Boolean(
                existingImageUrl &&
                !removeExistingImage
            );


        if (
            !content &&
            !selectedNoteImage &&
            !hasExistingImage
        ) {

            alert(
                "Please write a note or add a photo."
            );

            return;

        }


        // =================================
        // FORMDATA
        // =================================

        const formData =
            new FormData();


        formData.append(
            "title",
            title
        );


        formData.append(
            "subject",
            subject
        );


        formData.append(
            "content",
            content
        );


        formData.append(
            "pinned",
            String(
                pinNote.checked
            )
        );


        // Camera / Gallery photo

        if (
            selectedNoteImage
        ) {

            formData.append(
                "noteImage",
                selectedNoteImage
            );

        }


        // Remove previous DB image

        if (
            removeExistingImage
        ) {

            formData.append(
                "removeImage",
                "true"
            );

        }


        try {

            const id =
                editingNoteId.value;


            if (
                id
            ) {

                // UPDATE NOTE

                await apiFetch(
                    `${API_URL}/${id}`,
                    {
                        method:
                            "PUT",

                        body:
                            formData
                    }
                );

            } else {

                // CREATE NOTE

                await apiFetch(
                    API_URL,
                    {
                        method:
                            "POST",

                        body:
                            formData
                    }
                );

            }


            closeNoteBox();


            await loadNotes();

        } catch (error) {

            console.error(
                "Save Note Error:",
                error
            );


            alert(
                error.message
            );

        }

    }
);


// =====================================
// EDIT NOTE
// =====================================

function editNote(
    id
) {

    const note =
        notes.find(
            item =>
                item._id === id
        );


    if (!note) {

        return;

    }


    stopCamera();


    selectedNoteImage =
        null;


    removeExistingImage =
        false;


    if (
        noteImageInput
    ) {

        noteImageInput.value =
            "";

    }


    editingNoteId.value =
        note._id;


    noteTitle.value =
        note.title || "";


    noteSubject.value =
        note.subject || "";


    noteContent.value =
        note.content || "";


    pinNote.checked =
        Boolean(
            note.pinned
        );


    // =================================
    // EXISTING PHOTO
    // =================================

    existingImageUrl =
        note.imageUrl || null;


    if (
        existingImageUrl
    ) {

        showImagePreview(
            getImageURL(
                existingImageUrl
            )
        );

    } else {

        if (
            noteImagePreview
        ) {

            noteImagePreview.src =
                "";

        }


        if (
            noteImagePreviewBox
        ) {

            noteImagePreviewBox
                .classList
                .add(
                    "hidden"
                );

        }

    }


    document.getElementById(
        "noteModalTitle"
    ).textContent =
        "Edit Note";


    noteModal.classList.add(
        "show"
    );

}


// =====================================
// DELETE NOTE
// =====================================

async function deleteNote(
    id
) {

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

        console.error(
            "Delete Note Error:",
            error
        );


        alert(
            error.message
        );

    }

}


// =====================================
// PIN / UNPIN
// =====================================

async function togglePin(
    id
) {

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

        console.error(
            "Toggle Pin Error:",
            error
        );


        alert(
            error.message
        );

    }

}


// =====================================
// SUBJECT FILTER
// =====================================

function updateSubjectFilter() {

    const current =
        subjectFilter.value;


    const subjects = [

        ...new Set(

            notes
                .map(
                    note =>
                        note.subject
                )
                .filter(Boolean)

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


// =====================================
// IMAGE URL HELPER
// =====================================

function getImageURL(
    imageUrl
) {

    if (
        !imageUrl
    ) {

        return "";

    }


    if (
        imageUrl.startsWith(
            "http://"
        ) ||
        imageUrl.startsWith(
            "https://"
        )
    ) {

        return imageUrl;

    }


    return (
        BACKEND_URL +
        imageUrl
    );

}


// =====================================
// RENDER NOTES
// =====================================

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

                const title =
                    String(
                        note.title || ""
                    )
                        .toLowerCase();


                const subject =
                    String(
                        note.subject || ""
                    )
                        .toLowerCase();


                const content =
                    String(
                        note.content || ""
                    )
                        .toLowerCase();


                const searchMatch =

                    title.includes(
                        query
                    )

                    ||

                    subject.includes(
                        query
                    )

                    ||

                    content.includes(
                        query
                    );


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


    // =================================
    // EMPTY STATE
    // =================================

    if (
        filtered.length === 0
    ) {

        notesContainer.innerHTML = `

            <div class="empty-notes">

                <h3>
                    No notes found
                </h3>

                <p>
                    Add a text note or capture
                    a photo of your study notes.
                </p>

            </div>

        `;


        updateStats();

        return;

    }


    // =================================
    // NOTE CARDS
    // =================================

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


            const imageHTML =
                note.imageUrl

                    ? `

                        <div class="note-photo-wrapper">

                            <img
                                src="${escapeAttribute(
                                    getImageURL(
                                        note.imageUrl
                                    )
                                )}"
                                alt="${escapeAttribute(
                                    note.title
                                )}"
                                class="note-card-image"
                                loading="lazy"
                            >

                            <div class="note-photo-overlay">

                                <span>
                                    🔍 View Photo
                                </span>

                            </div>

                        </div>

                    `

                    : "";


            const contentHTML =
                note.content

                    ? `

                        <div class="note-text">

                            ${escapeHTML(
                                note.content
                            )}

                        </div>

                    `

                    : "";


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


                ${imageHTML}


                ${contentHTML}


                <div class="note-footer">

                    <span class="note-date">

                        ${formatDate(
                            note.updatedAt ||
                            note.createdAt
                        )}

                    </span>


                    <div class="note-actions">

                        <button
                            type="button"
                            class="pin-btn"
                        >

                            ${
                                note.pinned
                                    ? "Unpin"
                                    : "Pin"
                            }

                        </button>


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

                </div>

            `;


            // =================================
            // OPEN PHOTO LARGE
            // =================================

            const photoWrapper =
                card.querySelector(
                    ".note-photo-wrapper"
                );


            if (
                photoWrapper &&
                note.imageUrl
            ) {

                photoWrapper
                    .addEventListener(
                        "click",
                        function () {

                            openNotePhoto(
                                note
                            );

                        }
                    );

            }


            // =================================
            // BUTTON EVENTS
            // =================================

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


            notesContainer
                .appendChild(
                    card
                );

        }
    );


    updateStats();

}


// =====================================
// LARGE PHOTO VIEWER
// =====================================

function openNotePhoto(
    note
) {

    if (
        !note.imageUrl
    ) {

        return;

    }


    const oldViewer =
        document.getElementById(
            "notePhotoViewer"
        );


    if (
        oldViewer
    ) {

        oldViewer.remove();

    }


    const viewer =
        document.createElement(
            "div"
        );


    viewer.id =
        "notePhotoViewer";


    viewer.className =
        "note-photo-viewer";


    viewer.innerHTML = `

        <div class="note-photo-viewer-box">

            <div class="photo-viewer-header">

                <div>

                    <span>
                        ${escapeHTML(
                            note.subject
                        )}
                    </span>

                    <h3>
                        ${escapeHTML(
                            note.title
                        )}
                    </h3>

                </div>


                <button
                    type="button"
                    class="close-photo-viewer"
                    aria-label="Close photo"
                >
                    ✕
                </button>

            </div>


            <div class="photo-viewer-image-area">

                <img
                    src="${escapeAttribute(
                        getImageURL(
                            note.imageUrl
                        )
                    )}"
                    alt="${escapeAttribute(
                        note.title
                    )}"
                >

            </div>

        </div>

    `;


    document.body
        .appendChild(
            viewer
        );


    document.body
        .classList
        .add(
            "photo-viewer-open"
        );


    const closeViewer =
        function () {

            viewer.remove();


            document.body
                .classList
                .remove(
                    "photo-viewer-open"
                );

        };


    viewer
        .querySelector(
            ".close-photo-viewer"
        )
        .addEventListener(
            "click",
            closeViewer
        );


    viewer.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                viewer
            ) {

                closeViewer();

            }

        }
    );

}


// =====================================
// STATS
// =====================================

function updateStats() {

    const pinned =
        notes.filter(
            note =>
                note.pinned
        ).length;


    const subjects =
        new Set(

            notes
                .map(
                    note =>
                        note.subject
                )
                .filter(Boolean)

        );


    setText(
        "totalNotes",
        notes.length
    );


    setText(
        "pinnedNotes",
        pinned
    );


    setText(
        "subjectCount",
        subjects.size
    );

}


// =====================================
// HELPERS
// =====================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (
        element
    ) {

        element.textContent =
            value;

    }

}


function formatDate(
    date
) {

    if (
        !date
    ) {

        return "";

    }


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


function escapeHTML(
    text
) {

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


function escapeAttribute(
    text
) {

    return String(
        text ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}


// =====================================
// SEARCH / FILTER
// =====================================

searchNotes.addEventListener(
    "input",
    renderNotes
);


subjectFilter.addEventListener(
    "change",
    renderNotes
);


// =====================================
// STOP CAMERA IF PAGE CLOSES
// =====================================

window.addEventListener(
    "beforeunload",
    stopCamera
);


// =====================================
// START
// =====================================

loadNotes();