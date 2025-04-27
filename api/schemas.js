const mongoose = require("mongoose");
const documentSchema = new mongoose.Schema({
  university: String,
  institut: String,
  niveau: {
    type: String,
    enum: ["1er Année", "2eme Année", "3eme Année"],
  },
  Matieres: Array,
  description: Array,
  link: String,
});

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

const universitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
});

const institutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  university: {
    type: String,
    required: true,
  },
});

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

const request1Schema = new mongoose.Schema({
  email: String,
  num: String,
  gmail: String,
  seance: String,
  status: {
    type: String,
    enum: ["accepted", "waiting", "not valid"],
    default: "waiting",
  },
});

const requestbalanceSchema = new mongoose.Schema({
  email: String,
  credits: { type: Number, default: 0 },
  num: String,
  aut: String,
  status: {
    type: String,
    enum: ["accepted", "waiting", "not valid"],
    default: "waiting",
  },
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  num: {
    type: String,
    required: true,
  },
  meet: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  linkdocs: {
    type: String,
    required: true,
  },
});

const matiereSchema = new mongoose.Schema({
  name: String,
  img: String,
});

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  number: String,
  message: String,
});

const PFESchema = new mongoose.Schema({
  titre: String,
  number: String,
  description: String,
  minimum: { type: Number, default: 0 },
  maximum: { type: Number, default: 0 },
  date: {
    type: Date,
    required: true,
  },
  rapport: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["accepted", "waiting", "not valid"],
    default: "waiting",
  },
});

module.exports = {
  Request: mongoose.model("Request", requestSchema),
  Request1: mongoose.model("Request1", request1Schema),
  Request2: mongoose.model("Request2", requestbalanceSchema),
  User: mongoose.model("User", userSchema),
  Document: mongoose.model("documents", documentSchema),
  University: mongoose.model("university", universitySchema),
  Institut: mongoose.model("institut", institutSchema),
  Event: mongoose.model("Event", eventSchema),
  Matiere: mongoose.model("Matiere", matiereSchema),
  Contact: mongoose.model("Contact", contactSchema),
  PFE: mongoose.model("PFE", PFESchema),
};
