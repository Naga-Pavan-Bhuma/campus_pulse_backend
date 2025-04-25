const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema({
  clubName: {
    type: String,
    required: true, // Ensuring clubName is always provided
    index: true, // Adding an index for faster lookups by clubName
  },
  description: {
    type: String,
    default: "No description provided.",
  },
  imageUrl: {
    type: String,
    default:
      "https://collegecliffs.com/wp-content/uploads/2020/10/college-clubs-concept-1.png",
  },
});

const Club = mongoose.model("Club", clubSchema);
module.exports = { Club };
