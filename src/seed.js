const mongoose = require('mongoose');
const Timetable = require('./models/timetable');
const timetableData = require('../data/timetableData.json');
require('dotenv').config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Timetable.deleteMany({});
    console.log('🧹 Old data cleared');

    const timetableDocs = [];

    for (const dept of timetableData) {
      const department = dept.department;

      for (const cls of dept.classes) {
        const className = cls.class;
        const year = cls.year; // Extracting the year from the data
        const timetable = cls.timetable;

        timetableDocs.push({ department, className, year, timetable });
      }
    }

    await Timetable.insertMany(timetableDocs);
    console.log('🎉 Timetable data inserted successfully');
    process.exit();
  } catch (error) {
    console.error('❌ Error inserting timetable data:', error);
    process.exit(1);
  }
};

seedDB();
