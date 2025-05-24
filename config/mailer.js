const nodemailer = require('nodemailer');

const sendMail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        text,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
