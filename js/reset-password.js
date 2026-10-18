const API_URL =
    "http://localhost:5000/api/auth";


const params =
    new URLSearchParams(
        window.location.search
    );


const token =
    params.get(
        "token"
    );


const form =
    document.getElementById(
        "resetPasswordForm"
    );


const message =
    document.getElementById(
        "resetMessage"
    );


if (!token) {

    message.textContent =
        "Invalid password reset link.";


    form.style.display =
        "none";

}


form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const password =
            document
                .getElementById(
                    "newPassword"
                )
                .value;


        const confirmPassword =
            document
                .getElementById(
                    "confirmNewPassword"
                )
                .value;


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
                        token
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


            message.textContent =
                "Password changed successfully. Redirecting to login...";


            setTimeout(
                () => {

                    window.location.href =
                        "login.html";

                },
                1500
            );

        } catch (error) {

            console.error(
                error
            );


            message.textContent =
                error.message;

        }

    }
);