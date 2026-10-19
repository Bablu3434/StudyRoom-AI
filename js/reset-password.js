const API_URL =
    "http://localhost:5000/api/auth";


// =====================================
// ELEMENTS
// =====================================

const form =
    document.getElementById(
        "resetPasswordForm"
    );


const message =
    document.getElementById(
        "resetMessage"
    );


const passwordInput =
    document.getElementById(
        "newPassword"
    );


const confirmPasswordInput =
    document.getElementById(
        "confirmNewPassword"
    );


// =====================================
// GET RESET TOKEN
// =====================================

// New OTP flow
let resetToken =
    sessionStorage.getItem(
        "studyRoomResetToken"
    );


// Old URL flow support
if (!resetToken) {

    const params =
        new URLSearchParams(
            window.location.search
        );


    resetToken =
        params.get(
            "token"
        );

}


// =====================================
// INVALID RESET SESSION
// =====================================

if (!resetToken) {

    message.textContent =
        "Invalid or expired password reset session.";


    if (form) {

        form.style.display =
            "none";

    }

}


// =====================================
// RESET PASSWORD
// =====================================

if (
    form &&
    resetToken
) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const password =
                passwordInput.value;


            const confirmPassword =
                confirmPasswordInput.value;


            // =====================================
            // VALIDATION
            // =====================================

            if (
                password.length < 6
            ) {

                message.textContent =
                    "Password must be at least 6 characters.";

                return;

            }


            if (
                password !==
                confirmPassword
            ) {

                message.textContent =
                    "Passwords do not match.";

                return;

            }


            message.textContent =
                "Resetting password...";


            try {

                const response =
                    await fetch(
                        `${API_URL}/reset-password/${encodeURIComponent(
                            resetToken
                        )}`,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    password,

                                    confirmPassword

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Password reset failed"
                    );

                }


                // =====================================
                // CLEAR RESET SESSION
                // =====================================

                sessionStorage.removeItem(
                    "studyRoomResetToken"
                );


                sessionStorage.removeItem(
                    "studyRoomResetEmail"
                );


                message.textContent =
                    "Password changed successfully. Redirecting to login...";


                form.style.display =
                    "none";


                setTimeout(
                    () => {

                        window.location.href =
                            "login.html";

                    },
                    1500
                );

            } catch (error) {

                console.error(
                    "Reset Password Error:",
                    error
                );


                message.textContent =
                    error.message;

            }

        }
    );

}