const express = require('express');
const router = express.Router();
const Event = require('../models/event');

// GET all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
});

// Optional: POST to add events (for admin use)
router.post('/', async (req, res) => {
  const { title, date, location } = req.body;
  try {
    const newEvent = new Event({ title, date, location });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: "Error creating event: " + error.message });
  }
});

module.exports = router;
