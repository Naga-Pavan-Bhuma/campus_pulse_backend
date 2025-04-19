const express = require('express');
const router = express.Router();
const MessMenu = require('../models/messmenu');

// Get menu data
router.get('/menu', async (req, res) => {
  try {
    // Fetch the first document and convert it to a plain JS object
    const menuData = await MessMenu.findOne().lean();

    if (!menuData) {
      return res.status(404).json({ message: "No menu data found" });
    }

    // No need to restructure, it's already plain JSON from lean()
    // Remove _id and timestamps if needed
    const { _id, createdAt, updatedAt, __v, ...cleanedData } = menuData;

    res.json(cleanedData);
  } catch (err) {
    console.error('Error fetching mess menu:', err.message);
    res.status(500).json({ error: 'Server Error' });
  }
});
// Update menu data
router.put('/menu', async (req, res) => {
  try {
    const updatedMenu = await MessMenu.findOneAndUpdate(
      {},
      { Mess1: req.body.Mess1 }, // Replace with your menu structure key
      { new: true, upsert: true }
    );

    res.json({ message: "Menu updated successfully", updatedMenu });
  } catch (err) {
    console.error('Error updating mess menu:', err.message);
    res.status(500).json({ error: 'Failed to update menu' });
  }
});

module.exports = router;
