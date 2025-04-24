const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const { Faculty } = require("../models/faculty");
const { Admin } = require("../models/admin");

require("dotenv").config();

// 🔹 Middleware for Student Authentication
const studentAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) throw new Error("Invalid token");

    const user = await User.findById(payload._id);
    if (!user) throw new Error("User not found");

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    res.status(400).json({ message: error.message });
  }
};

// 🔹 Middleware for Faculty Authentication
const facultyAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) throw new Error("Invalid token");

    const faculty = await Faculty.findById(payload._id);
    if (!faculty) throw new Error("Faculty not found");

    req.faculty = faculty;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    res.status(400).json({ message: error.message });
  }
};

// 🔹 Middleware for Admin Authentication
const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) throw new Error("Invalid token");

    const admin = await Admin.findById(payload._id);
    if (!admin) throw new Error("Admin not found");

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    res.status(400).json({ message: error.message });
  }
};

module.exports = { studentAuth, facultyAuth, adminAuth };
