const { Announcement } = require("../models/announcement");

const sendAnnouncement = async (
  title,
  content,
  audience,
  postedBy,
  userType
) => {
  try {
    const announcement = new Announcement({
      title,
      content,
      postedBy,
      userType,
      audience: audience ? audience : "all",
    });
    await announcement.save();
    return "Announcement sent successfully";
  } catch (e) {
    throw new Error(e);
  }
};

module.exports = { sendAnnouncement };