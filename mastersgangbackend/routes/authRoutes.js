const express = require('express');
const User = require('../models/userModel');
const Verification = require('../models/verificationModel')
const responseFuntion = require('../utils/responseFunction')

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authTokenHandler = require('../middlewares/checkAuthToken');
const responseFunction = require('../utils/responseFunction');

const mailer = async (receiveremail,code)=>{
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // or 'STARTTLS'
        auth: {
            user: process.env.COMPANY_EMAIL,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    })

    let info = await transporter.sendMail({
        from: process.env.COMPANY_EMAIL ,
        to: receiveremail ,
        subject: 'Verification Code',
        text: `Your verification code is ${code}`,
        html:"<b>Your Otp is"+code+"</b>"
    })

    console.log("Message sent : %s", info.messageId);
    if(info.messageId){
        return true
    }
    return false;
}

router.get('/',(req,res)=>{
    res.json({
        message:'Auth route home'
    })
})

router.post('/sendotp',async (req,res)=>{
    const {email} = req.body;
    if(!email){
        return responseFunction(res,400,"Email is required",null,false)
    }
    try{
        await Verification.deleteMany({email:email})
        const code = Math.floor(100000 + Math.random() * 900000);
        const isSent = await mailer(email,code);

        const newVerifiation = new Verification({
            email:email,
            code:code
        })
        await newVerifiation.save()
        if(isSent){
            return responseFunction(res,200,"Otp sent successfully",null,true)
        }
        return responseFunction(res,500,"Failed to send otp",null,false)

    }catch(err){
        return responseFunction(res,500,"Internal Server Error",err,false)

    }

})

router.post('/register',async(req,res)=>{
    const {name,email,otp,password,role} = req.body;
    if(!email || !name || !password || !otp || !role){
        return responseFunction(res,400,"All fields are required",null,false)
    }
    if(password.length<6){
        return responseFunction(res,400,"Password must be at least 6 characters",null,false);
    }
    try{
        let user = await User.findOne({email});
        let verificationQueue = await Verification.findOne({email});
        if(user){
            return responseFunction(res,400,'User already exists',null,false);
        }
        if(!verificationQueue){
            return responseFunction(res,400,'please send otp',null,false)
        }
        const isMatch = await bcrypt.compare(otp,verificationQueue.code);
        if(!isMatch){
            return responseFunction(res,400,'Invalid otp',null,false);

        }
        user = new User({
            name,
            email,
            password,
            role
        })
        await user.save();
        await Verification.deleteOne({email});

        const authToken  = jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{expiresIn:'3d'});
        const refreshToken = jwt.sign({userId:user._id},process.env.JWT_REFRESH_SECRET_KEY,{expiresIn:'8d'})
     
        res.cookie('authToken', authToken, { httpOnly: true, secure: true, sameSite: 'none' });
        res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true, sameSite: 'none'});
        user.password = undefined;
           return responseFunction(res, 200, 'Registered successfully', { user, authToken, refreshToken }, true);

    }catch(err){
        return responseFunction(res,500,'Internal server error',err,false)

    }
})

router.post('/login', async (req, res,next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return responseFunction(res, 400, 'Invalid credentials', null, false);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return responseFunction(res, 400, 'Invalid credentials', null, false);
    }

    const authToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET_KEY,
      { expiresIn: '10d' }
    );

    res.cookie('authToken', authToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });

    user.password = undefined;

    return responseFunction(res, 200, 'Login successful', { user, authToken, refreshToken }, true);

  } catch (err) {
    return responseFunction(res, 500, 'Internal server error', err, false);
  }
});

router.get('/checklogin', authTokenHandler, async (req, res, next) => {
  res.json({
    ok: req.ok,
    message: req.message,
    userId: req.userId
  });
});

router.get('/getuser', authTokenHandler, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return responseFunction(res, 400, 'User not found', null, false);
    }
    return responseFunction(res, 200, 'User found', user, true);
  } catch (err) {
    return responseFunction(res, 500, 'Internal server error', err, false);
  }
});


router.get('/logout',authTokenHandler,async(req,res,next)=>{
    res.clearCookie('authToken');
    res.clearCookie('refreshToken');

    res.json({
        ok:true,
        message:"logout successful"
    })
})

// // ✅ Test mailer endpoint
// router.get('/testmailer/:email', async (req, res) => {
//   const { email } = req.params;
//   const code = Math.floor(100000 + Math.random() * 900000);

//   try {
//     const isSent = await mailer(email, code);
//     if (isSent) {
//       return res.json({
//         ok: true,
//         message: `Mailer test passed. OTP sent to ${email}.`,
//         code: code
//       });
//     } else {
//       return res.status(500).json({
//         ok: false,
//         message: 'Mailer test failed. Email not sent.'
//       });
//     }
//   } catch (err) {
//     console.error("Test mailer error:", err);
//     return res.status(500).json({
//       ok: false,
//       message: 'Mailer test error',
//       error: err
//     });
//   }
// });

router.get('/testmailer/:email', async (req, res) => {
  const { email } = req.params;
  const code = Math.floor(100000 + Math.random() * 900000);

  try {
    const isSent = await mailer(email, code);
    if (isSent) {
      return res.json({
        ok: true,
        message: `Mailer test passed. OTP sent to ${email}.`,
        code: code
      });
    } else {
      return res.status(500).json({
        ok: false,
        message: 'Mailer test failed. Email not sent.'
      });
    }
  } catch (err) {
    console.error("Test mailer error:", err);
    return res.status(500).json({
      ok: false,
      message: 'Mailer test error',
      error: err.message  // ✅ show actual error message
    });
  }
});


module.exports = router;