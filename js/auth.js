const API_URL =
    "http://localhost:5000/api/auth";


// ================================
// REGISTER
// ================================

const registerForm =
    document.getElementById(
        "registerForm"
    );


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "registerName"
                ).value.trim();


            const email =
                document.getElementById(
                    "registerEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "registerPassword"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            if (
                password !==
                confirmPassword
            ) {

                alert(
                    "Passwords do not match"
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/register`,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    name,
                                    email,
                                    password
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Registration failed"
                    );

                    return;
                }


                localStorage.setItem(
                    "studyRoomToken",
                    data.token
                );


                localStorage.setItem(
                    "studyRoomUser",
                    JSON.stringify(
                        data.user
                    )
                );


                alert(
                    "Account created successfully!"
                );


                window.location.href =
                    "dashboard.html";

            } catch (error) {

                console.error(
                    error
                );


                alert(
                    "Cannot connect to server."
                );

            }

        }
    );

}


// ================================
// LOGIN
// ================================

const loginForm =
    document.getElementById(
        "loginForm"
    );


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            try {

                const response =
                    await fetch(
                        `${API_URL}/login`,
                        {
                            method:
                                "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email,
                                    password
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Login failed"
                    );

                    return;
                }


                localStorage.setItem(
                    "studyRoomToken",
                    data.token
                );


                localStorage.setItem(
                    "studyRoomUser",
                    JSON.stringify(
                        data.user
                    )
                );


                window.location.href =
                    "dashboard.html";

            } catch (error) {

                console.error(
                    error
                );


                alert(
                    "Cannot connect to server."
                );

            }

        }
    );

}