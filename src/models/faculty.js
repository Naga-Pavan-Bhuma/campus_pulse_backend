const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const validator = require("validator");

require("dotenv").config();

const facultySchema = new mongoose.Schema({
  facultyId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
  password: {
    type: String,
    required: false,
  },
  isRegistered: {
    type: Boolean,
    default: false,
  },
});

facultySchema.methods.getJWT = async function () {
  return jwt.sign({ _id: this._id, role: "faculty" }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

facultySchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Faculty = mongoose.model("Faculty", facultySchema);
module.exports = { Faculty };