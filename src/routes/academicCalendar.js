const express = require('express');
const { getEvents, addEvent } = require('../controllers/academicCalendarController');

const router = express.Router();

router.get('/:branch/:year', getEvents);
router.post('/', addEvent);

module.exports = router;
