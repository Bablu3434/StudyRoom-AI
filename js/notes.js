// =====================================
// StudyRoom AI - Notes System
// Multiple Images + Live Camera
// =====================================

const API_URL =
    "http://localhost:5000/api/notes";

const BACKEND_URL =
    "http://localhost:5000";

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;


// =====================================
// AUTH
// =====================================

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
// IMAGE ELEMENTS
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


// Allow multiple file selection
if (noteImageInput) {

    noteImageInput.multiple =
        true;

}


// =====================================
// CAMERA ELEMENTS
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


// New photos:
// [
//   {
//      file: File,
//      previewUrl: "blob:..."
//   }
// ]

let selectedNoteImages =
    [];


// Existing database photos

let existingImageUrls =
    [];


// Existing photos user removed while editing

let removedExistingImages =
    [];


// Camera stream

let cameraStream =
    null;


// =====================================
// API HELPER
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


    // FormData ke case me browser
    // khud multipart Content-Type set karega.

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
        ) || "";


    let data;


    if (
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
            text ||
            "Server request failed"
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
// GET NOTE IMAGES
// Supports new + old notes
// =====================================

function getNoteImages(
    note
) {

    const images = [];


    if (
        Array.isArray(
            note.imageUrls
        )
    ) {

        note.imageUrls
            .forEach(
                imageUrl => {

                    if (
                        imageUrl &&
                        !images.includes(
                            imageUrl
                        )
                    ) {

                        images.push(
                            imageUrl
                        );

                    }

                }
            );

    }


    // Old single image support

    if (
        note.imageUrl &&
        !images.includes(
            note.imageUrl
        )
    ) {

        images.push(
            note.imageUrl
        );

    }


    return images;

}


// =====================================
// ACTIVE EXISTING IMAGES
// =====================================

function getActiveExistingImages() {

    return existingImageUrls
        .filter(
            imageUrl =>
                !removedExistingImages
                    .includes(
                        imageUrl
                    )
        );

}


// =====================================
// TOTAL CURRENT IMAGE COUNT
// =====================================

function getCurrentImageCount() {

    return (
        getActiveExistingImages().length +
        selectedNoteImages.length
    );

}


// =====================================
// STOP CAMERA
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
// OPEN CAMERA
// =====================================

async function openCamera() {

    try {

        if (
            getCurrentImageCount() >=
            MAX_IMAGES
        ) {

            alert(
                `Maximum ${MAX_IMAGES} photos are allowed in one note.`
            );

            return;

        }


        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {

            alert(
                "Camera is not supported in this browser."
            );

            return;

        }


        stopCamera();


        try {

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

        } catch (error) {

            console.warn(
                "Back camera unavailable, trying default camera."
            );


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


        await cameraVideo.play();


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
                "Camera permission denied. Please allow camera permission."
            );

        } else if (
            error.name ===
            "NotFoundError"
        ) {

            alert(
                "No camera found on this device."
            );

        } else if (
            error.name ===
            "NotReadableError"
        ) {

            alert(
                "Camera is being used by another application."
            );

        } else if (
            !window.isSecureContext
        ) {

            alert(
                "Camera requires localhost or HTTPS."
            );

        } else {

            alert(
                "Could not open camera."
            );

        }

    }

}


// =====================================
// ADD NEW IMAGE FILES
// =====================================

function addSelectedImages(
    files
) {

    const incomingFiles =
        Array.from(
            files || []
        );


    if (
        incomingFiles.length === 0
    ) {

        return;

    }


    let availableSlots =
        MAX_IMAGES -
        getCurrentImageCount();


    if (
        availableSlots <= 0
    ) {

        alert(
            `Maximum ${MAX_IMAGES} photos are allowed.`
        );

        return;

    }


    let addedCount =
        0;


    for (
        const file of incomingFiles
    ) {

        if (
            availableSlots <= 0
        ) {

            break;

        }


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            continue;

        }


        if (
            file.size >
            MAX_IMAGE_SIZE
        ) {

            alert(
                `${file.name} is larger than 5 MB and was skipped.`
            );

            continue;

        }


        const previewUrl =
            URL.createObjectURL(
                file
            );


        selectedNoteImages.push({

            file,
            previewUrl

        });


        availableSlots--;

        addedCount++;

    }


    if (
        incomingFiles.length >
        addedCount &&
        getCurrentImageCount() >=
        MAX_IMAGES
    ) {

        alert(
            `Only ${MAX_IMAGES} photos can be added to one note.`
        );

    }


    renderImagePreviews();

}


