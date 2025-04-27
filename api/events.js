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

router.get("/api/events/num/:num", async (req, res) => {
  const { num } = req.params;

  try {
    const event = await Event.find({ num });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).send({ message: "event not found" });
    }
    res.status(200).send(event);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving event", error });
  }
});

module.exports = router;
