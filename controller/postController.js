const { findById } = require('../model/postModel');
const jwt = require("jsonwebtoken");
const User = require('../model/userModel');
const Post = require('../model/postModel');
const subSpace = require('../model/subspaceModel');

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
            createdAt: Date.now()
        });
    
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
    const result =  await Post.findByIdAndUpdate(req.body._Id,{
           $push:{upvotes:req.user._id},
           $pull:{unupvotes:req.user._id}
       },{new:true})
     if(!result) return res.status(404).json({success:false,msg:'Post not found.'})
     else res.status(200).json({success:true,msg:result})
}

const unupvote=async (req,res)=>{
   const result=await Post.findByIdAndUpdate(req.body._Id,{
        $pull:{upvotes:req.user._id}},
        {new:true})
        if(!result) return res.status(404).json({success:false,msg:'Post not found.'})
        else res.status(200).json({success:true,msg:result})
    }

    const downvote=async (req,res)=>{
      const result=await  Post.findByIdAndUpdate(req.body._Id,{
            $push:{downvotes:req.user._id},
            $pull:{upvotes:req.user._id}},{
                 new:true
            })    
             if(!result) return res.status(404).json({success:false,msg:'Post not found.'})
            else res.status(200).json({success:true,msg:result})
    }
        
    const undownvote=async (req,res)=>{
      const result= await Post.findByIdAndUpdate(req.body._Id,{
            $pull:{downvotes:req.user._id}},
               {
                    new:true
                })    
                if(!result) return res.status(404).json({success:false,msg:'Post not found.'})
                else res.status(200).json({success:true,msg:result})
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
    undownvote
}