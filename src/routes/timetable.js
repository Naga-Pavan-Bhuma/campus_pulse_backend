const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');

// Route to get timetable based on department and class
router.get('/:department/:className', timetableController.getTimetable);

module.exports = router;
