// backend/server.js

require('dotenv').config();

console.log(
  'JWT_SECRET loaded:',
  process.env.JWT_SECRET ? 'Yes' : 'No'
);

console.log(
  'SESSION_SECRET loaded:',
  process.env.SESSION_SECRET ? 'Yes' : 'No'
);

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./config/database');

const app = express();

const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const debugRoutes = require('./routes/debugRoutes');

// Trust Render's proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: 'https://faculty-activity-and-information-ma.vercel.app',
  credentials: true
}));

app.use(express.json());

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'none'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/debug', debugRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Faculty Management System Backend');
});

// Connect to database and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });