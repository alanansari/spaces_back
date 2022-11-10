const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require('../model/userModel');
const {Auth} = require('two-step-auth');
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
            return res.status(201).json({sucess:true,msg:`Welcome to spaces! ${user_name}. Check your mail`});

          }else{
            console.log('mail not sent.');
          }
        }

    } catch (err) {
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


        const result = await bcrypt.compare(password, user.password);

        if (!result) return res.status(409).json({sucess:false,msg:"Wrong Password"});

        const token=jwt.sign({user_name:user.user_name},process.env.jwtsecretkey1,{expiresIn:"5h"})
      const updated=await User.updateOne({email},{
        $set:{
          token
        }
      });

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
        const token=jwt.sign({user_name:user.user_name},process.env.jwtsecretkey1,{expiresIn:"5h"})
        const updated=await User.updateOne({email:email.toLowerCase()},{
          $set:{
            mailedOTP:mailedOTP2.toString(),
            expiryOTP: expiresat,
            token
          }
        });

        return res.status(200).json({sucess: true,msg:'OTP sent'});
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

    // if(!regexval.validatepass(newpassword)){
    //   return res.status(400).send("Incorrect Password Format.");
    // }
    
    const user_name=req.user.user_name;
    const user = await User.findOne({user_name});

    if (!user) return res.status(409).json({sucess:false,msg:"This email doesn't have an account"});

    
      const encpassword=await bcrypt.hash(newpassword,12)
      const updatepassword= await user.updateOne({user_name},{
        $set:{
          password:encpassword,
        }
      });
      return res.status(200).json({sucess: true,msg:'Password Changed Successfully'});
      

   }

   catch(err){
    console.log(err);
   }
}

const fverify = async (req,res) => {
  try{
    const {email,otp} = req.body;
    if (!otp) {
      res.status(400).send("Input is required");
    }
    const user = await User.findOne({email});

    if(!user) return res.status(400).json({success:false,msg:'user not found by the given mail'});
    const token=jwt.sign({user_name:user.user_name},process.env.jwtsecretkey1,{expiresIn:"5h"})
    if(user.mailedOTP===otp && user.expiryOTP > Date.now()){
      const emailstatus= await User.updateOne({email},{
        $set:{
          expiryOTP: Date.now(),
          token
        }
      });
      return res.status(200).json({success:true,msg:'OTP Verified!',token:token});
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

const sverify = async (req,res) => {
  try{
    const {email,otp} = req.body;
    if (!otp) {
      res.status(400).send("Input is required");
    }
    const user = await User.findOne({email});

    if(!user) return res.status(400).json({success:false,msg:'user not found by the given mail'});
    const token=jwt.sign({user_name:user.user_name},process.env.jwtsecretkey1,{expiresIn:"5h"});
    if(user.mailedOTP===otp && user.expiryOTP > Date.now()){
      const emailstatus= await User.updateOne({email},{
        $set:{
          expiryOTP: Date.now(),
          token,
          email_verify:true
        }
      });
      return res.status(200).json({success:true,msg:'OTP Verified!',token:token});
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

const resendotp=async (req,res)=>{
  try{
    const {email}=req.body
    const user = await User.findOne({email});

    sendotp(email);
    let mailedOTP2;


    async function sendotp(emailId){
      const result =  await Auth(emailId, "Spaces");
      if(result.success==true){
        console.log('mail sent.');
        mailedOTP2 = result.OTP;
        console.log(mailedOTP2);
        const expiresat = Date.now() + 300000;
        const updated=await User.updateOne({email},{
          $set:{
            mailedOTP:mailedOTP2.toString(),
            expiryOTP: expiresat
          }
        });

        return res.status(200).json({sucess: true,msg:'OTP sent'});
  }}
}
  catch(error){
    console.log(error); 
    return res.status(400).json({sucess: false,msg:'OTP not sent'});
  }
}

const editpage = async(req,res)=>{
  try {
    
  } catch (err) {
    
  }
}


const updatename=async (req,res)=>{
  try{
  const {user_name,password}=req.body;
  if(!user_name)
  {
    return res.status(400).json({sucess: false,msg:'Username required'});
  }
  if(!password)
  {
    return res.status(400).json({sucess: false,msg:'Password required'});
  }
    const user_namecheck=await User.findOne({user_name});
    if(user_namecheck)
    {
      return res.status(400).json({sucess: false,msg:'Username already exists'});
    }
    const result = await bcrypt.compare(password, req.user.password);

    if (!result) return res.status(409).json({sucess:false,msg:"Wrong Password"});

    const token=jwt.sign({user_name:user_name},process.env.jwtsecretkey1,{expiresIn:"5h"})

    const user=await User.updateOne({user_name:req.user.user_name},{
      $set:{
        user_name,
        token
      }
    })
   if(user)     
  return res.status(200).json({success:true,msg:'Username changed',token:token});
   }
  catch(err)
  {
    console.log(err);
  }
}
const emailupdate=async (req,res)=>{
  try{
  const {email}=req.body;
  if(!email)
  {
    return res.status(400).json({sucess: false,msg:'Email required'});    
  }
  const emailcheck=await User.findOne({email});
  if(emailcheck)
  {
    return res.status(400).json({sucess: false,msg:'This email already has an account'}); 
  }
  sendotp(email);
  let mailedOTP2;


  async function sendotp(emailId){
    const result =  await Auth(emailId, "Spaces");
    if(result.success==true){
      console.log('mail sent.');
      mailedOTP2 = result.OTP;
      console.log(mailedOTP2);
      const expiresat = Date.now() + 300000;
      const updated=await User.updateOne({user_name:req.user.user_name},{
        $set:{
          mailedOTP:mailedOTP2.toString(),
          expiryOTP: expiresat
        }
      });

      return res.status(200).json({sucess: true,msg:'OTP sent'});
}}
}

catch(err)
{
  console.log(err);
}
}

const emailupdateotp=async (req,res)=>{
  try{
    const {email,otp}=req.body;
    if (!otp) {
      res.status(400).send("Input is required");
    }
    const user=await User.findOne({user_name:req.user.user_name})
    if(user.mailedOTP===otp && user.expiryOTP > Date.now()){
      const emailstatus= await User.updateOne({user_name:req.user.user_name},{
        $set:{
          expiryOTP: Date.now(),
          email
        }
      });
      return res.status(200).json({success:true,msg:'OTP Verified!'});
    }else if(user.mailedOTP===otp && user.expiryOTP <= Date.now()){
      return res.status(400).json({success:false,msg:'This OTP has expired'});
    }
    else{
      return res.status(400).json({success:false,msg:'Wrong OTP entered.'});
    }
  }
  catch(err)
  {
    console.log(err);
  }
}

const imageupdate=async (req,res)=>{
  try{
    let filepath = null;

    if(req.file !== undefined){
        filepath = 'uploads/profile/' + req.file.filename;
    }
    const user = await User.updateOne({_id:req.user._id},{
      displaypic:filepath   
  });
  return res.status(200).json({success:true,msg:'Profile Pic Added'});

  }
  catch(err)
  {
    console.log(err);
    return res.status(400).json(err);
  }
}


module.exports = {
    signup,
    login,
    sverify,
    forgotpassword,
    changepassword,
    resendotp,
    fverify,
    emailupdate,
    emailupdateotp,
    updatename,
    editpage,
    imageupdate
}