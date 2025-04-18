const Timetable = require('../models/timetable'); // Import the Timetable model

// Controller to get timetable
exports.getTimetable = async (req, res) => {
  try {
    const { department, className } = req.params; // Get department and class from params

    // Find the timetable for the requested department and class
    const timetable = await Timetable.findOne({ department, className });

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    // Return the timetable data as JSON
    return res.json(timetable.timetable);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
