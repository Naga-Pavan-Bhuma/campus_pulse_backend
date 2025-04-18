const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  department: { type: String, required: true },
  className: { type: String, required: true },
  timetable: {
    Monday: [String],
    Tuesday: [String],
    Wednesday: [String],
    Thursday: [String],
    Friday: [String],
    Saturday: [String],
  },
});

module.exports = mongoose.model('Timetable', timetableSchema);
