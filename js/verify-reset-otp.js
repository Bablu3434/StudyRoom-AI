const API_URL =
    "http://localhost:5000/api/auth";


const form =
    document.getElementById(
        "resetOtpForm"
    );


const otpInput =
    document.getElementById(
        "resetOtpInput"
    );


const verifyBtn =
    document.getElementById(
        "verifyResetOtpBtn"
    );


const message =
    document.getElementById(
        "resetOtpMessage"
    );


// =====================================
// GET RESET EMAIL
// =====================================

const resetEmail =
    sessionStorage.getItem(
        "studyRoomResetEmail"
    );


if (!resetEmail) {

    message.textContent =
        "Password reset session not found. Please try again.";


    form.style.display =
        "none";


    setTimeout(
        () => {

            window.location.href =
                "forgot-password.html";

        },
        1500
    );

}


// =====================================
// ALLOW ONLY NUMBERS
// =====================================

otpInput.addEventListener(
    "input",
    function () {

        otpInput.value =
            otpInput.value
                .replace(
                    /\D/g,
                    ""
                )
                .slice(
                    0,
                    6
                );

    }
);


// =====================================
// VERIFY RESET OTP
// =====================================

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const otp =
            otpInput
                .value
                .trim();


        if (
            !/^\d{6}$/.test(
                otp
            )
        ) {

            message.textContent =
                "Please enter a valid 6-digit OTP.";

            return;

        }


        verifyBtn.disabled =
            true;


        verifyBtn.textContent =
            "Verifying...";


        message.textContent =
            "Checking OTP...";


        try {

            const response =
                await fetch(
                    `${API_URL}/verify-reset-otp`,
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                email:
                                    resetEmail,

                                otp

                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "OTP verification failed"
                );

            }


            // =====================================
            // SAVE RESET TOKEN TEMPORARILY
            // =====================================

            sessionStorage.setItem(
                "studyRoomResetToken",
                data.resetToken
            );


            sessionStorage.removeItem(
                "studyRoomResetEmail"
            );


            message.textContent =
                "OTP verified successfully. Redirecting...";


            setTimeout(
                () => {

                    window.location.href =
                        "reset-password.html";

                },
                800
            );

        } catch (error) {

            console.error(
                "Reset OTP Verification Error:",
                error
            );


            message.textContent =
                error.message;


            verifyBtn.disabled =
                false;


            verifyBtn.textContent =
                "Verify OTP";

        }

    }
);