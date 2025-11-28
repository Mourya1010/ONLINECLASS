const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config();

const port  = process.env.PORT
require('./db')

const allowedOrigins = [
  'http://localhost:3000',
  'https://frontend-for-online-class.vercel.app'
];

// 🔥 ADD THIS PART — LOGGING ORIGIN BEFORE CORS
app.use((req, res, next) => {
  console.log("==== Incoming Request Origin ====");
  console.log("Origin:", req.headers.origin);
  console.log("Allowed Origins:", allowedOrigins);
  console.log("=================================");
  next();
});


app.use(cors({
    origin:function(origin,callback){
        if(!origin || allowedOrigins.includes(origin)){
            callback(null,true)
        }
        else{
            console.log("❌ BLOCKED ORIGIN:", origin);
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials:true
}))

app.use(bodyParser.json());
app.use(cookieParser({
    httpOnly:true,
    secure:true,
    sameSite:'none',
    maxAge:100*60*60*24*7,
    signed:true
}))

const authRoutes = require('./routes/authRoutes');
const classroomRoutes = require('./routes/classroomRoutes');

app.use('/auth',authRoutes);
app.use('/class',classroomRoutes);

app.get('/',(req,res)=>{
    res.send('Hello World')
})

app.listen(port,()=>{
  console.log(`App is listening on the port ${port}`);  
})
