const express = require("express");
const router = express.Router();
const { Contact } = require("./schemas.js");
const nodemailer = require("nodemailer");

router.post("/contact", async (req, res) => {
  try {
    const { name, email, number, message } = req.body;

    const newmessage = new Contact({
      name,
      email,
      number,
      message,
    });

    try {
      // Save message to database
      await newmessage.save();
      
      // Create email transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // Use environment variable
          pass: process.env.EMAIL_PASS // Use environment variable
        }
      });
      
      // Setup email data
      const mailOptions = {
        from: email,
        to: 'jalledomar2001@gmail.com',
        subject: `New Contact Form Submission from ${name}`,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone Number:</strong> ${number}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      };
      
      // Send email
      await transporter.sendMail(mailOptions);
      
      // Redirect back to contact page with success message
      res.redirect('/contact?success=true');
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send({ message: "Error processing your request", error });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send({ message: "Internal server error", error });
  }
});

router.delete("/api/contact_messages/:id", async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

module.exports = router;
