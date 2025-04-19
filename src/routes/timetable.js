const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');

// Route to get timetable based on department, class, and year
router.get('/:department/:className/:year', timetableController.getTimetable);

module.exports = router;
