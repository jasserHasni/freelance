const express = require("express");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");
const crypto = require("crypto");
const router = express.Router();

const {
  Request,
  Request1,
  Request2,
  User,
  Document,
  Institut,
  Event,
  PFE,
} = require("./schemas.js");

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

router.post("/cards", async (req, res) => {
  const { option2, option3, num, gmail } = req.body;

  const userData = req.cookies.userData;

  // Check if user is authenticated
  if (!userData) {
    return res.redirect("/login");
  }

  const { email } = JSON.parse(userData);

  try {
    // Find the user in the database
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.redirect("/login");
    }
    const req = await Request.findOne({ email, status: "waiting" }).select(
      "email"
    );
    const req1 = await Request.findOne({
      email,
      status: "accepted",
      option2: option2,
      option3: option3,
    }).select("email");
    if (req) {
      return res
        .status(400)
        .send("Déja Payé,Votre demande est en cours de traitement.");
    }
    if (req1) {
      return res.status(400).send("Déja Payé.");
    }
    // Check if user has enough balance
    if (user.balance < 30) {
      return res
        .status(400)
        .send("Solde insuffisant, veuillez recharger votre compte.");
    }
    user.balance -= 30;
    await user.save();
    const newCard = new Request({
      email,
      option2,
      option3,
      num,
      gmail,
    });
    await newCard.save();
    res.status(200).send("Demande enregistrée avec succès");
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).send("An error occurred. Please try again later.");
  }
});

router.post("/calendar", async (req, res) => {
  const { num, gmail, seance } = req.body;
  const userData = req.cookies.userData;

  if (!userData) {
    return res.redirect("/login");
  }

  const { email } = JSON.parse(userData);

  try {
    // Find the user in the database
    const user = await User.findOne({ email });
    if (!user) {
      return res.redirect("/login");
    }
    const req = await Request1.findOne({
      email,
      seance,
      status: "waiting",
    }).select("email");
    const req1 = await Request1.findOne({
      email,
      status: "accepted",
      seance: seance,
    }).select("email");
    if (req) {
      return res
        .status(400)
        .send("Déja Payé ,Votre demande est en cours de traitement.");
    }
    if (req1) {
      return res.status(400).send("Déja Payé.");
    }
    // Check if user has enough balance
    if (user.balance < 25) {
      return res
        .status(400)
        .send("Solde insuffisant, veuillez recharger votre compte.");
    }
    user.balance -= 25;
    await user.save();
    const newCard = new Request1({
      email,
      num,
      gmail,
      seance,
    });
    await newCard.save();
    res.status(200).send("Demande enregistrée avec succès");
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).send("An error occurred. Please try again later.");
  }
});

router.post("/PFE", async (req, res) => {
  const { titre, number, description, minimum, maximum, date, rapport } =
    req.body;
  try {
    const existingRequest = await PFE.findOne({
      number,
      status: "waiting",
    }).select("number");
    if (existingRequest) {
      return res.status(400).json({
        message:
          "Une demande est déjà en cours de traitement. Nous vous recontacterons dans les plus brefs délais.",
      });
    }

    const newPFE = new PFE({
      titre,
      number,
      description,
      minimum,
      maximum,
      date,
      rapport,
    });

    await newPFE.save();
    res.status(200).json({ message: "Demande enregistrée avec succès" });
  } catch (err) {
    console.error("Error saving data:", err);
    res.status(500).json({
      message: "Une erreur s'est produite. Veuillez remplir tous les details.",
    });
  }
});

// *************************************************
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

// ***************************************************

router.post("/profile", async (req, res) => {
  try {
    const userData = req.cookies.userData;
    if (!userData) {
      return res.redirect("/login");
    }

    const { email } = JSON.parse(userData); // Extract email from cookie data
    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required for this action" });
    }
    const { name, number, niveau, street, city, state, zip } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { email }, // Find by email
      { name, number, niveau, street, city, state, zip }, // Update fields
      { new: true } // Return updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Redirect to profile with success parameter
    res.redirect("/profile?success=true");
  } catch (error) {
    console.error("Error handling profile request:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/profile-pay", async (req, res) => {
  try {
    const userData = req.cookies.userData;
    if (!userData) {
      return res.redirect("/login");
    }
    const { email } = JSON.parse(userData);
    const req1 = await Request2.findOne({ email, status: "waiting" }).select(
      "email"
    );
    if (req1) {
      return res
        .status(400)
        .send("Déja Payé,Votre demande est en cours de traitement.");
    }

    const { credits, num, aut } = req.body;
    if (!credits || !num || !aut) {
      return res.render("profile-pay", {
        wrong_montant: false,
        wrong_champ: true,
        wrong_number: false,
        wrong_auto: false,
      });
    }

    if (!/^(?:[2-9]\d(\.\d+)?|[1-9]\d{2,}(\.\d+)?)$/.test(credits)) {
      return res.render("profile-pay", {
        wrong_montant: true,
        wrong_champ: false,
        wrong_number: false,
        wrong_auto: false,
      });
    }

    if (!/^(\+216)?[2-9][0-9]{7}$/.test(num)) {
      return res.render("profile-pay", {
        wrong_montant: false,
        wrong_champ: false,
        wrong_number: true,
        wrong_auto: false,
      });
    }

    if (!/^\d{6}$/.test(aut)) {
      return res.render("profile-pay", {
        wrong_montant: false,
        wrong_champ: false,
        wrong_number: false,
        wrong_auto: true,
      });
    }
    const newCard = new Request2({
      email,
      credits,
      num,
      aut,
    });
    await newCard.save();
    res.redirect("/profile");
  } catch (error) {
    console.error("Error handling profile request:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
