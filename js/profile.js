const API_URL =
    "http://localhost:5000/api/profile";


const token =
    localStorage.getItem(
        "studyRoomToken"
    );


if (!token) {

    window.location.href =
        "login.html";

}


const profileForm =
    document.getElementById(
        "profileForm"
    );

const courseInput =
    document.getElementById(
        "course"
    );

const semesterInput =
    document.getElementById(
        "semester"
    );

const dailyGoalInput =
    document.getElementById(
        "dailyStudyGoal"
    );

const examDateInput =
    document.getElementById(
        "examDate"
    );

const mainGoalInput =
    document.getElementById(
        "mainGoal"
    );

const messageBox =
    document.getElementById(
        "profileMessage"
    );

const saveBtn =
    document.getElementById(
        "saveProfileBtn"
    );


// =====================================
// API
// =====================================

async function apiFetch(
    options = {}
) {

    const response =
        await fetch(
            API_URL,
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


// =====================================
// LOAD PROFILE
// =====================================

async function loadProfile() {

    try {

        const data =
            await apiFetch();


        const profile =
            data.profile;


        document.getElementById(
            "profileName"
        ).textContent =
            profile.name;


        document.getElementById(
            "profileEmail"
        ).textContent =
            profile.email;


        const avatar =
            document.querySelector(
                ".avatar"
            );


        if (
            avatar &&
            profile.name
        ) {

            avatar.textContent =
                profile.name
                    .charAt(0)
                    .toUpperCase();

        }


        courseInput.value =
            profile.course || "";


        semesterInput.value =
            profile.semester || "";


        dailyGoalInput.value =
            String(
                profile.dailyStudyGoal ||
                120
            );


        mainGoalInput.value =
            profile.mainGoal || "";


        if (
            profile.examDate
        ) {

            examDateInput.value =
                profile.examDate
                    .split("T")[0];

        }


        updateCountdown();

    } catch (error) {

        messageBox.textContent =
            error.message;

    }

}


// =====================================
// SAVE PROFILE
// =====================================

profileForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        saveBtn.disabled =
            true;


        messageBox.textContent =
            "Saving...";


        try {

            await apiFetch({

                method:
                    "PUT",

                body:
                    JSON.stringify({

                        course:
                            courseInput
                                .value
                                .trim(),

                        semester:
                            semesterInput
                                .value
                                .trim(),

                        dailyStudyGoal:
                            Number(
                                dailyGoalInput.value
                            ),

                        examDate:
                            examDateInput.value,

                        mainGoal:
                            mainGoalInput
                                .value
                                .trim()

                    })

            });


            messageBox.textContent =
                "Profile saved successfully.";


            updateCountdown();

        } catch (error) {

            messageBox.textContent =
                error.message;

        } finally {

            saveBtn.disabled =
                false;

        }

    }
);


// =====================================
// EXAM COUNTDOWN
// =====================================

function updateCountdown() {

    const box =
        document.getElementById(
            "examCountdown"
        );


    if (
        !examDateInput.value
    ) {

        box.textContent =
            "Add your exam date to activate exam countdown.";

        return;
    }


    const exam =
        new Date(
            examDateInput.value +
            "T00:00:00"
        );


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const difference =
        exam.getTime() -
        today.getTime();


    const days =
        Math.ceil(
            difference /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    if (days > 1) {

        box.textContent =
            `${days} days remaining until your exam.`;

    } else if (
        days === 1
    ) {

        box.textContent =
            "Your exam is tomorrow.";

    } else if (
        days === 0
    ) {

        box.textContent =
            "Your exam is today.";

    } else {

        box.textContent =
            "This exam date has passed.";

    }

}


examDateInput.addEventListener(
    "change",
    updateCountdown
);


// =====================================
// START
// =====================================

loadProfile();