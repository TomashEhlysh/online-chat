const nodemailer = require("nodemailer");
require("dotenv").config;

const sendMail = async (toEmail, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: {
      name: "Bot from Chicago",
      address: process.env.MAIL_USER,
    },
    to: toEmail,
    subject: subject,
    html: htmlContent,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log(err);
  }
};
module.exports = sendMail; // Експортуємо функцію sendMail
