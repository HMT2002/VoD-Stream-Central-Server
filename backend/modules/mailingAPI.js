const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  //1. create transporter

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    post: process.env.EMAIL_PORT,
    service: 'gmail',
    // secure: true,

    auth: {
      // type: 'OAuth2',
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
      // clientId: process.env.CLIENT_ID,
      // clientSecret: process.env.CLIENT_SECRET,
    },
    //
  });
  //2. define the email options
  const mailOptions = {
    from: 'Mailing System VideoSharing <blueseamailtest@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  //3. Actually send email

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
