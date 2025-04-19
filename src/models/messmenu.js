const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  breakfast: [String],
  lunch: [String],
  snacks: [String],
  dinner: [String],
}, { _id: false });

const daySchema = new mongoose.Schema({
  Monday: mealSchema,
  Tuesday: mealSchema,
  Wednesday: mealSchema,
  Thursday: mealSchema,
  Friday: mealSchema,
  Saturday: mealSchema,
  Sunday: mealSchema
}, { _id: false });

const messMenuSchema = new mongoose.Schema({
  Mess1: daySchema,
  Mess2: daySchema,
  Mess3: daySchema,
  Mess4: daySchema,
  Mess5: daySchema,
  Mess6: daySchema,
  Mess7: daySchema,
  Mess8: daySchema
}, { timestamps: true });

module.exports = mongoose.model('MessMenu', messMenuSchema);
