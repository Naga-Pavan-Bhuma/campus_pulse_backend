const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require("./routes/auth");
const clubRouter = require("./routes/club");
const session = require('express-session');
const passport = require('passport');
const timetableRouter = require('./routes/timetable');
const cookieParser = require('cookie-parser');
const announcementRouter = require('./routes/announcements');
require("./config/passport");



dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
// Routes
try {
  app.use("/", clubRouter);
  app.use("/", announcementRouter)
  app.use('/', authRoutes);


} catch (err) {
  console.log(err.message);
}
app.use('/timetable', timetableRouter);
app.get("/user", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const { firstName, lastName, email, photoUrl } = req.user;
  res.json({ firstName, lastName, email, photoUrl });
});

// Connect to DB and start server
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(5000, () => {
      console.log('Server running on port 5000');
    });
  })
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });
