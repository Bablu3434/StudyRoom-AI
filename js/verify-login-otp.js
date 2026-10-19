const API_URL =
    "http://localhost:5000/api/auth";


const form =
    document.getElementById(
        "otpForm"
    );


const otpInput =
    document.getElementById(
        "otpInput"
    );


const verifyBtn =
    document.getElementById(
        "verifyOtpBtn"
    );


const message =
    document.getElementById(
        "otpMessage"
    );


// =====================================
// GET LOGIN EMAIL
// =====================================

const loginEmail =
    sessionStorage.getItem(
        "studyRoomOtpEmail"
    );


// Agar email hi nahi mila,
// user ko login page par bhej do.

if (!loginEmail) {

    message.textContent =
        "Login session not found. Please login again.";


    form.style.display =
        "none";


    setTimeout(
        () => {

            window.location.href =
                "login.html";

        },
        1500
    );

}


// =====================================
// ONLY NUMBERS IN OTP INPUT
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
// VERIFY OTP
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
                    `${API_URL}/verify-login-otp`,
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
                                    loginEmail,

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
            // SAVE LOGIN TOKEN
            // =====================================

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


            // OTP email no longer needed

            sessionStorage.removeItem(
                "studyRoomOtpEmail"
            );


            message.textContent =
                "OTP verified successfully. Redirecting...";


            setTimeout(
                () => {

                    window.location.href =
                        "dashboard.html";

                },
                800
            );

        } catch (error) {

            console.error(
                "OTP Verification Error:",
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