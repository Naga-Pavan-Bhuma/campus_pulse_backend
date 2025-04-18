const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_MAIL, // Your Gmail ID
      pass: process.env.APP_PASSWORD, // Your Gmail App Password
    },
  });

  const mailOptions = {
    from: process.env.APP_MAIL,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTP };