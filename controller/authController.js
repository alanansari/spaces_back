const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require('../model/userModel');
const {Auth} = require('two-step-auth');
const { findOne } = require("../model/userModel");
require('dotenv').config();

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
            const expiresat = Date.now() + 120000;

            const token=await jwt.sign({user_name},
              process.env.jwtsign)

            // encrypting password
              const encryptedPassword = await bcrypt.hash(password, 12);

            // Create new user in database
            const user = await User.create({
            user_name,
            email: email.toLowerCase(), // convert email to lowercase
            password: encryptedPassword,
            email_verify: false,
            mailedOTP: mailedOTP.toString(),
            expiryOTP : expiresat,
            token,
            });

            // return new user
            res.status(201).json({sucess:true,token:token,msg:`Welcome to spaces! ${user_name}. Check your mail`});

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
      const {otp} = req.body;
    
    const token=req.params.token;
    
      const user=await User.findOne({token});

      if (!user) return res.status(409).json({sucess:false,msg:"Invalid account"});
    if(user.expiryOTP>=Date.now()){

    if(user.mailedOTP===otp){
      res.status(200).json({success:true,msg:'OTP Verified!',token:token});
      const emailstatus=User.updateOne({token},{
        $set:{
          email_verify:true,
          expiryOTP: Date.now(),
          tokenexpire:Date.now()+120000
        }
      })
    }else{
      res.status(400).json({success:false,msg:'Wrong OTP entered.'});
    }
     
  }
  else{
    res.status(400).json({success:false,msg:'OTP expired'});
  }
}
  catch(err){
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

    const user =await User.findOne({email});

    if (!user) return res.status(409).json({sucess:false,msg:"Invalid account"});
    
    sendotp(email);

    let mailedOTP2;
    const tokenexpire=Date.now()+3600000
    const otpexpire=Date.now()+120000

    async function sendotp(emailId){
      const result =  await Auth(emailId, "Spaces");
      if(result.success==true){
        console.log('mail sent.');
        mailedOTP2 = result.OTP;

        const updated=await User.updateOne({email},{
          $set:{
            tokenexpire,
            expiryotp:otpexpire,
            mailedOTP:mailedOTP2
          }
        })
      }
      else{
        return res.status(400).json({sucess: false,msg:'OTP not sent'}); 
      }
    }
      return res.status(200).json({sucess: true,msg:'OTP sent',token:user.token});
      

   }
   catch(err){
    console.log(err);
   }
}


const changepassword=async (req,res)=>{
    try{
      const {newpassword}=req.body;

    const token=req.params.token

      const user=await User.findOne({token});

      const tokenexpire=user.tokenexpire;

      if(tokenexpire>Date.now()){
         if (!user) return res.status(409).json({sucess:false,msg:"Invalid account"});
    
      const encpassword=await bcrypt.hash(newpassword,12)
      const updatepassword=user.updateOne({token},{
        $set:{
          password:encpassword
        }
      })
      return res.status(200).json({sucess: true,msg:'Password Changed Successfully'});
      

   }
   else{
    return res.status(200).json({sucess: true,msg:'Token expired'});
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