// =====================================
// CAPTURE CAMERA PHOTO
// =====================================

function captureCameraPhoto() {

    if (
        getCurrentImageCount() >=
        MAX_IMAGES
    ) {

        alert(
            `Maximum ${MAX_IMAGES} photos are allowed.`
        );


        stopCamera();

        return;

    }


    if (
        !cameraVideo ||
        !cameraCanvas ||
        !cameraVideo.videoWidth ||
        !cameraVideo.videoHeight
    ) {

        alert(
            "Camera is still loading. Please try again."
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


            addSelectedImages(
                [file]
            );


            // Camera intentionally open rahega
            // so user can capture another page.

            if (
                getCurrentImageCount() >=
                MAX_IMAGES
            ) {

                stopCamera();

            }

        },

        "image/jpeg",

        0.9

    );

}


// =====================================
// REMOVE NEW SELECTED PHOTO
// =====================================

function removeSelectedImage(
    index
) {

    const item =
        selectedNoteImages[
            index
        ];


    if (!item) {

        return;

    }


    if (
        item.previewUrl
    ) {

        URL.revokeObjectURL(
            item.previewUrl
        );

    }


    selectedNoteImages.splice(
        index,
        1
    );


    renderImagePreviews();

}


// =====================================
// REMOVE EXISTING DB PHOTO
// =====================================

function removeExistingImage(
    imageUrl
) {

    if (
        !imageUrl
    ) {

        return;

    }


    if (
        !removedExistingImages
            .includes(
                imageUrl
            )
    ) {

        removedExistingImages.push(
            imageUrl
        );

    }


    renderImagePreviews();

}


// =====================================
// RENDER MULTIPLE PREVIEWS
// =====================================

function renderImagePreviews() {

    if (
        !noteImagePreviewBox
    ) {

        return;

    }


    const activeExisting =
        getActiveExistingImages();


    const total =
        activeExisting.length +
        selectedNoteImages.length;


    if (
        total === 0
    ) {

        noteImagePreviewBox
            .classList
            .add(
                "hidden"
            );


        noteImagePreviewBox.innerHTML =
            "";

        return;

    }


    noteImagePreviewBox
        .classList
        .remove(
            "hidden"
        );


    let previewHTML = `

        <div class="multi-preview-header">

            <div>

                <strong>
                    Photo Preview
                </strong>

                <small>
                    ${total} / ${MAX_IMAGES} photos
                </small>

            </div>

        </div>


        <div class="multi-preview-grid">

    `;


    // Existing DB images

    activeExisting.forEach(
        (imageUrl) => {

            previewHTML += `

                <div
                    class="preview-image-card"
                    data-existing-image="${escapeAttribute(
                        imageUrl
                    )}"
                >

                    <img
                        src="${escapeAttribute(
                            getImageURL(
                                imageUrl
                            )
                        )}"
                        alt="Saved note image"
                    >

                    <span class="image-status-badge">
                        Saved
                    </span>

                    <button
                        type="button"
                        class="remove-preview-image existing-image-remove"
                        data-image-url="${escapeAttribute(
                            imageUrl
                        )}"
                        title="Remove photo"
                    >
                        ✕
                    </button>

                </div>

            `;

        }
    );


    // Newly selected/captured images

    selectedNoteImages.forEach(
        (item, index) => {

            previewHTML += `

                <div
                    class="preview-image-card"
                >

                    <img
                        src="${escapeAttribute(
                            item.previewUrl
                        )}"
                        alt="New note image"
                    >

                    <span class="image-status-badge new">
                        New
                    </span>

                    <button
                        type="button"
                        class="remove-preview-image new-image-remove"
                        data-index="${index}"
                        title="Remove photo"
                    >
                        ✕
                    </button>

                </div>

            `;

        }
    );


    previewHTML += `

        </div>

    `;


    noteImagePreviewBox.innerHTML =
        previewHTML;


    // Existing image remove events

    noteImagePreviewBox
        .querySelectorAll(
            ".existing-image-remove"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        removeExistingImage(
                            this.dataset.imageUrl
                        );

                    }
                );

            }
        );


    // New image remove events

    noteImagePreviewBox
        .querySelectorAll(
            ".new-image-remove"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );


                        removeSelectedImage(
                            index
                        );

                    }
                );

            }
        );

}


// =====================================
// RESET IMAGE STATE
// =====================================

