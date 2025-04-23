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
router.post("/schedule", async (req, res) => {
  const { branch, year, examType, exams } = req.body;

  // Validate if exams array contains subjects and dates
  for (let exam of exams) {
    if (!exam.subject || !exam.date) {
      return res.status(400).json({ message: 'Both subject and date are required for each exam.' });
    }
  }

  // Check if the exam schedule exists
  const existingSchedule = await ExamSchedule.findOne({ branch, year, examType });

  if (existingSchedule) {
    // Update existing schedule
    existingSchedule.exams = exams;
    await existingSchedule.save();
    return res.json({ message: "Schedule updated successfully" });
  } else {
    // Create new schedule
    const newSchedule = new ExamSchedule({
      branch,
      year,
      examType,
      exams,
    });
    await newSchedule.save();
    return res.json({ message: "New schedule created successfully" });
  }
});
module.exports = router;
