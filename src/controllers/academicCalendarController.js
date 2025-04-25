const Event = require('../models/academicCalendar');

// Get events by branch and year
const getEvents = async (req, res) => {
  const { branch, year } = req.params;
  console.log(`API Hit: /academicCalendar/${branch}/${year}`);
  
  try {
    const events = await Event.find({
      $or: [{ branch: branch.toUpperCase() }, { branch: 'ALL' }],
      year: parseInt(year),  // Ensure year is treated as an integer
    });
    
    // Return events as JSON response
    if (events.length === 0) {
      return res.status(404).json({ message: 'No events found for this branch and year' });
    }
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err); // Log actual error
    res.status(500).json({ error: err.message });
  }
};

// Add a new event to the academic calendar
const addEvent = async (req, res) => {
  try {
    const { title, date, type, branch, year } = req.body;
    
    // Validate input data
    if (!title || !date || !type || !branch || !year) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create and save the new event
    const event = new Event({
      title,
      date,
      type,
      branch: branch.toUpperCase(),
      year: parseInt(year),
    });
    await event.save();
    
    // Return the newly created event
    res.status(201).json(event);
  } catch (err) {
    console.error("Error adding event:", err); // Optional: helpful log
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getEvents,
  addEvent,
};
