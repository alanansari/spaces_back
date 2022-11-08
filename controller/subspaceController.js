const subspace = require('../model/subspaceModel');
const User = require('../model/userModel');
const jwt = require('jsonwebtoken');

const newsubspace = async (req,res) => {

    try{
        const {name,about,rules} = req.body;

        if(!name||!about){
            return res.status(400).json({success:false,msg:'Fill all input fields!'});
        }


        let token=req.headers['accesstoken'] || req.headers['authorization'];
        token = token.replace(/^Bearer\s+/, "");

        const decode=await jwt.decode(token,"jwtsecret");
        const user_name=decode.user_name;
        const user = await User.findOne({user_name});


        if(!user)
            return res.status(400).json({success:false,msg:'User not found!'});

        const oldspace = await subspace.findOne({name});

        if(oldspace) return res.status(400).json({success:false,msg:`${name} is already taken.`});

        let filepath = null;

        if(req.file !== undefined){
            filepath = 'uploads/' + req.file.filename;
        }

        const space = await subspace.create({
            admin: user.user_name,
            name,
            about,
            rules,
            imgpath: filepath,
            createdAt: Date.now()
        });

        const becomemem = await subspace.findOneAndUpdate({name},{
            $push:{members:req.user._id}
        },{new:true}).exec((err,result)=>{
            if(err){
                return res.status(400).json({success:false,msg:"Not able to add user to subspace"});
            }
            else{
                return res.status(200).json({success:true,msg:`Added member`});
            }
        });

        const addspace = await User.findOneAndUpdate({user_name},{
            $push:{mysubspaces:name}
        },{new:true}).exec((err,result)=>{
            if(err){
                return res.status(400).json({success:false,msg:"Not able to add to user's subspaces"});
            }
            else{
                return res.status(200).json({success:true,msg:`created subspace ${name}`});
            }
        });

        
    } catch (err){
        console.log(err);
    }
}


module.exports = {
    newsubspace
}