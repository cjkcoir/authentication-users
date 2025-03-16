const { text } = require("express");
const nodemailer = require("nodemailer");

const sendEmail = async (option) => {
  // create a transporter

  // Looking to send emails in production? Check out our Email API/SMTP product!
  //   const transport = nodemailer.createTransport({
  //     host: process.env.EMAIL_HOST,
  //     port: process.env.EMAIL_PORT,
  //     auth: {
  //       user: process.env.EMAIL_USER,
  //       pass: process.env.EMAIL_PASSWORD,
  //     },
  //   });

  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "7977d5ee2e5ea7",
      pass: "5ef528204c54ae",
    },
  });

  const emailOptions = {
    from: "Proacademy Chella customer Support j.chellakarthikeyan@gmail.com",
    to: option.email,
    subject: option.subject,
    html: option.message,
    text: option.message,
  };

  await transport.sendMail(emailOptions);
};

module.exports = sendEmail;
