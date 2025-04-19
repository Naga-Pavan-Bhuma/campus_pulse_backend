const Timetable = require('../models/timetable'); // Import the Timetable model

// Controller to get timetable
exports.getTimetable = async (req, res) => {
  try {
    const { department, className, year } = req.params; // Get department, class, and year from params

    // Log the received parameters for debugging
    console.log(`Request received with department: ${department}, class: ${className}, year: ${year}`);

    // Query to find the timetable for the requested department, class, and year
    const timetable = await Timetable.findOne({ 
      department, 
      className, 
      year 
    });

    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }

    // Return the timetable data as JSON
    return res.json(timetable.timetable);
  } catch (err) {
    console.error('Error fetching timetable:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
