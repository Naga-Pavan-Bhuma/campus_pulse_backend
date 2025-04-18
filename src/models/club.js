const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema({
  clubName: { type: String, required: true, unique: true },
  coordinators: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ], // Required Coordinators
  facultyAdvisors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Faculty" }], // Optional Faculty Heads
  members: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: ["pending", "approved"],
        default: "pending",
      },
    },
  ],
  imageUrl: {
    type: String,
    default:
      "https://collegecliffs.com/wp-content/uploads/2020/10/college-clubs-concept-1.png",
  },
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
});

const Club = mongoose.model("Club", clubSchema);
module.exports = { Club };