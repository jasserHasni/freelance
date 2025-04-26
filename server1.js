require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const multer = require("multer");
const cors = require("cors");
const methodOverride = require("method-override");
const crypto = require("crypto");
const app = express();
const PORT = 80;

const { Request, User, Contact } = require("./api/schemas.js");

const mongoDB = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWD}@tunacademy.ctcx2.mongodb.net/`;

mongoose
  .connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"));

function checkUser(req, res, next) {
  if (req.cookies.userData) {
    res.locals.loggedIn = true;
    res.locals.userData = req.cookies.userData;
  } else {
    res.locals.loggedIn = false;
  }
  next();
}

app.use(checkUser);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`The server is running on http://localhost:${PORT}`);
});
