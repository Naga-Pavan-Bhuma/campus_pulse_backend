const mongoose = require('mongoose');

const examScheduleSchema = new mongoose.Schema({
  branch: { type: String, required: true },
  year: { type: String, required: true },
  examType: { type: String, required: true },
  exams: [
    {
      subject: { type: String, required: true },
      date: { type: String, required: true },
    }
  ]
});

const ExamSchedule = mongoose.model('ExamSchedule', examScheduleSchema);
module.exports = ExamSchedule;
