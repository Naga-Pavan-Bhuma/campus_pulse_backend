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
const eventRoutes = require("./routes/events");
const examScheduleRoutes = require('./routes/examSchedule');
const academicCalendarRouter = require('./routes/academicCalendar');
const statsRouter = require('./routes/stats');
const timetableRouter = require('./routes/timetable'); // Original timetable router
const facultyTimetableRouter = require('./routes/facultyTimetable'); // New router for faculty timetable

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
const allowedOrigins = [
  "http://localhost:3000",
  "https://campus-pulse-frontend.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true in production (HTTPS), false in dev
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site cookies in prod
      httpOnly: true, // always true for security
    },
  })
);



app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use('/academiccalendar', academicCalendarRouter);
// Routes
app.use("/", clubRouter);
app.use("/", announcementRouter);
app.use('/', authRoutes);
app.use("/", facultyRoutes);
app.use("/", messMenuRouter);
app.use('/', eventRoutes);
app.use('/', examScheduleRoutes);
app.use('/', statsRouter);
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
    const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
  })

  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);  // Terminate the app if there's an error connecting to the DB
  });