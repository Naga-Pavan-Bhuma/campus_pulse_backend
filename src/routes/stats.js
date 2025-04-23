const express = require('express');
const router = express.Router();
const {User} = require('../models/User');
const {Faculty} = require('../models/faculty');

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const registeredFaculty = await Faculty.countDocuments({ isRegistered: true });

    res.json({ totalUsers, totalFaculty, registeredFaculty });
  } catch (err) {
    console.error("Stats route error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
