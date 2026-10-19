// =====================================
// STUDYROOM AI NOTIFICATIONS
// =====================================


// Check whether browser supports notifications
function notificationsSupported() {

    return (
        "Notification" in window
    );

}


// =====================================
// REQUEST PERMISSION
// =====================================

async function requestNotificationPermission() {

    if (
        !notificationsSupported()
    ) {

        console.warn(
            "Notifications are not supported in this browser."
        );

        return false;

    }


    if (
        Notification.permission ===
        "granted"
    ) {

        return true;

    }


    if (
        Notification.permission ===
        "denied"
    ) {

        console.warn(
            "Notification permission has been denied."
        );

        return false;

    }


    const permission =
        await Notification.requestPermission();


    return (
        permission ===
        "granted"
    );

}


// =====================================
// SHOW NOTIFICATION
// =====================================

function showStudyNotification(
    title,
    message
) {

    if (
        !notificationsSupported()
    ) {

        return;

    }


    if (
        Notification.permission !==
        "granted"
    ) {

        return;

    }


    new Notification(
        title,
        {

            body:
                message,

            icon:
                "favicon.ico"

        }
    );

}


// =====================================
// TEST NOTIFICATION
// =====================================

async function testStudyNotification() {

    const allowed =
        await requestNotificationPermission();


    if (!allowed) {

        return;

    }


    showStudyNotification(
        "StudyRoom AI",
        "Study reminder notifications are enabled."
    );

}


// =====================================
// EXPORT TO WINDOW
// =====================================

window.requestNotificationPermission =
    requestNotificationPermission;


window.showStudyNotification =
    showStudyNotification;


window.testStudyNotification =
    testStudyNotification;