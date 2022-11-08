const subSpace = require('../model/subspaceModel');
const User = require('../model/userModel');
const Post = require('../model/postModel');

const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

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

        const oldspace = await subSpace.findOne({name});

        if(oldspace) return res.status(400).json({success:false,msg:`${name} is already taken.`});

        let filepath = null;

        if(req.file !== undefined){
            filepath = 'uploads/' + req.file.filename;
        }

        const space = await subSpace.create({
            admin: user.user_name,
            name,
            about,
            rules,
            imgpath: filepath,
            createdAt: Date.now()
        });

        const becomemem = await subSpace.findOneAndUpdate({name},{
            $push:{members:req.user._id}
        },{new:true}).exec((err,result)=>{
            if(err){
                return res.status(400).json({success:false,msg:"Not able to add user to subspace"});
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


const viewsubspace = async (req,res) => {
    try {
        const name = req.params.subspace;
        const subspace = await subSpace.findOne({name});
        const posts = await Post.find({name});
        return res.status(200).json({subspace,posts});
    } catch (err) {
        
        console.log(err);
        return res.status(400);
    }
}


const follow= async (req,res)=>{
    console.log(req.user._id)
    const result=await subspace.findByIdAndUpdate(req.body._Id,
        {   $push:{members:req.user._id}},
            {new:true})
        if(!result) return res.status(404).json({success:false,msg:'Post not found.'})
        else res.status(200).json({success:true,msg:result})
}

const unfollow= async (req,res)=>{
const result=await subspace.findByIdAndUpdate(req.body._Id,
    {   $pull:{members:req.user._id}},
        {new:true})
    if(!result) return res.status(404).json({success:false,msg:'Post not found.'})
    else res.status(200).json({success:true,msg:result})
}


module.exports = {
    newsubspace,
    viewsubspace,
    follow,
    unfollow
}