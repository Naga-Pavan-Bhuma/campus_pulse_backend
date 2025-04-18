const express = require("express");
const { User } = require("../models/User");
const { sendOTP } = require("../utils/mailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Faculty } = require("../models/faculty");
const { Admin } = require("../models/admin");
const authRouter = express.Router();

const passport = require("passport");

// Start Google Auth
authRouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Callback
authRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/student/login",
    session: true,
  }),
  async (req, res) => {
    const token = await req.user.getJWT();
    res.cookie("token", token, { expires: new Date(Date.now() + 900000) });

    res.redirect(`${process.env.FRONTEND_URL}/student`);
  }
);

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();


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
authRouter.post("/faculty/register", async (req, res) => {
  try {
    const { facultyId, password } = req.body;

    const existingFaculty = await Faculty.findOne({
      facultyId,
    });
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

authRouter.post("/faculty/login", async (req, res) => {
  try {
    const { facultyId, password } = req.body;
    const faculty = await Faculty.findOne({ facultyId });
    if (!faculty) {
      throw new Error("Invalid Credientials");
    }
    const isValidPassword = await faculty.isValidPassword(password);
    if (isValidPassword) {
      const token = await faculty.getJWT();
      res.cookie("token", token, { expires: new Date(Date.now() + 900000) });
      res.send(faculty);
    } else {
      throw new Error("Invalid Credientials");
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      throw new Error("Invalid Credientials");
    }
    const isValidPassword = await admin.isValidPassword(password);
    if (isValidPassword) {
      const token = await admin.getJWT();
      res.cookie("token", token, { expires: new Date(Date.now() + 900000) });
      res.send(admin);
    } else {
      throw new Error("Invalid Credientials");
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

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
    user.otp = undefined; // Remove OTP after verification
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(400).send(err.message);
  }
});
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()) });
  res.send("Successfully Logout");
});

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

module.exports = authRouter;
