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


const resetLinkBox =
    document.getElementById(
        "resetLinkBox"
    );


const resetLink =
    document.getElementById(
        "resetLink"
    );


form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document
                .getElementById(
                    "forgotEmail"
                )
                .value
                .trim();


        message.textContent =
            "Creating reset link...";


        resetLinkBox.style.display =
            "none";


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


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Request failed"
                );

            }


            message.textContent =
                data.message;


            if (
                data.resetUrl
            ) {

                resetLink.href =
                    data.resetUrl;


                resetLinkBox.style.display =
                    "block";

            }

        } catch (error) {

            console.error(
                error
            );


            message.textContent =
                error.message;

        }

    }
);