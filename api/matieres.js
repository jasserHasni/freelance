const express = require("express");
const router = express.Router();
const {
  Request,
  Request1,
  User,
  Document,
  Institut,
  Event,
  Matiere,
} = require("./schemas.js");

router.get("/api/matieres", async (req, res) => {
  try {
    const matieres = await Matiere.find();
    res.status(200).json(matieres);
  } catch (error) {
    res.status(500).json({ message: "Error fetching matieres", error });
  }
});

module.exports = router;
