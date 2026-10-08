// Password visibility

const loginToggle =
    document.getElementById("toggleLoginPassword");

if (loginToggle) {

    loginToggle.addEventListener("click", function () {

        const password =
            document.getElementById("loginPassword");

        if (password.type === "password") {

            password.type = "text";

            this.innerText = "Hide";

        } else {

            password.type = "password";

            this.innerText = "Show";
        }

    });
}


const registerToggle =
    document.getElementById("toggleRegisterPassword");

if (registerToggle) {

    registerToggle.addEventListener("click", function () {

        const password =
            document.getElementById("registerPassword");

        if (password.type === "password") {

            password.type = "text";

            this.innerText = "Hide";

        } else {

            password.type = "password";

            this.innerText = "Show";
        }

    });
}


// Register Demo

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", function(e) {

        e.preventDefault();

        const name =
            document.getElementById("registerName").value;

        const email =
            document.getElementById("registerEmail").value;

        const password =
            document.getElementById("registerPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        if (password !== confirmPassword) {

            alert("Passwords do not match.");

            return;
        }


        const user = {
            name: name,
            email: email,
            password: password
        };


        localStorage.setItem(
            "studyRoomUser",
            JSON.stringify(user)
        );


        alert("Account created successfully!");

        window.location.href =
            "login.html";

    });
}


// Login Demo

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(e) {

        e.preventDefault();


        const email =
            document.getElementById("loginEmail").value;

        const password =
            document.getElementById("loginPassword").value;


        const storedUser =
            JSON.parse(
                localStorage.getItem("studyRoomUser")
            );


        if (!storedUser) {

            alert(
                "No account found. Please register first."
            );

            return;
        }


        if (
            email === storedUser.email &&
            password === storedUser.password
        ) {

            localStorage.setItem(
                "studyRoomLoggedIn",
                "true"
            );

            alert("Login successful!");

            window.location.href =
                "dashboard.html";

        } else {

            alert(
                "Incorrect email or password."
            );

        }

    });

}