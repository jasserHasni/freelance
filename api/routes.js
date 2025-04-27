const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const {
  Request,
  Request1,
  Request2,
  User,
  Document,
  Institut,
  Event,
} = require("./schemas.js");

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/about", (req, res) => {
  res.render("about");
});

router.get("/contact", (req, res) => {
  const success = req.query.success === "true";
  res.render("contact", { success });
});

router.get("/reaserch", (req, res) => {
  res.render("reaserch");
});

router.get("/pfe", (req, res) => {
  res.render("pfe");
});

router.get("/courses", (req, res) => {
  res.render("courses");
});

router.get("/login", (req, res) => {
  res.render("login", { wrong_pass: false });
});

router.get("/register", (req, res) => {
  res.render("register", { wrong_pass: false, wrong_mail: false });
});
router.get("/cards", (req, res) => {
  const userData = req.cookies.userData
    ? JSON.parse(req.cookies.userData)
    : null;

  if (!userData) {
    return res.redirect("/login");
  }
  res.render("cards");
});
router.get("/calendar", (req, res) => {
  const userData = req.cookies.userData
    ? JSON.parse(req.cookies.userData)
    : null;

  if (!userData) {
    return res.redirect("/login");
  }
  res.render("calendar");
});

router.get("/profile", async (req, res) => {
  try {
    const userData = req.cookies.userData;
    if (!userData) {
      res.redirect("/login");
      return;
    }

    const { email } = JSON.parse(userData);
    const user = await User.findOne({ email });
    if (!user) {
      res.redirect("/login");
    }

    // Check for success parameter in query string
    const success = req.query.success === "true";

    // Render the profile page with user data and success parameter
    res.render("profile", { user, success });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/profile-pay", async (req, res) => {
  try {
    const userData = req.cookies.userData;
    if (!userData) {
      res.redirect("/login");
      return;
    }

    const { email } = JSON.parse(userData);
    const user = await Request2.findOne({ email, status: "waiting" });
    if (user) {
      res.redirect("/profile");
    }
    res.render("profile-pay", {
      wrong_montant: false,
      wrong_champ: false,
      wrong_number: false,
      wrong_auto: false,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("userData");
  res.redirect("/");
});

module.exports = router;
