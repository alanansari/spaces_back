const jwt = require("jsonwebtoken");

const authverifytoken=async (req,res,next)=>{
    let token=req.headers['accesstoken'] || req.headers['authorization'];
    token = token.replace(/^Bearer\s+/, "");
  
    if(!token)
      return res.status(409).json({sucess:false,msg:"Invalid account1"});
    else{
        const verify = await jwt.verify(token,process.env.jwtsecretkey1,(err,payload)=>{
        if(err){
          return res.status(409).json({sucess:false,msg:"Invalid account2"});  
        }
          const {_id}=payload;
          User.findById(_id).then(userdata=>{
            req.user=userdata
            next()
          })
    }) 
    }
  
  }
  module.exports={
    authverifytoken
  }