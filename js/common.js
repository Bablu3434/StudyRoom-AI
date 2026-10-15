function logoutUser(event) {

    if (event) {

        event.preventDefault();
        event.stopPropagation();

    }

    localStorage.removeItem(
        "studyRoomToken"
    );

    localStorage.removeItem(
        "studyRoomUser"
    );

    window.location.replace(
        "login.html"
    );

}


const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        logoutUser
    );

}