function resetPhotoState() {

    stopCamera();


    selectedNoteImages
        .forEach(
            item => {

                if (
                    item.previewUrl
                ) {

                    URL.revokeObjectURL(
                        item.previewUrl
                    );

                }

            }
        );


    selectedNoteImages =
        [];


    existingImageUrls =
        [];


    removedExistingImages =
        [];


    if (
        noteImageInput
    ) {

        noteImageInput.value =
            "";

    }


    if (
        noteImagePreviewBox
    ) {

        noteImagePreviewBox.innerHTML =
            "";


        noteImagePreviewBox
            .classList
            .add(
                "hidden"
            );

    }

}


// =====================================
// CAMERA BUTTON
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
// CAPTURE BUTTON
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
// CLOSE CAMERA
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
// MULTIPLE FILE SELECT
// =====================================

if (
    noteImageInput
) {

    noteImageInput.addEventListener(
        "change",
        function () {

            addSelectedImages(
                this.files
            );


            // Same image dubara select
            // karne ke liye reset

            this.value =
                "";

        }
    );

}


// =====================================
// OPEN ADD NOTE
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


    noteModal
        .classList
        .add(
            "show"
        );

}


// =====================================
// CLOSE MODAL
// =====================================

function closeNoteBox() {

    stopCamera();


    noteModal
        .classList
        .remove(
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
// SAVE / UPDATE NOTE
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


        if (
            !title ||
            !subject
        ) {

            alert(
                "Please enter title and subject."
            );

            return;

        }


        const activeExisting =
            getActiveExistingImages();


        if (
            !content &&
            activeExisting.length === 0 &&
            selectedNoteImages.length === 0
        ) {

            alert(
                "Please write a note or add at least one photo."
            );

            return;

        }


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


        // =================================
        // NEW MULTIPLE IMAGES
        // IMPORTANT FIELD NAME:
        // noteImages
        // =================================

        selectedNoteImages
            .forEach(
                item => {

                    formData.append(
                        "noteImages",
                        item.file
                    );

                }
            );


        // Existing images removed during edit

        if (
            removedExistingImages.length >
            0
        ) {

            formData.append(
                "removeImages",
                JSON.stringify(
                    removedExistingImages
                )
            );

        }


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
                            formData
                    }
                );

            } else {

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


    resetPhotoState();


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


    // Load existing images

    existingImageUrls =
        getNoteImages(
            note
        );


    removedExistingImages =
        [];


    selectedNoteImages =
        [];


    renderImagePreviews();


    document.getElementById(
        "noteModalTitle"
    ).textContent =
        "Edit Note";


    noteModal
        .classList
        .add(
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
// IMAGE URL
// =====================================

function getImageURL(
    imageUrl
) {

    if (!imageUrl) {

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


    if (
        filtered.length === 0
    ) {

        notesContainer.innerHTML = `

            <div class="empty-notes">

                <h3>
                    No notes found
                </h3>

                <p>
                    Add text notes or multiple
                    photos of your study material.
                </p>

            </div>

        `;


        updateStats();

        return;

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


            const noteImages =
                getNoteImages(
                    note
                );


            let imageHTML =
                "";


            if (
                noteImages.length >
                0
            ) {

                imageHTML += `

                    <div class="note-card-gallery">

                `;


                noteImages.forEach(
                    (imageUrl, index) => {

                        imageHTML += `

                            <div
                                class="note-photo-wrapper"
                                data-image-index="${index}"
                            >

                                <img
                                    src="${escapeAttribute(
                                        getImageURL(
                                            imageUrl
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
                                        🔍 View
                                    </span>

                                </div>

                            </div>

                        `;

                    }
                );


                imageHTML += `

                    </div>

                `;

            }


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
            // IMAGE CLICK EVENTS
            // =================================

            card
                .querySelectorAll(
                    ".note-photo-wrapper"
                )
                .forEach(
                    wrapper => {

                        wrapper.addEventListener(
                            "click",
                            function () {

                                const index =
                                    Number(
                                        this.dataset.imageIndex
                                    );


                                openNotePhoto(
                                    note,
                                    noteImages[
                                        index
                                    ]
                                );

                            }
                        );

                    }
                );


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
    note,
    imageUrl
) {

    if (
        !imageUrl
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
                >
                    ✕
                </button>

            </div>


            <div class="photo-viewer-image-area">

                <img
                    src="${escapeAttribute(
                        getImageURL(
                            imageUrl
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


    function closeViewer() {

        viewer.remove();


        document.body
            .classList
            .remove(
                "photo-viewer-open"
            );

    }


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

    if (!date) {

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
// PAGE CLOSE
// =====================================

window.addEventListener(
    "beforeunload",
    stopCamera
);


// =====================================
// START
// =====================================

loadNotes();