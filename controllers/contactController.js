// contactController.js
const Contact = require('../model/contactUs');
const nodemailer = require('nodemailer');

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "ahmadkamran710788@gmail.com",
      pass: "bglt jqfu yupr faha"
    },
    secure: true,  // Use TLS
    tls: {
      rejectUnauthorized: false  // Avoid issues with SSL/TLS certificate validation
    }
  });

// Single controller function to handle both tasks
exports.handleContactSubmission = async (req, res) => {
  console.log("this api is working")
  try {
    const { name, email, phoneNumber, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide name, email and message'
      });
    }

    // 1. Create new contact entry in database
    const newContact = await Contact.create({
      name,
      email,
      phoneNumber,
      message
    });

    // 2. Send email notification
    const mailOptions = {
      from: `"Contact Form" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phoneNumber || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    // 3. Return success response
    res.status(201).json({
      status: 'success',
      message: 'Your message has been received. We will contact you soon.',
      data: {
        contact: newContact
      }
    });
  } catch (err) {
    console.error('Contact submission error:', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to process your request. Please try again later.'
    });
  }
};