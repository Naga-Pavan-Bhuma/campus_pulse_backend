const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const validator = require("validator");
require("dotenv").config();


const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      lowercase: true,
    },
    photoUrl: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid URL: " + value);
        }
      },
    },
    isCoordinator: {
      type: Boolean,
      default: false,
    },
    about: {
      type: String,
      default: "Hey there! I am using DevTinder",
      maxlength: 140,
    },
    role: { type: String, enum: ["Student", "Alumni"], default: "Student" },
    academicDetails: {
      batch: { type: String },
      branch: { type: String },
      section: { type: String },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function () {
  return jwt.sign({ _id: this._id, role: "student" }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

userSchema.methods.isValidPassword = async function (passwordEnteredByUser) {
  return bcrypt.compare(passwordEnteredByUser, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = { User };