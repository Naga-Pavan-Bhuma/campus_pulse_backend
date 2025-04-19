const Event = require('../models/academicCalendar');

const getEvents = async (req, res) => {
    const { branch, year } = req.params;
    console.log(`API Hit: /academicCalendar/${branch}/${year}`);
  
    try {
      const events = await Event.find({
        $or: [{ branch: branch.toUpperCase() }, { branch: 'ALL' }],
        year: parseInt(year),
      });
  
      res.json(events);
    } catch (err) {
      console.error("Error fetching events:", err); // Log actual error
      res.status(500).json({ error: err.message });
    }
  };
  

const addEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.json(event);
  } catch (err) {
    console.error("Error adding event:", err); // Optional: helpful log
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getEvents,
  addEvent,
};
