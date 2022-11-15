const jwt = require("jsonwebtoken");
const User = require('../model/userModel');

const mongoose = require('mongoose');

const authverifytoken=async (req,res,next)=>{
  try{
    let token=req.headers['accesstoken'] || req.headers['authorization'];
    
    if(!token)
      return res.status(409).json({sucess:false,msg:"Please login/signup before proceeding"});
    else{
      token = token.replace(/^Bearer\s+/, "");
      const verify=await jwt.verify(token,process.env.jwtsecretkey1,async (err,payload)=>{
        if(err){
          return res.status(409).json({sucess:false,msg:"Invalid account"});  
        }
        const {user_name}=payload;
        const user=await User.findOne({user_name});
        req.user=user;
        next();
      });
    }
    } catch(err){
        return res.status(409).json({success:false,msg: err.message });
    }
  }
  module.exports={
    authverifytoken
  }