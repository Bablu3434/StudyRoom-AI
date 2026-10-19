const nodemailer =
    require("nodemailer");


const mailUser =
    process.env.MAIL_USER
        ?.trim();


const mailPassword =
    process.env.MAIL_APP_PASSWORD
        ?.replace(/\s/g, "")
        .trim();


const transporter =
    nodemailer.createTransport({

        service:
            "gmail",

        auth: {

            user:
                mailUser,

            pass:
                mailPassword

        }

    });


async function sendEmail({
    to,
    subject,
    html
}) {

    if (
        !mailUser ||
        !mailPassword
    ) {

        throw new Error(
            "MAIL_USER or MAIL_APP_PASSWORD is missing from .env"
        );

    }


    return transporter.sendMail({

        from:
            `"${process.env.MAIL_FROM || "StudyRoom AI"}" <${mailUser}>`,

        to,

        subject,

        html

    });

}


module.exports =
    sendEmail;