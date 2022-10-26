const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require('../model/userModel');
const {Auth} = require('two-step-auth');
const { findOne } = require("../model/userModel");

const signup = async (req,res)=>{
    try{
        //get user input
        const {user_name,email,password} = req.body;

        // check if user email already exists
        const oldMail = await User.findOne({ email });

        if (oldMail) {
            return res.status(409).json({sucess:false,msg:"Email Already Exist."});
        }

        // check if username already exist
        const oldUser = await User.findOne({ user_name });

        if (oldUser) {
            return res.status(409).send({sucess:false,msg:"Username Already Exist."});
        }

        // email verification
        login(email);

        let mailedOTP;

        async function login(emailId){
          const result =  await Auth(emailId, "Spaces");
          if(result.success==true){
            console.log('mail sent.');
            mailedOTP = result.OTP;

            // encrypting password
              const encryptedPassword = await bcrypt.hash(password, 12);

            // Create new user in database
            const user = await User.create({
            user_name,
            email: email.toLowerCase(), // convert email to lowercase
            password: encryptedPassword,
            email_verify: false,
            mailedOTP
            });

            // return new user
            res.status(201).json({sucess:true,msg:`Welcome to spaces! ${user_name}. Check your mail`});

          }else{
            console.log('mail not sent.');
          }
        }

    } catch (err) {
      console.log(err);
    }
}

const sverify = async (req,res) => {
  try{
    const {email,otp} = req.body;

    const user = await User.findOne({email});

    if(!user) res.status(400).json({success:false,msg:'user not found by the given mail'});

    if(user.mailedOTP==otp){
      res.status(200).json({success:true,msg:'OTP Verified!'});
    }else{
      res.status(400).json({success:false,msg:'Wrong OTP entered.'});
    }
     
  }catch(err){
    console.log(err);
  }
}

const login = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

        if (!user) return res.status(409).json({sucess:false,msg:"This email doesn't have an account"});

        const result = await bcrypt.compare(password, user.password);

        if (!result) return res.status(409).json({sucess:false,msg:"Wrong Password"});

        return res.status(200).json({sucess: true,msg:`Welcome back! ${user.user_name}`});
  } catch (err) {
    console.log(err);
  }
}

const forgotpassword=async (req,res)=>{
  try{
    const {email}=req.body;

    var t=email;

    const user =await User.findOne({email});

    if (!user) return res.status(409).json({sucess:false,msg:"This email doesn't have an account"});
    
    sendotp(email);

    var mailedOTP2;

    async function sendotp(emailId){
      const result =  await Auth(emailId, "Spaces");
      if(result.success==true){
        console.log('mail sent.');
        mailedOTP2 = result.OTP;
        }
        const updated=await User.updateOne({email},{
          $set:{
            mailedOTP:mailedOTP2
          }
        })
      }
      

   }
   catch(err){
    console.log(err);
   }
}

const changepassword=async (req,res)=>{
  try{
    const {otp,newpassword}=req.body;
    
    const email=t

    const user =await User.findOne({email});

    if (!user) return res.status(409).json({sucess:false,msg:"This email doesn't have an account"});
    
    if(user.mailedOTP==otp){
      const encpassword=await bcrypt.hash(newpassword,12)
      const updatepassword=user.updateOne({email},{
        $set:{
          password:encpassword
        }
      })
      res.status(200).json({success:true,msg:'OTP Verified!'});
    }else{
      res.status(400).json({success:false,msg:'Wrong OTP entered.'});
      

   }
  }

   catch(err){
    console.log(err);
   }
}



module.exports = {
    signup,
    login,
    sverify,
    forgotpassword,
    changepassword

}