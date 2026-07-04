const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // Email options
  const mailOptions = {
    from: `"Smart Society" <${process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
