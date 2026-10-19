const REMINDER_TASK_API =
    "http://localhost:5000/api/tasks";


const reminderToken =
    localStorage.getItem(
        "studyRoomToken"
    );


let reminderTasks = [];


// =====================================
// GET SETTINGS
// =====================================

function getReminderSettings() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "studyRoomSettings"
            )
        ) || {};

    } catch (error) {

        console.error(
            "Reminder Settings Error:",
            error
        );

        return {};

    }

}


// =====================================
// LOAD TASKS
// =====================================

async function loadReminderTasks() {

    if (!reminderToken) {

        return;

    }


    try {

        const response =
            await fetch(
                REMINDER_TASK_API,
                {
                    headers: {

                        Authorization:
                            `Bearer ${reminderToken}`

                    }
                }
            );


        if (!response.ok) {

            return;

        }


        const data =
            await response.json();


        reminderTasks =
            Array.isArray(
                data.tasks
            )
                ? data.tasks
                : [];


        checkGlobalReminders();

    } catch (error) {

        console.error(
            "Reminder Task Load Error:",
            error
        );

    }

}


// =====================================
// TASK DATE + TIME
// =====================================

function getReminderDate(task) {

    if (
        !task.studyDate ||
        !task.studyTime
    ) {

        return null;

    }


    const date =
        new Date(
            `${task.studyDate}T${task.studyTime}:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


// =====================================
// STORAGE KEY
// =====================================

function getReminderStorageKey(
    task,
    type
) {

    return (
        "studyRoomReminder_" +
        task._id +
        "_" +
        task.studyDate +
        "_" +
        task.studyTime +
        "_" +
        type
    );

}


// =====================================
// CHECK IF SENT
// =====================================

function wasReminderSent(
    task,
    type
) {

    return (
        localStorage.getItem(
            getReminderStorageKey(
                task,
                type
            )
        )
        ===
        "true"
    );

}


// =====================================
// MARK SENT
// =====================================

function markGlobalReminderSent(
    task,
    type
) {

    localStorage.setItem(
        getReminderStorageKey(
            task,
            type
        ),
        "true"
    );

}


// =====================================
// SHOW REMINDER
// =====================================

function showTaskReminder(
    task,
    type
) {

    if (
        typeof showStudyNotification !==
        "function"
    ) {

        return;

    }


    if (
        type === "before"
    ) {

        showStudyNotification(

            "StudyRoom AI Reminder",

            `${task.subject} - ${task.topic} starts in 10 minutes.`

        );

        return;

    }


    showStudyNotification(

        "Study Session Starting",

        `${task.subject} - ${task.topic} is starting now.`

    );

}


// =====================================
// CHECK REMINDERS
// =====================================

function checkGlobalReminders() {

    const settings =
        getReminderSettings();


    if (
        settings.studyReminders !==
        true
    ) {

        return;

    }


    if (
        !("Notification" in window)
    ) {

        return;

    }


    if (
        Notification.permission !==
        "granted"
    ) {

        return;

    }


    const now =
        new Date();


    reminderTasks.forEach(
        task => {

            if (
                task.completed
            ) {

                return;

            }


            const taskDate =
                getReminderDate(
                    task
                );


            if (!taskDate) {

                return;

            }


            const difference =
                taskDate.getTime() -
                now.getTime();


            const TEN_MINUTES =
                10 * 60 * 1000;


            const NINE_MINUTES =
                9 * 60 * 1000;


            const ONE_MINUTE =
                60 * 1000;


            // 10 MINUTES BEFORE

            if (
                difference <= TEN_MINUTES &&
                difference > NINE_MINUTES &&
                !wasReminderSent(
                    task,
                    "before"
                )
            ) {

                showTaskReminder(
                    task,
                    "before"
                );


                markGlobalReminderSent(
                    task,
                    "before"
                );

            }


            // START TIME

            if (
                difference <= 0 &&
                difference > -ONE_MINUTE &&
                !wasReminderSent(
                    task,
                    "start"
                )
            ) {

                showTaskReminder(
                    task,
                    "start"
                );


                markGlobalReminderSent(
                    task,
                    "start"
                );

            }

        }
    );

}


// =====================================
// START GLOBAL REMINDER SYSTEM
// =====================================

function startGlobalReminders() {

    loadReminderTasks();


    setInterval(
        () => {

            loadReminderTasks();

        },
        30000
    );

}


startGlobalReminders();