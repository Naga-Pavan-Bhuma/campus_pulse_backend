const express = require("express");
const { Club } = require("../models/club");
const clubRouter = express.Router();

// ✅ 1. Create a Club (Public or Admin - no auth needed now)
clubRouter.post("/clubs", async (req, res) => {
  try {
    const { clubName, description, imageUrl } = req.body;

    // Validation: Ensure that clubName and description are provided
    if (!clubName || !description) {
      return res.status(400).json({ error: "Club Name and Description are required" });
    }

    // Create new club document
    const club = new Club({
      clubName,
      description,
      imageUrl: imageUrl || "https://collegecliffs.com/wp-content/uploads/2020/10/college-clubs-concept-1.png", // Default image URL if not provided
    });

    // Save the club to the database
    await club.save();
    res.status(201).json({ message: "Club Created Successfully", club });
  } catch (err) {
    res.status(500).json({ error: "Server Error: " + err.message });
  }
});

// ✅ 2. Get All Clubs (Public)
clubRouter.get("/clubs", async (req, res) => {
  try {
    const clubs = await Club.find();
    if (clubs.length === 0) {
      return res.status(404).json({ message: "No clubs found" });
    }
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: "Server Error: " + err.message });
  }
});

// ✅ 3. Get Club Details (Public)
clubRouter.get("/club/:clubId", async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }
    res.json(club);
  } catch (err) {
    res.status(500).json({ error: "Server Error: " + err.message });
  }
});

module.exports = clubRouter;
