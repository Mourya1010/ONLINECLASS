const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const port = process.env.PORT || 5000;
require('./db');

// Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://frontend-for-online-class.vercel.app'
];

// LOG INCOMING ORIGIN
app.use((req, res, next) => {
  console.log("==== Incoming Request Origin ====");
  console.log("Origin:", req.headers.origin);
  console.log("Allowed:", allowedOrigins);
  console.log("=================================");
  next();
});

// FIX: Allow OPTIONS preflight
app.options('*', cors());

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ BLOCKED ORIGIN:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Body & Cookies
app.use(bodyParser.json());
app.use(cookieParser({
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 1000 * 60 * 60 * 24 * 7,
}));

// Routes
const authRoutes = require('./routes/authRoutes');
const classroomRoutes = require('./routes/classroomRoutes');

app.use('/auth', authRoutes);
app.use('/class', classroomRoutes);

app.get('/', (req, res) => {
  res.send('Hello World');
});

// START SERVER
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
