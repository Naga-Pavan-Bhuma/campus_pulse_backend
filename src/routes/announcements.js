const { facultyAuth } = require("../middlewears/auth");
const { Announcement } = require("../models/announcements");
const express = require("express");
const announcementRouter = express.Router();

// Get all announcements
announcementRouter.get("/announcements", async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ error: "Error fetching announcements" });
    }
});

// Get a single announcement by ID
announcementRouter.get("/announcements/:id", async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ error: "Not found" });
        res.status(200).json(announcement);
    } catch (error) {
        res.status(500).json({ error: "Error fetching announcement" });
    }
});


// Create a new announcement (Only accessible by Faculty or Admin)
announcementRouter.post("/announcements", facultyAuth, async (req, res) => {
    try {
        const { faculty } = req;
        const { title, content, audience } = req.body;
        const postedBy = faculty.name; // Use the faculty ID from the request
        const userType = "Faculty"; // Use the faculty userType from the request
        if (!title || !content || !postedBy || !userType) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newAnnouncement = new Announcement({
            title,
            content,
            postedBy,
            userType,
            audience,
        });

        await newAnnouncement.save();
        res.status(201).json({ message: "Announcement created", newAnnouncement });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an announcement (Only accessible by Admin)
announcementRouter.delete("/announcements/:id", async (req, res) => {
    try {
        const deletedAnnouncement = await Announcement.findByIdAndDelete(
            req.params.id
        );
        if (!deletedAnnouncement)
            return res.status(404).json({ error: "Announcement not found" });

        res.status(200).json({ message: "Announcement deleted" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting announcement" });
    }
});

module.exports = announcementRouter;