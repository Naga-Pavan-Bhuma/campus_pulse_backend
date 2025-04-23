// routes/examSchedule.js
const express = require('express');
const ExamSchedule = require('../models/examschedule');
const router = express.Router();

// Route to fetch exam schedules based on branch, year, and examType
router.get('/schedule', async (req, res) => {
  try {
    const { branch, year, examType } = req.query;
    const schedule = await ExamSchedule.find({ branch, year, examType });
    console.log("sched",schedule);
    res.json(schedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
