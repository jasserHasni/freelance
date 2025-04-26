const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const { Request, User } = require("./schemas.js");

router.get("/logout", (req, res) => {
  res.clearCookie("userData");
  res.redirect("/");
});

module.exports = router;
