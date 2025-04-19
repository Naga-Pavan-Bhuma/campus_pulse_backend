const express = require('express');
const router = express.Router();
const Timetable = require('../models/timetable');

// GET: Fetch timetable
router.get('/', async (req, res) => {
  const { department, year, className } = req.query; // Use className instead of class
  
  if (!department || !year || !className) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  try {
    // Fetch timetable based on the provided parameters
    const timetable = await Timetable.findOne({ department, year, className }); // Use className here

    if (!timetable) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    res.json(timetable);
  } catch (err) {
    console.error("Error fetching timetable:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST: Update or create timetable
router.post('/update', async (req, res) => {
  const { department, year, className, timetable } = req.body; // Use className instead of class
  
  if (!department || !year || !className || !timetable) {
    return res.status(400).json({ error: "Missing required fields in body" });
  }

  try {
    // Check if the timetable exists for the given department, year, and className
    const existingTimetable = await Timetable.findOne({ department, year, className });

    if (existingTimetable) {
      // If it exists, update the timetable
      const updatedTimetable = await Timetable.findOneAndUpdate(
        { department, year, className },
        { timetable },
        { new: true }
      );
      res.json({ message: "Timetable updated successfully", data: updatedTimetable });
    } else {
      // If it doesn't exist, create a new timetable
      const newTimetable = new Timetable({ department, year, className, timetable });
      const savedTimetable = await newTimetable.save();
      res.json({ message: "Timetable created successfully", data: savedTimetable });
    }

  } catch (err) {
    console.error("Error updating timetable:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
