(function () {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop() || "dashboard.html";


    const sidebar =
        document.createElement(
            "aside"
        );


    sidebar.className =
        "app-sidebar";


    sidebar.innerHTML = `

        <div class="sidebar-brand">

            <div class="sidebar-logo">
                AI
            </div>

            <span>
                StudyRoom
            </span>

        </div>


        <nav class="sidebar-nav">

            <a
                href="dashboard.html"
                data-page="dashboard.html"
            >
                🏠
                <span>Dashboard</span>
            </a>


            <a
                href="subjects.html"
                data-page="subjects.html"
            >
                📚
                <span>Subjects</span>
            </a>


            <a
                href="planner.html"
                data-page="planner.html"
            >
                🗓️
                <span>Study Planner</span>
            </a>


            <a
                href="timer.html"
                data-page="timer.html"
            >
                ⏱️
                <span>Focus Timer</span>
            </a>


            <a
                href="notes.html"
                data-page="notes.html"
            >
                📝
                <span>Notes</span>
            </a>


            <a
                href="quiz.html"
                data-page="quiz.html"
            >
                🧠
                <span>Quiz</span>
            </a>


            <a
                href="progress.html"
                data-page="progress.html"
            >
                📊
                <span>Progress</span>
            </a>


            <a
                href="weak-topics.html"
                data-page="weak-topics.html"
            >
                🎯
                <span>Weak Topics</span>
            </a>


            <a
                href="ai.html"
                data-page="ai.html"
            >
                🤖
                <span>AI Assistant</span>
            </a>


            <a
                href="profile.html"
                data-page="profile.html"
            >
                👤
                <span>Profile</span>
            </a>

        </nav>


        <div class="sidebar-bottom">

            <a
                href="settings.html"
                data-page="settings.html"
            >
                ⚙️
                <span>Settings</span>
            </a>


            <button
                type="button"
                id="globalLogoutBtn"
            >
                🚪
                <span>Logout</span>
            </button>

        </div>

    `;


    document.body.prepend(
        sidebar
    );


    document.body.classList.add(
        "has-app-sidebar"
    );


    // =====================================
    // ACTIVE PAGE
    // =====================================

    const links =
        sidebar.querySelectorAll(
            "[data-page]"
        );


    links.forEach(
        link => {

            if (
                link.dataset.page ===
                currentPage
            ) {

                link.classList.add(
                    "active"
                );

            }

        }
    );


    // =====================================
    // LOGOUT
    // =====================================

    const logoutBtn =
        document.getElementById(
            "globalLogoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            function () {

                localStorage.removeItem(
                    "studyRoomToken"
                );

                localStorage.removeItem(
                    "studyRoomUser"
                );

                sessionStorage.clear();


                window.location.href =
                    "login.html";

            }
        );

    }

})();