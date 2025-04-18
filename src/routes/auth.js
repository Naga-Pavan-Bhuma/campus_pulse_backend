const express = require("express");
const { User } = require("../models/User");
const { sendOTP } = require("../utils/mailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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


module.exports = authRouter;
