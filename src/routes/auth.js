const express = require("express");
const { User } = require("../models/User");
const { sendOTP } = require("../utils/mailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Faculty } = require("../models/faculty");
const { Admin } = require("../models/admin");
const passport = require("passport");

const authRouter = express.Router();

// Utility to generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // true in prod for HTTPS only
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
};

// Google Auth Routes
authRouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/student/login",
    session: true,
  }),
  async (req, res) => {
    const token = await req.user.getJWT();
    res.cookie("token", token, cookieOptions);
    res.redirect(`${process.env.FRONTEND_URL}/student`);
  }
);

// Signup route
authRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email already in use");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      otp,
      otpExpiry,
    });

    await user.save();
    await sendOTP(email, otp);

    res.json({ message: "OTP sent to email", email });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Login for Student
authRouter.post("/student/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = await user.getJWT();
    res.cookie("token", token, cookieOptions);

    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      _id: user._id,
    };

    res.status(200).json({ message: "Login successful", user: userData });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Faculty Registration
authRouter.post("/faculty/register", async (req, res) => {
  try {
    const { facultyId, password } = req.body;

    const existingFaculty = await Faculty.findOne({ facultyId });
    if (!existingFaculty) {
      throw new Error("Invalid faculty ID");
    }
    if (existingFaculty.isRegistered) {
      throw new Error("Faculty already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    existingFaculty.password = passwordHash;
    existingFaculty.isRegistered = true;
    await existingFaculty.save();

    res.json({ message: "Successfully registered" });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Faculty Login
authRouter.post("/faculty/login", async (req, res) => {
  try {
    const { facultyId, password } = req.body;
    const faculty = await Faculty.findOne({ facultyId });
    if (!faculty) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await faculty.isValidPassword(password);
    if (isValidPassword) {
      const token = await faculty.getJWT();
      res.cookie("token", token, cookieOptions);
      res.send(faculty);
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Admin Login
authRouter.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await admin.isValidPassword(password);
    if (isValidPassword) {
      const token = await admin.getJWT();
      res.cookie("token", token, cookieOptions);
      res.send(admin);
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/admin/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).send("Admin with this email already exists");
    }

    const newAdmin = new Admin({ email, password });
    await newAdmin.save();

    const token = await newAdmin.getJWT();
    res.cookie("token", token, cookieOptions);
    res.status(201).send(newAdmin);
  } catch (err) {
    res.status(500).send("ERROR: " + err.message);
  }
});

// OTP Verification
authRouter.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    if (user.otp !== otp || user.otpExpiry < Date.now()) {
      throw new Error("Invalid or expired OTP");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Logout
authRouter.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.clearCookie("token");
      res.send({ message: "Logged out" });
    });
  });
});

// Get Current User Data
authRouter.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send("Unauthorized");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    let user = null;

    if (payload.role === "student") {
      user = await User.findById(payload._id).select("-password -isCoordinator -isVerified");
    } else if (payload.role === "faculty") {
      user = await Faculty.findById(payload._id).select("-password");
    } else if (payload.role === "admin") {
      user = await Admin.findById(payload._id).select("-password");
    }

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.json({ user });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// Refresh Token
authRouter.post("/refresh-token", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).send("Unauthorized");
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(payload._id); // Or Faculty/Admin
    if (!user) {
      return res.status(404).send("User not found");
    }

    const newToken = await user.getJWT();
    res.cookie("token", newToken, cookieOptions);

    res.json({ message: "Token refreshed successfully" });
  } catch (err) {
    res.status(400).send("Error refreshing token: " + err.message);
  }
});

module.exports = authRouter;
