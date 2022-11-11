const jwt = require("jsonwebtoken");
const User = require('../model/userModel');

const mongoose = require('mongoose');

const authverifytoken=async (req,res,next)=>{
  try{
    let token=req.headers['accesstoken'] || req.headers['authorization'];
    token = token.replace(/^Bearer\s+/, "");
    if(!token)
      return res.status(400).json({sucess:false,msg:"Token required"});
    else{
      const verify=await jwt.verify(token,process.env.jwtsecretkey1,async (err,payload)=>{
        if(err){
          return res.status(401).json({sucess:false,msg:"You are not authorized"});  
        }
        const {user_name}=payload;
        const user=await User.findOne({user_name});
        if(!user)
        {
          return res.status(404).json({success:false,msg:"User not found"});
        }
        req.user=user;
        next();
      });
    }
    } catch(err){
        return res.status(400).json({success:false,msg:"No Token Found"});
    }
  }
  module.exports={
    authverifytoken
  }