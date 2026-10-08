// Check login

const isLoggedIn =
    localStorage.getItem("studyRoomLoggedIn");

if (isLoggedIn !== "true") {

    window.location.href = "login.html";
}


// Get user

const user =
    JSON.parse(
        localStorage.getItem("studyRoomUser")
    );

if (user) {

    const firstName =
        user.name.split(" ")[0];

    document.getElementById(
        "welcomeName"
    ).innerText =
        `Good Morning, ${firstName} 👋`;

    document.getElementById(
        "profileName"
    ).innerText =
        user.name;

    document.getElementById(
        "profileAvatar"
    ).innerText =
        user.name.charAt(0).toUpperCase();
}


// Logout

const logoutBtn =
    document.getElementById("logoutBtn");

logoutBtn.addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "studyRoomLoggedIn"
        );

        window.location.href =
            "login.html";
    }
);



// Study Task -> Focus Timer

document.querySelectorAll(".task-btn").forEach(button => {

    button.addEventListener("click", function () {

        const task = this.closest(".study-task");

        const subject = task.querySelector(
            ".task-info h4"
        ).textContent.trim();

        const duration = parseInt(
            task.querySelector(".duration").textContent,
            10
        ) || 25;

        window.location.href =
            "timer.html?subject=" +
            encodeURIComponent(subject) +
            "&minutes=" + duration;
    });
});


// Main Focus Button -> 25 Minute Timer

document.getElementById("startFocusBtn")
    .addEventListener("click", function () {

        window.location.href = "timer.html";

    });
