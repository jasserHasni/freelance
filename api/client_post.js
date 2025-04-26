const express = require("express");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");
const crypto = require("crypto");
const router = express.Router();

const { Request, User } = require("./schemas.js");

// ------------------------------- //
// Register and login routes
// ------------------------------- //

router.post("/register", async (req, res) => {
  const { name, email, number, password, password1, niveau } = req.body;
  const user = await User.findOne({ email: email }).select("email");
  if (user) {
    return res.render("register", { wrong_mail: true, wrong_pass: false });
  }

  if (password !== password1) {
    return res.render("register", { wrong_pass: true, wrong_mail: false });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      number,
      password: hashedPassword,
      niveau,
    });

    await newUser.save();
    res.redirect("/login");
  } catch (error) {
    return res.render("register", { wrong_mail: true, wrong_pass: false });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (user) {
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        res.cookie("userData", JSON.stringify(user), {
          maxAge: 3 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: false,
          sameSite: "strict",
        });
        res.redirect("/");
      } else {
        return res.render("login", { wrong_pass: true });
      }
    } else {
      return res.render("login", { wrong_pass: true });
    }
  } catch (error) {
    return res.render("login", { wrong_pass: true });
  }
});

router.get("/password-reset", (req, res) => {
  res.render("forgetpassword", {
    message: false,
    message2: false,
    message3: false,
  }); // Initialize message as an empty string
});

// Handle password reset form submission
router.post("/password-reset", async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("forgetpassword", {
        message: true,
        message2: false,
        message3: false,
      });
    }

    // Generate a token and expiration time (e.g., 1 hour)
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 900000; // 15 minute
    await user.save();

    // Send email with the reset link
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `http://${req.headers.host}/password-reset/${token}`;
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background-color: #007bff;
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .email-body {
      padding: 30px;
    }
    .email-body p {
      margin-bottom: 20px;
      font-size: 16px;
    }
    .reset-button {
      display: inline-block;
      background-color: #007bff;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .reset-button:hover {
      background-color: #0056b3;
    }
    .reset-link {
      word-break: break-all;
      color: #007bff;
      margin-top: 15px;
      display: inline-block;
    }
    .email-footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      color: #777;
      font-size: 14px;
    }
    .email-footer p {
      margin: 5px 0;
    }
    .warning {
      background-color: #fff8e1;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="https://i.ibb.co/JjNQ5JDD/logo.png" alt="TunAcademy Logo" style="max-width: 150px; margin-bottom: 15px;">
      <h1>Password Reset Request</h1>
    </div>
    <div class="email-body">
      <p>Hello,</p>
      <p>We received a request to reset your password for your E-learning account. If you didn't make this request, you can safely ignore this email.</p>
      <p>To reset your password, click the button below:</p>
      
      <a href="${resetLink}" class="reset-button" style="color: #ffffff !important; display: inline-block; background-color: #007bff; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-weight: 600; font-size: 16px; margin: 20px 0; text-align: center;">Reset My Password</a>
      
      <p>This link will expire in 15 minutes for your security.</p>
      
      <div class="warning">
        <strong>Note:</strong> If the button above doesn't work, copy and paste the following link into your browser:
        <a href="${resetLink}" class="reset-link">${resetLink}</a>
      </div>
      
      <p>If you didn't request a password reset, please contact our support team immediately.</p>
      
      <p>Thank you,<br>The TunAcademy Team</p>
    </div>
    <div class="email-footer">
      <p>&copy; ${new Date().getFullYear()} TunAcademy. All rights reserved.</p>
      <p>This is an automated email, please do not reply.</p>
    </div>
  </div>
</body>
</html>
      `,
      text: `Reset your password by visiting this link: ${resetLink}`, // Plain text fallback
    };

    await transporter.sendMail(mailOptions);
    res.render("forgetpassword", {
      message2: true,
      message: false,
      message3: false,
    });
  } catch (error) {
    console.error(error);
    res.render("forgetpassword", {
      message3: true,
      message: false,
      message2: false,
    });
  }
});

// Render reset password form for the token
router.get("/password-reset/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.send("Password reset token is invalid or has expired.");
    }

    // Render reset password form
    res.render("resetpassword", { token: req.params.token, message: false });
  } catch (error) {
    console.error(error);
    res.send("An error occurred. Please try again later.");
  }
});

// Handle password reset form submission
router.post("/password-reset/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.send("Password reset token is invalid or has expired.");
    }

    const { password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.render("resetpassword", {
        token: req.params.token,
        message: true,
      });
    }

    // Hash the new password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.send("An error occurred. Please try again later.");
  }
});

module.exports = router;
