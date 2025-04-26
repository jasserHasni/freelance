const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    number: String,
    password: String,
    niveau: String,
    balance: { type: Number, default: 0 },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { strict: false }
);

const requestSchema = new mongoose.Schema({
  email: String,
  option2: String,
  option3: String,
  num: String,
  gmail: String,
  status: {
    type: String,
    enum: ["accepted", "waiting", "not valid"],
    default: "waiting",
  },
});

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  number: String,
  message: String,
});

module.exports = {
  Request: mongoose.model("Request", requestSchema),
  User: mongoose.model("User", userSchema),
  Contact: mongoose.model("Contact", contactSchema),
};
