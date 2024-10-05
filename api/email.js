const nodemailer = require('nodemailer');
const { getEmailHtml } = require('../utils/emailTemplate');
const Bottleneck = require('bottleneck');

// Create a reusable transporter instance
const transporter = nodemailer.createTransport({
  host: 'mail.tagumcitynhs.ph',
  port: 465,
  secure: true,
  auth: {
    user: 'no-reply@tagumcitynhs.ph',
    pass: '(w3Z0W9@,$+o',
  },
});

// Create a rate limiter
const limiter = new Bottleneck({
  minTime: 1000, // Minimum time between requests (1 second)
  maxConcurrent: 1, // Maximum number of concurrent requests
});

const sendEmailNotification = async (student, lrn, timestamp, type) => {
  if (!student.email) {
    console.error(`Student with LRN ${lrn} does not have an email assigned. Skipping email notification.`);
    return 'No email assigned';
  }

  const fullName = `${student.fname} ${student.lname}`;
  const emailHtml = getEmailHtml(fullName, lrn, timestamp, type);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: student.email,
    subject: 'Student Scan Notification',
    html: emailHtml,
  };

  try {
    await limiter.schedule(() => transporter.sendMail(mailOptions));
    console.log('Email sent successfully to:', student.email);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; 
  }
};

module.exports = {
  sendEmailNotification,
};
