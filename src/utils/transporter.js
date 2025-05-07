const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "neerajmore9@gmail",
    pass: "123456",
  },
});

module.exports = transporter;
