const PROFILE_API =
    "http://localhost:5000/api/profile";


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

const dailyStudyGoal =
    document.getElementById(
        "dailyStudyGoal"
    );


const focusDuration =
    document.getElementById(
        "focusDuration"
    );


const breakDuration =
    document.getElementById(
        "breakDuration"
    );


const theme =
    document.getElementById(
        "theme"
    );


const studyReminders =
    document.getElementById(
        "studyReminders"
    );


const autoDailyPlan =
    document.getElementById(
        "autoDailyPlan"
    );


const saveSettingsBtn =
    document.getElementById(
        "saveSettingsBtn"
    );


const resetSettingsBtn =
    document.getElementById(
        "resetSettingsBtn"
    );


const settingsMessage =
    document.getElementById(
        "settingsMessage"
    );


// =====================================
// DEFAULT SETTINGS
// =====================================

const defaultSettings = {

    focusDuration: 25,

    breakDuration: 5,

    theme: "light",

    studyReminders: false,

    autoDailyPlan: true

};


// =====================================
// LOAD SETTINGS
// =====================================

async function loadSettings() {

    try {

        const savedSettings =
            JSON.parse(
                localStorage.getItem(
                    "studyRoomSettings"
                )
            ) || defaultSettings;


        focusDuration.value =
            savedSettings.focusDuration ||
            25;


        breakDuration.value =
            savedSettings.breakDuration ||
            5;


        theme.value =
            savedSettings.theme ||
            "light";


        studyReminders.checked =
            Boolean(
                savedSettings.studyReminders
            );


        autoDailyPlan.checked =
            savedSettings.autoDailyPlan !== false;


        applyTheme(
            savedSettings.theme
        );


        await loadProfileSettings();

    } catch (error) {

        console.error(
            "Settings Load Error:",
            error
        );

    }

}


// =====================================
// LOAD PROFILE SETTINGS
// =====================================

async function loadProfileSettings() {

    try {

        const response =
            await fetch(
                PROFILE_API,
                {
                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }
                }
            );


        if (
            response.status === 401
        ) {

            logout();

            return;

        }


        const data =
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(
                data.message ||
                "Could not load profile"
            );

        }


        const profile =
            data.profile || data;


        if (
            profile.dailyStudyGoal
        ) {

            dailyStudyGoal.value =
                String(
                    profile.dailyStudyGoal
                );

        }

    } catch (error) {

        console.error(
            "Profile Settings Error:",
            error
        );

    }

}


// =====================================
// SAVE SETTINGS
// =====================================

async function saveSettings() {

    try {

        saveSettingsBtn.disabled =
            true;


        saveSettingsBtn.textContent =
            "Saving...";


        // =====================================
        // NOTIFICATION PERMISSION
        // =====================================

        if (
            studyReminders.checked
        ) {

            if (
                typeof requestNotificationPermission !==
                "function"
            ) {

                throw new Error(
                    "Notification system is not loaded."
                );

            }


            const allowed =
                await requestNotificationPermission();


            if (!allowed) {

                studyReminders.checked =
                    false;


                showMessage(
                    "Notification permission is required for study reminders.",
                    "error"
                );

            }

        }


        const settings = {

            focusDuration:
                Number(
                    focusDuration.value
                ),

            breakDuration:
                Number(
                    breakDuration.value
                ),

            theme:
                theme.value,

            studyReminders:
                studyReminders.checked,

            autoDailyPlan:
                autoDailyPlan.checked

        };


        localStorage.setItem(
            "studyRoomSettings",
            JSON.stringify(
                settings
            )
        );


        applyTheme(
            settings.theme
        );


        await updateDailyStudyGoal();


        showMessage(
            "Settings saved successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Save Settings Error:",
            error
        );


        showMessage(
            error.message ||
            "Could not save settings.",
            "error"
        );

    } finally {

        saveSettingsBtn.disabled =
            false;


        saveSettingsBtn.textContent =
            "Save Settings";

    }

}


// =====================================
// UPDATE DAILY STUDY GOAL
// =====================================

async function updateDailyStudyGoal() {

    const response =
        await fetch(
            PROFILE_API,
            {

                method:
                    "PUT",

                headers: {

                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`

                },

                body:
                    JSON.stringify({

                        dailyStudyGoal:
                            Number(
                                dailyStudyGoal.value
                            )

                    })

            }
        );


    if (
        response.status === 401
    ) {

        logout();

        return;

    }


    const data =
        await response.json();


    if (
        !response.ok
    ) {

        throw new Error(
            data.message ||
            "Could not update study goal"
        );

    }

}


// =====================================
// RESET SETTINGS
// =====================================

function resetSettings() {

    const confirmReset =
        confirm(
            "Reset StudyRoom settings to default?"
        );


    if (
        !confirmReset
    ) {

        return;

    }


    localStorage.setItem(
        "studyRoomSettings",
        JSON.stringify(
            defaultSettings
        )
    );


    focusDuration.value =
        defaultSettings.focusDuration;


    breakDuration.value =
        defaultSettings.breakDuration;


    theme.value =
        defaultSettings.theme;


    studyReminders.checked =
        defaultSettings.studyReminders;


    autoDailyPlan.checked =
        defaultSettings.autoDailyPlan;


    applyTheme(
        defaultSettings.theme
    );


    showMessage(
        "Settings reset successfully.",
        "success"
    );

}


// =====================================
// THEME
// =====================================

function applyTheme(
    selectedTheme
) {

    document.body
        .classList
        .remove(
            "dark-mode"
        );


    if (
        selectedTheme ===
        "dark"
    ) {

        document.body
            .classList
            .add(
                "dark-mode"
            );


        return;

    }


    if (
        selectedTheme ===
        "system"
    ) {

        const prefersDark =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            )
            .matches;


        if (
            prefersDark
        ) {

            document.body
                .classList
                .add(
                    "dark-mode"
                );

        }

    }

}


// =====================================
// MESSAGE
// =====================================

function showMessage(
    message,
    type
) {

    if (!settingsMessage) {

        return;

    }


    settingsMessage.textContent =
        message;


    settingsMessage.className =
        `message ${type}`;


    setTimeout(
        () => {

            settingsMessage.className =
                "message";

        },
        3000
    );

}


// =====================================
// LOGOUT
// =====================================

function logout() {

    localStorage.removeItem(
        "studyRoomToken"
    );


    localStorage.removeItem(
        "studyRoomUser"
    );


    window.location.href =
        "login.html";

}


// =====================================
// EVENTS
// =====================================

if (
    saveSettingsBtn
) {

    saveSettingsBtn.addEventListener(
        "click",
        saveSettings
    );

}


if (
    resetSettingsBtn
) {

    resetSettingsBtn.addEventListener(
        "click",
        resetSettings
    );

}


if (
    theme
) {

    theme.addEventListener(
        "change",
        () => {

            applyTheme(
                theme.value
            );

        }
    );

}


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (
    logoutBtn
) {

    logoutBtn.addEventListener(
        "click",
        logout
    );

}


// =====================================
// START
// =====================================

loadSettings();