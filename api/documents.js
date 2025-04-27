const express = require("express");
const router = express.Router();

const {
  Request,
  Request1,
  User,
  Document,
  Institut,
  Event,
} = require("./schemas.js");

router.get("/api/matieres_name", async (req, res) => {
  try {
    const { option2, option3 } = req.query;
    const document = await Document.findOne(
      { institut: option2, niveau: option3 },
      "Matieres"
    );
    if (!document) {
      return res.status(404).json({ error: "No matching document found." });
    }
    res.json({ Matieres: document.Matieres });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/api/matieres_description", async (req, res) => {
  try {
    const { option2, option3 } = req.query;
    const document = await Document.findOne(
      { institut: option2, niveau: option3 },
      "description"
    );
    if (!document) {
      return res.status(404).json({ error: "No matching document found." });
    }
    res.json({ description: document.description });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/api/matieres_link", async (req, res) => {
  try {
    const { option2, option3 } = req.query;
    const document = await Document.findOne(
      { institut: option2, niveau: option3 },
      "link"
    );
    if (!document) {
      return res.status(404).json({ error: "No matching document found." });
    }
    res.json({ link: document.link });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
