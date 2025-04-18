const express = require("express");
const { Club } = require("../models/club");
const { studentAuth, adminAuth } = require("../middlewears/auth");
const clubRouter = express.Router();

// ✅ 1. Create a Club (Only Admin)
clubRouter.post("/club/create", adminAuth, async (req, res) => {
  try {
    const { clubName, coordinators, facultyAdvisors } = req.body;
    if (!clubName || !coordinators || coordinators.length === 0) {
      return res
        .status(400)
        .send("Club Name and at least one coordinator are required");
    }

    const club = new Club({
      clubName,
      coordinators,
      facultyAdvisors: facultyAdvisors || [],
      members: [],
      events: [],
    });

    await club.save();
    res.status(201).json({ message: "Club Created Successfully", club });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 2. Join Club Request (Students)
clubRouter.post("/:clubId/join", studentAuth, async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);
    if (!club) return res.status(404).send("Club not found");
    const isCoordinatorMember = club.coordinators.includes(
      req.user._id.toString()
    );
    if (isCoordinatorMember)
      return res.status(400).send("coordinator cannot join the club");

    const isAlreadyMember = club.members.find(
      (m) => m.userId.toString() === req.user._id.toString()
    );
    if (isAlreadyMember)
      return res.status(400).send("Already requested or member");

    club.members.push({ userId: req.user._id, status: "pending" });
    await club.save();
    res.json({ message: "Join request sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 3. Approve Membership (Only Coordinators)
clubRouter.patch(
  "/:clubId/approve/:memberId",
  studentAuth,
  async (req, res) => {
    try {
      const memberId = req.params.memberId;
      const club = await Club.findById(req.params.clubId);
      if (!club) return res.status(404).send("Club not found");

      if (!club.coordinators.includes(req.user._id.toString())) {
        return res.status(403).send("Only Coordinators can approve members");
      }
      const isCoordinatorMember = club.coordinators.includes(memberId);
      if (isCoordinatorMember)
        return res.status(400).send("Coordinators cannot be members");

      const member = club.members.find((m) => m.userId.toString() === memberId);
      if (!member) return res.status(404).send("Member not found");

      member.status = "approved";
      await club.save();
      res.json({ message: "Member approved" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ✅ 4. Get All Clubs (Public)
clubRouter.get("/clubs", studentAuth, async (req, res) => {
  try {
    const clubs = await Club.find()
      .populate("coordinators", "firstName lastName")
      .populate("facultyAdvisors", "name")
      .populate("members.userId", "firstName lastName email")
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 5. Get Club Details (Public)
clubRouter.get("/club/:clubId", async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId)
      .populate("coordinators", "firstName lastName")
      .populate("facultyAdvisors", "name")
      .populate("members.userId", "firstName lastName email")
      .select("-members.status");

    if (!club) return res.status(404).send("Club not found");
    res.json(club);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = clubRouter;