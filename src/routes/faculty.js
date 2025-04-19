// routes/facultyRoutes.js
const express = require("express");
const router = express.Router();
const { Faculty } = require("../models/faculty"); // ✅ Destructure Faculty

// Get all faculties
router.get("/faculties", async (req, res) => {
  try {
    const faculties = await Faculty.find().select("-password"); // exclude password field if present in model
    res.json(faculties);
  } catch (error) {
    console.error("Error fetching faculties:", error.message);
    res.status(500).json({ error: "Failed to fetch faculties" });
  }
});

// Add new faculty
router.post("/faculties", async (req, res) => {
  const { name, facultyId } = req.body;

  // Validate the input fields
  if (!name || !facultyId) {
    return res.status(400).json({ error: "Name and Faculty ID are required" });
  }

  try {
    // Check if the facultyId is unique
    const existingFaculty = await Faculty.findOne({ facultyId });
    if (existingFaculty) {
      return res.status(400).json({ error: "Faculty ID already exists" });
    }

    const newFaculty = new Faculty({ name, facultyId });

    // Save to database
    await newFaculty.save();
    res.status(201).json(newFaculty); // Respond with the newly created faculty
  } catch (error) {
    console.error("Error adding faculty:", error.message);
    res.status(500).json({ error: "Failed to add faculty" });
  }
});

module.exports = router;
