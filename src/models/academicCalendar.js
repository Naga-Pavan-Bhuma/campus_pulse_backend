const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },  // Use Date type here
  type: { type: String, enum: ['exam', 'holiday', 'event'], required: true },
  branch: { type: String, required: true },
  year: { type: Number, required: true },
});


// Ensure the model is created and exported properly
const Event = mongoose.model('Event', eventSchema, 'academiccalendar');

module.exports = Event;  // This line is crucial
