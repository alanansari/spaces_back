const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require('../model/userModel');
const {Auth} = require('two-step-auth');
const { findOne } = require("../model/userModel");
const regexval = require("../middleware/validate");

const signup = async (req,res)=>{
    try{
        //get user input
        const {user_name,email,password} = req.body;

        if (!(user_name && email && password)) {
          return res.status(400).send("All inputs are required");
        }

        if(!regexval.validatemail(email)){
          return res.status(400).send("Incorrect Email Format.");
        }

        if(!regexval.validatepass(password)){
          return res.status(400).send("Incorrect Password Format.");
        }

        // check if user email already exists
        const oldMail = await User.findOne({ email:email.toLowerCase() });

        if (oldMail&&oldMail.email_verify==true&&oldMail.email_verify==true) {
            return res.status(409)
              
              .json({sucess:false,msg:"User with this Email ID Already Exists."});
        }
        // check if username already exist
        const oldUser = await User.findOne({ user_name });

        if (oldUser&&oldUser.email_verify==true&&oldUser.email_verify==true) {
            return res.status(409).send({sucess:false,msg:"Username Already Exists."});
        }

        // email verification
        login(email);

        let mailedOTP;
        const token=jwt.sign({user_name},process.env.jwtsecretkey1,{expiresIn:"2h"})
        async function login(emailId){
          const result =  await Auth(emailId, "Spaces");
          if(result.success==true){
            console.log('mail sent.');
            mailedOTP = result.OTP;
            const expiresat = Date.now() + 300000;
            // encrypting password
              const encryptedPassword = await bcrypt.hash(password, 12);

            // Create new user in database
            if(!oldMail){
              const user = await User.create({
              user_name,
              email: email.toLowerCase(), // convert email to lowercase
              password: encryptedPassword,
              email_verify: false,
              mailedOTP : mailedOTP.toString(),
              expiryOTP : expiresat,
              token
              });
            }else{
              const emailstatus= await User.updateOne({email},{
                $set:{
                  user_name,
                  password: encryptedPassword,
                  mailedOTP : mailedOTP.toString(),
                  expiryOTP : expiresat
                }
              });
          }

            // return new user
            return res.status(201).json({sucess:true,token:token,msg:`Welcome to spaces! ${user_name}. Check your mail`});

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
    if (!otp) {
      res.status(400).send("Input is required");
    }
    const token=req.headers["accesstoken"]
    const decode=await jwt.decode(token,"jwtsecret")
    const user_name=decode.user_name
    const user = await User.findOne({user_name});

    if(!user) return res.status(400).json({success:false,msg:'user not found by the given mail'});

    if(user.mailedOTP===otp && user.expiryOTP > Date.now()){
      const emailstatus= await User.updateOne({user_name},{
        $set:{
          email_verify:true,
          expiryOTP: Date.now()
        }
      });
      return res.status(200).json({success:true,msg:'OTP Verified!',token:user.token});
    }else if(user.mailedOTP===otp && user.expiryOTP <= Date.now()){
      return res.status(400).json({success:false,msg:'This OTP has expired'});
    }
    else{
      return res.status(400).json({success:false,msg:'Wrong OTP entered.'});
    }
     
  }catch(err){
    console.log(err);
  }
}

const login = async (req, res) => {
    try {
      const { email, password } = req.body;

      // validation for email and password inputs
      if (!(email && password)) {
        res.status(400).send("All inputs are required");
      }
      const user = await User.findOne({ email:email.toLowerCase() });

        if (!user||user.email_verify == false) return res.status(409)
            .json({sucess:false,msg:"This email doesn't have an account"});

      const token=jwt.sign({user_name:user.user_name},process.env.jwtsecretkey1,{expiresIn:"2h"})
      const updated=await User.updateOne({email},{
        $set:{
          token
        }
      });
      

        const result = await bcrypt.compare(password, user.password);

        if (!result) return res.status(409).json({sucess:false,msg:"Wrong Password"});

        return res.status(200).json({sucess: true,msg:`Welcome back! ${user.user_name}`,token});
  } catch (err) {
    console.log(err);
  }
}

const forgotpassword=async (req,res)=>{
  try{
    const {email}=req.body;

    if (!email) {
      res.status(400).send("Input is required");
    }

    const user =await User.findOne({email:email.toLowerCase()});

    if (!user||user.email_verify==false) return res.status(409)
      .json({sucess:false,msg:"This email doesn't have an account"});

    sendotp(email);

    let mailedOTP2;


    async function sendotp(emailId){
      const result =  await Auth(emailId, "Spaces");
      if(result.success==true){
        console.log('mail sent.');
        mailedOTP2 = result.OTP;
        const expiresat = Date.now() + 300000;
        const token=jwt.sign({user_name:user.user_name},process.env.jwtsecretkey1,{expiresIn:"2h"})
        const updated=await User.updateOne({email:email.toLowerCase()},{
          $set:{
            mailedOTP:mailedOTP2.toString(),
            expiryOTP: expiresat,
            token
          }
        });

        return res.status(200).json({sucess: true,msg:'OTP sent',token:token});
      } else{
        return res.status(400).json({sucess: false,msg:'OTP not sent'}); 
      }
    } 
   }
   catch(err){
    console.log(err);
   }
}


const changepassword=async (req,res)=>{
  try{
    const {newpassword}=req.body;

    if (!( newpassword)) {
      res.status(400).send("All inputs are required");
    }

    if(!regexval.validatepass(newpassword)){
      return res.status(400).send("Incorrect Password Format.");
    }
    
    const token=req.headers["accesstoken"]
    const decode=await jwt.decode(token,"jwtsecret")
    const user_name=decode.user_name
    const user = await User.findOne({user_name});

    if (!user) return res.status(409).json({sucess:false,msg:"This email doesn't have an account"});

    if(user.expiryOTP+180000<=Date.now()){
      return res.status(409).json({sucess:false,msg:"Verify OTP again to change password session expired."});
    }
    
      const encpassword=await bcrypt.hash(newpassword,12)
      const updatepassword=user.updateOne({user_name},{
        $set:{
          password:encpassword,
          expiryOTP:Date.now()-180000
        }
      })
      return res.status(200).json({sucess: true,msg:'Password Changed Successfully'});
      

   }

   catch(err){
    console.log(err);
   }
}
const authverifytoken=async (req,res,next)=>{
  const token=req.headers['accesstoken'];
  if(!token)
    return res.status(409).json({sucess:false,msg:"Invalid account1"});
  else{
    try{
      const verify=await jwt.verify(token,process.env.jwtsecretkey1)
      next()
  }
  catch(err){
    return res.status(409).json({sucess:false,msg:"Invalid account2"});  
  }

}

}

const resendotp=async (req,res)=>{
  try{
    const token=req.headers["accesstoken"]
    const decode=await jwt.decode(token,"jwtsecret")
    const user_name=decode.user_name
    const user = await User.findOne({user_name});
    const email=user.email

    sendotp(email);
    let mailedOTP2;


    async function sendotp(emailId){
      const result =  await Auth(emailId, "Spaces");
      if(result.success==true){
        console.log('mail sent.');
        mailedOTP2 = result.OTP;
        console.log(mailedOTP2);
        const expiresat = Date.now() + 300000;
        const token=jwt.sign({user_name},process.env.jwtsecretkey1,{expiresIn:"2h"})
        const updated=await User.updateOne({email},{
          $set:{
            mailedOTP:mailedOTP2.toString(),
            expiryOTP: expiresat,
            token
          }
        });

        return res.status(200).json({sucess: true,msg:'OTP sent',token:token});
  }}
}
  catch(error){
    console.log(error); 
    return res.status(400).json({sucess: false,msg:'OTP not sent'});
  }
}

module.exports = {
    signup,
    login,
    sverify,
    forgotpassword,
    changepassword,
    authverifytoken,
    resendotp
}