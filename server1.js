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

const {
  Request,
  Request1,
  Request2,
  User,
  Document,
  Institut,
  Event,
  Matiere,
  Contact,
} = require("./api/schemas.js");

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

const router = require("./api/routes.js");
app.use("/", router);

const router_requests = require("./api/check_requests.js");
app.use("/", router_requests);

const router_events = require("./api/events.js");
app.use("/", router_events);

const documents_info = require("./api/documents.js");
app.use("/", documents_info);

const instituts_info = require("./api/institut.js");
app.use("/", instituts_info);

const client_post = require("./api/client_post.js");
app.use("/", client_post);

const admin = require("./api/only_admin.js");
app.use("/", admin);

const matiere = require("./api/matieres.js");
app.use("/", matiere);

const Contact1 = require("./api/contact.js");
app.use("/", Contact1);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`The server is running on http://localhost:${PORT}`);
});
