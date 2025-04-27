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
  Contact,
  Matiere,
  University,
  PFE,
} = require("./schemas.js");

function checkAdminToken(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(403).send("Access denied");
  }

  next();
}

// ------------------------------- //
//          User Routes
// ------------------------------- //

router.get("/admin/users", checkAdminToken, async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving users", error });
  }
});

router.get("/admin/pfe", checkAdminToken, async (req, res) => {
  try {
    const pfe = await PFE.find();
    res.status(200).send(pfe);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving pfe", error });
  }
});

router.get("/admin/pfe/:id", checkAdminToken, async (req, res) => {
  try {
    const pfe = await PFE.findById(req.params.id);
    if (!pfe) {
      return res.status(404).send({ message: "pfe not found" });
    }
    res.status(200).send(pfe);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving pfe", error });
  }
});

router.put("/api/pfe/:id", checkAdminToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const pfe = await PFE.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!pfe) {
      return res.status(404).json({ error: "pfe not found" });
    }

    res.status(200).json(pfe);
  } catch (err) {
    console.error("Error updating pfe status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/user/:id", checkAdminToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving user", error });
  }
});

router.delete("/admin/user/:id", checkAdminToken, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// ------------------------------- //
//          Request Routes
// ------------------------------- //

router.put("/api/request/:id", checkAdminToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const request = await Request.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.status(200).json(request);
  } catch (err) {
    console.error("Error updating request status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/api/request1/:id", checkAdminToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const request = await Request1.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.status(200).json(request);
  } catch (err) {
    console.error("Error updating request status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/fetchrequests", checkAdminToken, async (req, res) => {
  try {
    const requests = await Request.find();
    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/fetchrequests1", checkAdminToken, async (req, res) => {
  try {
    const requests = await Request1.find().lean();

    for (const request of requests) {
      const matiere = await Event.findById(request.seance);
      if (matiere) {
        request.matiereId = matiere.title;
      }
    }

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/api/fetchrequests2", checkAdminToken, async (req, res) => {
  try {
    const requests = await Request2.find();
    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/api/request2/:id", checkAdminToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const request = await Request2.findById(id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    const user = await User.findOne({ email: request.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (
      request.status === "accepted" &&
      ["waiting", "not valid"].includes(status)
    ) {
      user.balance -= request.credits;
      await user.save();
    } else if (
      ["waiting", "not valid"].includes(request.status) &&
      status === "accepted"
    ) {
      user.balance += request.credits;
      await user.save();
    }
    request.status = status;
    await request.save();

    res.status(200).json(request);
  } catch (err) {
    console.error("Error updating request status:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------------- //
//          Institut update Routes
// ------------------------------- //

router.get("/admin/university", checkAdminToken, async (req, res) => {
  try {
    const universities = await University.find();
    res.status(200).send(universities);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving universities", error });
  }
});

router.get("/admin/institut", checkAdminToken, async (req, res) => {
  try {
    const instituts = await Institut.find();
    res.status(200).send(instituts);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving instituts", error });
  }
});

router.get("/admin/university/:id", checkAdminToken, async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).send({ message: "University not found" });
    }
    res.status(200).send(university);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving university", error });
  }
});

router.get("/admin/institut/:id", checkAdminToken, async (req, res) => {
  try {
    const institut = await Institut.findById(req.params.id);
    if (!institut) {
      return res.status(404).send({ message: "Institut not found" });
    }

    res.status(200).send(institut);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving institut", error });
  }
});

router.post("/admin/university/insert", checkAdminToken, async (req, res) => {
  const { name } = req.body;

  try {
    const newUniversity = new University({
      name,
    });

    await newUniversity.save();
    res.status(201).send({ message: "University Saved Succesfully" });
  } catch (error) {
    res.status(500).send({ message: "Error saving Unviersity", error });
  }
});

router.post("/admin/institut/insert", checkAdminToken, async (req, res) => {
  const { name, university } = req.body;

  try {
    const newInstitut = new Institut({
      name,
      university,
    });

    await newInstitut.save();
    res.status(201).send({ message: "Institut Saved Succesfully" });
  } catch (error) {
    res.status(500).send({ message: "Error saving institut", error });
  }
});

router.put("/admin/institut/:id", checkAdminToken, async (req, res) => {
  try {
    const { name, university } = req.body;
    const updatedData = {
      name,
      university,
    };

    const updatedInstitut = await Institut.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    res.status(200).send({ message: "Updated Succesfully" });
  } catch (error) {
    res.status(500).send({ message: "Error updating institut", error });
  }
});

router.put("/admin/university/:id", checkAdminToken, async (req, res) => {
  try {
    const { name } = req.body;
    const university = await University.findById(req.params.id);
    const oldUniversityName = university.name;
    university.name = name;
    await university.save();
    const result = await Institut.updateMany(
      { university: oldUniversityName },
      { $set: { university: name } }
    );
    res.status(200).send({
      message: "University and associated institutes updated successfully",
    });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error updating university and institutes", error });
  }
});

router.delete("/admin/institut/:id", checkAdminToken, async (req, res) => {
  await Institut.findByIdAndDelete(req.params.id);
  res.status(204).send({ message: "Deleted Succesfully" });
});

router.delete("/admin/university/:id", checkAdminToken, async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    await Institut.deleteMany({ university: university.name });
    await university.deleteOne();
    res
      .status(204)
      .send({ message: "University and its institutes deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error deleting university and its institutes", error });
  }
});

router.post("/api/matieres/add", checkAdminToken, async (req, res) => {
  const { name, img } = req.body;
  try {
    const newMatiere = new Matiere({ name, img });
    await newMatiere.save();
    res.status(201).json({ message: "Matiere Added Succesfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding matiere", error });
  }
});

router.get("/api/matieres/:id", checkAdminToken, async (req, res) => {
  try {
    const matiere = await Matiere.findById(req.params.id);

    if (!matiere) {
      return res.status(404).json({ message: "Matiere not found" });
    }

    res.status(200).json(matiere);
  } catch (error) {
    res.status(500).json({ message: "Error fetching matiere", error });
  }
});

router.put("/api/matieres/:id", checkAdminToken, async (req, res) => {
  try {
    const { name, img } = req.body;

    const updatedmatiere = {
      name,
      img,
    };
    const updatedMatiere = await Matiere.findByIdAndUpdate(
      req.params.id,
      updatedmatiere,
      { new: true }
    );

    if (!updatedMatiere) {
      return res.status(404).send({ message: "Matiere not found" });
    }

    res.status(200).send({ message: "Succesfully updating event" });
  } catch (error) {
    res.status(500).send({ message: "Error updating event", error });
  }
});

router.delete("/api/matieres/:id", checkAdminToken, async (req, res) => {
  await Matiere.findByIdAndDelete(req.params.id);
  res.status(200).send({ message: "Succesfully Deleting event" });
});

router.get("/api/events/", checkAdminToken, async (req, res) => {
  try {
    const event = await Event.find(); // Search for event by 'num'
    if (!event) return res.status(404).json({ message: "Event not found" }); // Handle event not found
    res.json(event); // Respond with the found event
  } catch (error) {
    res.status(500).json({ message: error.message }); // Handle server errors
  }
});

router.delete("/api/events/:id", checkAdminToken, async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

router.put("/api/events/:id", checkAdminToken, async (req, res) => {
  try {
    const { title, start, end, num, meet, description, linkdocs } = req.body;

    const updatedEvent = {
      title,
      start,
      end,
      num,
      meet,
      description,
      linkdocs,
    };
    const updatedevent = await Event.findByIdAndUpdate(
      req.params.id,
      updatedEvent,
      { new: true }
    );

    if (!updatedevent) {
      return res.status(404).send({ message: "Event not found" });
    }

    res.status(200).send(updatedevent);
  } catch (error) {
    res.status(500).send({ message: "Error updating event", error });
  }
});
// Add a new event
router.post("/api/events", checkAdminToken, async (req, res) => {
  const { title, start, end, num, meet, description, linkdocs } = req.body;
  const newEvent = new Event({
    title,
    start,
    end,
    num,
    meet,
    description,
    linkdocs,
  });
  try {
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ------------------------------- //

// Get the single document by id
router.get("/admin/document/:id", checkAdminToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).send({ message: "Document not found" });
    }
    res.status(200).send(document);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving document", error });
  }
});

router.get("/admin/document", checkAdminToken, async (req, res) => {
  try {
    const documents = await Document.find();
    res.status(200).send(documents);
  } catch (error) {
    res.status(500).send({ message: "Error retrieving documents", error });
  }
});

router.put("/admin/document/:id", checkAdminToken, async (req, res) => {
  try {
    const { university, institut, niveau, Matieres, description, link } =
      req.body;
    const updatedData = {
      university,
      institut,
      niveau,
      Matieres: Matieres.split(","),
      description: description.split(","),
      link,
    };

    const updatedDocument = await Document.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );
    res.status(200).send(updatedDocument);
  } catch (error) {
    res.status(500).send({ message: "Error updating document", error });
  }
});

router.delete("/admin/document/:id", checkAdminToken, async (req, res) => {
  await Document.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

router.post("/admin/document/insert", checkAdminToken, async (req, res) => {
  const { university, institut, niveau, Matieres, description, link } =
    req.body;

  const newDocument = new Document({
    university,
    institut,
    niveau,
    Matieres: Matieres.split(","), // Assuming Matieres is sent as a
    description: description.split(","),
    link,
  });

  try {
    await newDocument.save();
    res.status(201).send(newDocument);
  } catch (error) {
    res.status(500).send({ message: "Error saving document", error });
  }
});

router.get("/api/contact_messages", checkAdminToken, async (req, res) => {
  try {
    const messages = await Contact.find();
    if (!messages) {
      return res.status(404).json({ error: "No messages found." });
    }
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: "error fetching messages" });
  }
});

router.get("/api/contact_messages/:id", checkAdminToken, async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: "No message found." });
    }
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: "error fetching message" });
  }
});

router.delete(
  "/api/contact_messages/:id",
  checkAdminToken,
  async (req, res) => {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(204).send();
  }
);

module.exports = router;
