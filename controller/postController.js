const { findById } = require('../model/postModel');
const jwt = require("jsonwebtoken");
const User = require('../model/userModel');
const Post = require('../model/postModel');
const subSpace = require('../model/subspaceModel');
const mongoose = require('mongoose');

const postform = async(req,res)=>{
    try {
        let token=req.headers['accesstoken'] || req.headers['authorization'];
        token = token.replace(/^Bearer\s+/, "");

        const decode = await jwt.decode(token,"jwtsecret");
        const user_name=decode.user_name;
        const user = await User.findOne({user_name});

        if (!user) return res.status(409).json({sucess:false,msg:"This username doesn't have an account"});

        return res.status(200).json(user.mysubspaces);
    } catch (err) {
        console.log(err);
    }
}

const newpost = async (req,res) => {
    try{
        const {subspace,heading,para} = req.body;

        let filepath = null;

        if(req.file !== undefined){
            filepath = 'uploads/' + req.file.filename;
        }


        let token=req.headers['accesstoken'] || req.headers['authorization'];
        token = token.replace(/^Bearer\s+/, "");

        const decode=await jwt.decode(token,"jwtsecret");
        const user_name=decode.user_name;
        const user = await User.findOne({user_name});

        if (!user) return res.status(409).json({sucess:false,msg:"This username doesn't have an account"});

        const post = await Post.create({
            author:user_name,
            subspace,
            heading,
            para,
            imgpath : filepath,
            createdAt: Date.now(),
            votes:0
        });
        console.log(post);
        const addinsubspace=await subSpace.updateOne({name:subspace},{
            $push:{
                posts:post._id
            }
        })
        const addinuser=await User.updateOne({user_name:req.user.user_name},{
            $push:{
                myposts:post._id
            }
        })
    
        return res.status(200).json({success:true,msg:'Posted!'});

    } catch (err) {
        console.log(err);
    }
}

const getpost = async (req,res) => {
    try{
        const postId = req.params.id;
        
        const post = await Post.findById(postId).populate('comments').limit(10);

        if(!post){
            return res.status(404).json({success:false,msg:'Post not found.'});
        }

        return res.status(200).json(post);

    } catch(err) {
        console.log(err);
    }
}

const getfeed = async (req,res) => {
    try {
        const topcomm = await subSpace.find().sort({members:-1}).limit(5);
        const posts = await Post.find().sort({createdAt:-1}).limit(10);
        return res.status(200).json({topcomm,posts});
    } catch (err) {
        console.log(err);
    }
}

const getlogfeed = async (req,res) => {
    try {

        let token=req.headers['accesstoken'] || req.headers['authorization'];
        token = token.replace(/^Bearer\s+/, "");

        const decode=await jwt.decode(token,"jwtsecret");
        const user_name=decode.user_name;
        const user = await User.findOne({user_name});
        const mysubspaces = user.mysubspaces;

        const topcomm = await subSpace.find().sort({members:-1}).limit(5);

        const posts = await Post.find().sort({createdAt:-1}).limit(10);

        return res.status(200).json({user_name,mysubspaces,topcomm,posts});
    } catch (err) {
        console.log(err);
    }
}

const getmoreposts = async (req,res) => {
    try {
        const {num} = req.body;
        const posts = await Post.find().sort({createdAt:-1}).skip(10*num).limit(10);
        return res.status(200).json(posts);
    } catch (err) {
        console.log(err);
    }
}

const upvote=async (req,res)=>{
    try{
        const _id=req.body._Id;
    const result =  await Post.updateOne({_id},{
           $inc:{
            votes:1
           }
       })
       if(!result) return res.status(404).json({success:false,msg:'Post not found.'})
       else {


      const user= await User.findOneAndUpdate({ _id:req.user._id }, { $push: { upvotes:req.body._id} })
      if(!user) return res.status(404).json({success:false,msg:'User not found.'})
       return res.status(200).json({success:true,msg:result})
    }
}
    catch(err)
{
    console.log(err);
}
}

const unupvote=async (req,res)=>{
    try{
        const _id=req.body._Id;
    const result =  await Post.updateOne({_id},{
        $inc:{
            votes:-1
           }
       })
       if(!result) return res.status(404).json({success:false,msg:'Post not found.'})
       else {
       const user= await User.findOneAndUpdate({ _id:req.user._id }, { $pull: { upvotes:req.body._id} })
     if(!user) return res.status(404).json({success:false,msg:'Post not found.'})
     return res.status(200).json({success:true,msg:result})
       }
}
catch(err)
{
    console.log(err);
}
}
const downvote=async (req,res)=>{
    try{
        const _id=req.body._Id;
    const result =  await Post.updateOne({_id},{
           inc:{
            votes:-1
           }
       })
       if(!result) return res.status(404).json({success:false,msg:'Post not found.'})
       else {
       const user= await User.findOneAndUpdate({ _id:req.user._id }, { $push: { downvotes:req.body._id} })
     if(!user) return res.status(404).json({success:false,msg:'Post not found.'})
     return res.status(200).json({success:true,msg:result})
}
    }
catch(err)
{
    console.log(err);
}
}
        
const undownvote=async (req,res)=>{
    try{
        const _id=req.body._Id;
    const result =  await Post.updateOne({_id},{
           $inc:{
            votes:1
           }
       })
       if(!result) return res.status(404).json({success:false,msg:'Post not found.'})
       else {
       const user= await User.findOneAndUpdate({ _id:req.user._id }, { $pull: { downvotes:req.body._id} })
     if(!user) return res.status(404).json({success:false,msg:'Post not found.'})
     return res.status(200).json({success:true,msg:result})
}
    }
catch(err)
{
    console.log(err);
}
}

const dltpost=async (req,res)=>{
    try{
        const {_id}=req.body;
        const post=await Post.deleteOne({_id});
        if(post)
        {
            return res.status(200).json({success:true,msg:"Post deleted"})
        }
    }
    catch(err)
    {
        console.log(err);
    }
}
    

module.exports = {
    postform,
    newpost,
    getpost,
    getfeed,
    getlogfeed,
    getmoreposts,
    upvote,
    unupvote,
    downvote,
    undownvote,
    dltpost
}