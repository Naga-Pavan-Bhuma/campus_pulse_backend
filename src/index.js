const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require("./routes/auth");
const clubRouter = require("./routes/club");
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const announcementRouter = require('./routes/announcements');
const messMenuRouter = require('./routes/menu');
require("./config/passport");
const facultyRoutes = require("./routes/faculty");


const academicCalendarRouter = require('./routes/academicCalendar');

const timetableRouter = require('./routes/timetable'); // Original timetable router
const facultyTimetableRouter = require('./routes/facultyTimetable'); // New router for faculty timetable

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
app.use('/academiccalendar', academicCalendarRouter);
// Routes
<<<<<<< HEAD

app.use("/", clubRouter);
app.use("/", announcementRouter);
app.use('/', authRoutes);
app.use("/", facultyRoutes);
app.use("/", messMenuRouter);

=======
try {
  app.use("/", clubRouter);
  app.use("/", announcementRouter)
  app.use('/', authRoutes);
  app.use("/", messMenuRouter);
  app.use('/academiccalendar', academicCalendarRouter);
}catch (err) {
  console.error("Error while setting up routes:", err.message);
}
>>>>>>> 15f46f8 (Academic Calendar added)
// Use the appropriate routes
app.use('/timetable', timetableRouter); // Original timetable routes
app.use('/faculty-timetable', facultyTimetableRouter); // New route for faculty timetable

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
    console.log('Connected to MongoDB successfully');
    app.listen(5000, () => {
      console.log('Server running on port 5000');
    });
  })

  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);  // Terminate the app if there's an error connecting to the DB
  });