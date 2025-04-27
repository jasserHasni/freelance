const express = require("express");
const router = express.Router();
const {
  Request,
  Request1,
  User,
  Document,
  University,
  Institut,
  Event,
} = require("./schemas.js");

router.get("/universities", async (req, res) => {
  try {
    const universities = await University.find().select("name");
    res.json(universities);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch universities" });
  }
});

router.get("/institutes/:universityName", async (req, res) => {
  try {
    const { universityName } = req.params;
    const institutes = await Institut.find({
      university: universityName,
    }).select("name");
    res.json(institutes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch institutes" });
  }
});

module.exports = router;
