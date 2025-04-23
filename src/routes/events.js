const express = require('express');
const router = express.Router();
const Event = require('../models/event');

// GET all events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server Error: " + error.message });
  }
});

// POST: Add new event (admin use)
router.post('/events', async (req, res) => {
  const { title, date, location } = req.body;

  if (!title || !date || !location) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const newEvent = await Event.create({ title, date, location });
    res.status(201).json({ message: 'Event added', event: newEvent });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// DELETE: Remove an event by ID
router.delete('/events/:id', async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted', event: deleted });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// PUT: Update event by ID
router.put('/events/:id', async (req, res) => {
  const { title, date, location } = req.body;

  try {
    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      { title, date, location },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event updated', event: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

module.exports = router;
