const express = require("express");
const router = express.Router();

const {
  Request,
  Request1,
  Request2,
  User,
  Document,
  Institut,
  Event,
} = require("./schemas.js");

router.get("/api/check-request-seances-status/:req1", async (req, res) => {
  const userData = req.cookies.userData;
  if (!userData) {
    res.redirect("/login");
    return;
  }

  const { email } = JSON.parse(userData);
  const req1 = req.params.req1;

  try {
    const request = await Request1.find({
      email,
      seance: req1,
      status: { $in: ["accepted", "waiting"] },
    });

    if (request) {
      res.status(200).json(request);
    } else {
      res.status(404).json({ error: "Request not found" });
    }
  } catch (err) {
    console.error("Error fetching request status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/check-request-status", async (req, res) => {
  const userData = req.cookies.userData;

  if (!userData) {
    return res.status(400).json({ error: "User data not found" });
  }

  const { email } = JSON.parse(userData);

  try {
    const request = await Request.find({ email });

    if (request) {
      res.status(200).json(request);
    } else {
      res.status(404).json({ error: "Request not found" });
    }
  } catch (err) {
    console.error("Error fetching request status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/check-request-waiting", async (req, res) => {
  const userData = req.cookies.userData;

  if (!userData) {
    return res.status(400).json({ error: "User data not found" });
  }

  const { email } = JSON.parse(userData);

  try {
    const requests = await Request.findOne({ email, status: "waiting" });

    if (requests) {
      res.status(200).json({ hasRequest: true });
    } else {
      res.status(404).json({ hasRequest: false });
    }
  } catch (err) {
    console.error("Error fetching request status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/check-request-balance-waiting", async (req, res) => {
  const userData = req.cookies.userData;

  if (!userData) {
    return res.status(400).json({ error: "User data not found" });
  }

  const { email } = JSON.parse(userData);

  try {
    const requests = await Request2.findOne({ email, status: "waiting" });

    if (requests) {
      res.status(200).json({ hasRequest: true });
    } else {
      res.status(404).json({ hasRequest: false });
    }
  } catch (err) {
    console.error("Error fetching request status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
