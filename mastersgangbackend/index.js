const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config();

const port = process.env.PORT
require('./db')

// Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://frontend-for-online-class.vercel.app'
];

// 1️⃣ LOG ORIGIN BEFORE CORS (VERY IMPORTANT)
app.use((req, res, next) => {
  console.log("Incoming origin:", req.headers.origin);
  console.log("Allowed origins:", allowedOrigins);
  next();
});

// 2️⃣ CORS MIDDLEWARE
app.use(cors({
  origin: function(origin, callback) {
    console.log("CORS checking origin:", origin);

    if (!origin || allowedOrigins.includes(origin)) {
      console.log("✔ Allowed by CORS:", origin);
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// 3️⃣ BODY + COOKIE PARSER
app.use(bodyParser.json());
app.use(cookieParser({
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 1000 * 60 * 60 * 24 * 7,
  signed: true
}));

// 4️⃣ ROUTES
const authRoutes = require('./routes/authRoutes');
const classroomRoutes = require('./routes/classroomRoutes');

app.use('/auth', authRoutes);
app.use('/class', classroomRoutes);

app.get('/', (req, res) => {
  res.send('Hello World')
});

app.get('/getuserdata', (req, res) => {
  res.send('Mourya reddy i am studying in vit')
});

// 5️⃣ START SERVER
app.listen(port, () => {
  console.log(`App is listening on the port ${port}`);
});
