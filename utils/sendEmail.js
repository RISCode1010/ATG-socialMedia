const nodemailer = require("nodemailer");


const sendEmail = async (val) => {
    const transporter = nodemailer.createTransport({
        host: process.env.HOST,
        service: 'gmail',
        port: "587",
        authentication: 'plain',
        secure: false,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
        connectionTimeout: 5 * 60 * 1000
    })

    await new Promise((resolve, reject) => {
        // verify connection configuration
        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                console.log("Server is ready to take our messages");
                resolve(success);
            }
        });
    });

    const mail = {
        from: process.env.EMAIL_FROM,
        to: val.to,
        subject: val.subject,
        html: val.text
    };
    await new Promise((resolve, reject) => {
        // send mail
        transporter.sendMail(mail, (err, info) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.log(info);
                resolve(info);
            }
        });
    });
}

module.exports = sendEmail;