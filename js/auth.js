const API_URL =
    "http://localhost:5000/api/auth";


// =====================================
// PASSWORD SHOW / HIDE
// =====================================

function setupPasswordToggle(
    inputId,
    buttonId
) {

    const input =
        document.getElementById(
            inputId
        );


    const button =
        document.getElementById(
            buttonId
        );


    if (
        !input ||
        !button
    ) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            if (
                input.type ===
                "password"
            ) {

                input.type =
                    "text";

                button.textContent =
                    "Hide";

            } else {

                input.type =
                    "password";

                button.textContent =
                    "Show";

            }

        }
    );

}


// Login password
setupPasswordToggle(
    "loginPassword",
    "toggleLoginPassword"
);


// Register password
setupPasswordToggle(
    "registerPassword",
    "toggleRegisterPassword"
);


// Confirm password
setupPasswordToggle(
    "confirmPassword",
    "toggleConfirmPassword"
);


// =====================================
// REGISTER
// =====================================

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


                // Registration currently
                // logs user in directly.

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
                    "Registration Error:",
                    error
                );


                alert(
                    "Cannot connect to server."
                );

            }

        }
    );

}


// =====================================
// LOGIN
// =====================================

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


            if (
                !email ||
                !password
            ) {

                alert(
                    "Please enter email and password."
                );

                return;

            }


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


                // =====================================
                // OTP REQUIRED
                // =====================================

                if (
                    data.otpRequired === true
                ) {

                    // Remove any old login session

                    localStorage.removeItem(
                        "studyRoomToken"
                    );


                    localStorage.removeItem(
                        "studyRoomUser"
                    );


                    // Save email temporarily
                    // for OTP verification page

                    sessionStorage.setItem(
                        "studyRoomOtpEmail",
                        data.email || email
                    );


                    // Go to OTP page

                    window.location.href =
                        "verify-login-otp.html";


                    return;

                }


                // =====================================
                // FALLBACK DIRECT LOGIN
                // =====================================

                // This is kept only for compatibility
                // if backend ever returns a JWT directly.

                if (
                    data.token &&
                    data.user
                ) {

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


                    return;

                }


                alert(
                    "Unexpected login response."
                );

            } catch (error) {

                console.error(
                    "Login Error:",
                    error
                );


                alert(
                    "Cannot connect to server."
                );

            }

        }
    );

}