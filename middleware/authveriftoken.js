const jwt = require("jsonwebtoken");
const User = require('../model/userModel');

const mongoose = require('mongoose');

const authverifytoken=async (req,res,next)=>{
  try{
    let token=req.headers['accesstoken'] || req.headers['authorization'];
    token = token.replace(/^Bearer\s+/, "");
    if(!token)
      return res.status(409).json({sucess:false,msg:"Invalid account1"});
    else{
      const verify=await jwt.verify(token,process.env.jwtsecretkey1,async (err,payload)=>{
        if(err){
          return res.status(409).json({sucess:false,msg:"Invalid account2"});  
        }
        const {user_name}=payload;
        const user=await User.findOne({user_name});
        req.user=user;
        next();
      });
    }
    } catch(err){
        return res.status(409).json({success:false,msg:"No Token Found"});
    }
  }
  module.exports={
    authverifytoken
  }