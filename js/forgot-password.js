const API_URL =
    "http://localhost:5000/api/auth";


const form =
    document.getElementById(
        "forgotPasswordForm"
    );


const message =
    document.getElementById(
        "forgotMessage"
    );


if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const emailInput =
                document.getElementById(
                    "forgotEmail"
                );


            const email =
                emailInput
                    .value
                    .trim();


            if (!email) {

                message.textContent =
                    "Please enter your email.";

                return;

            }


            message.textContent =
                "Sending OTP...";


            try {

                const response =
                    await fetch(
                        `${API_URL}/forgot-password`,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({
                                    email
                                })

                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Forgot Password Response:",
                    data
                );


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Could not send OTP"
                    );

                }


                // =====================================
                // OTP SENT
                // =====================================

                if (
                    data.otpRequired === true
                ) {

                    sessionStorage.setItem(
                        "studyRoomResetEmail",
                        data.email || email
                    );


                    message.textContent =
                        "OTP sent successfully.";


                    window.location.href =
                        "verify-reset-otp.html";


                    return;

                }


                message.textContent =
                    data.message ||
                    "Unable to continue.";

            } catch (error) {

                console.error(
                    "Forgot Password Error:",
                    error
                );


                message.textContent =
                    error.message;

            }

        }
    );

}