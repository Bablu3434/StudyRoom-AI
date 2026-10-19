require("dotenv").config();

const sendEmail =
    require("./utils/sendEmail");


async function testEmail() {

    try {

        await sendEmail({

            to:
                process.env.MAIL_USER,

            subject:
                "StudyRoom AI Email Test",

            html: `
                <h2>StudyRoom AI</h2>

                <p>
                    Email system is working successfully.
                </p>

                <p>
                    OTP emails can now be sent.
                </p>
            `

        });


        console.log(
            "✅ Test email sent successfully"
        );

    } catch (error) {

        console.error(
            "❌ Email Test Error:",
            error.message
        );

    }

}


testEmail();