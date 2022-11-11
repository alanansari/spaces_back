const { findById } = require('../model/postModel');
const jwt = require("jsonwebtoken");
const User = require('../model/userModel');
const Post = require('../model/postModel');
const subSpace = require('../model/subspaceModel');
const fs = require('fs');

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
        return res.status(400).json(err);
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
    
        return res.status(200).json({success:true,msg:'Posted!'});

    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
}

const getpost = async (req,res) => {
    try{
        const postId = req.params.id;
        
        const post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({success:false,msg:'Post not found.'});
        }

        return res.status(200).json(post);

    } catch(err) {
        console.log(err);
        return res.status(400).json(err);
    }
}


const getfeed = async (req,res) => {
    try {
        const topcomm = await subSpace.find().sort({members:-1}).limit(5);
        const posts = await Post.find().sort({createdAt:-1}).limit(10);
        return res.status(200).json({topcomm,posts});
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
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
        const imgpath = user.displaypic;

        const topcomm = await subSpace.find().sort({members:-1}).limit(5);

        const posts = await Post.find({subspace:{$in:user.mysubspaces}}).sort({createdAt:-1}).limit(20);

        const upvoted = [],downvoted=[];

        for(let i=0;i<posts.length;i++){
            let bool = false;
            for(let j=0;j<user.upvotes.length;j++){
                if(posts[i]._id.toString()===user.upvotes[j].toString()){
                    bool = true;
                }
            }
            upvoted.push(bool);
        }
        
        for(let i=0;i<posts.length;i++){
            let bool = false;
            for(let j=0;j<user.downvotes.length;j++){
                if(posts[i]._id.toString()===user.downvotes[j].toString()){
                    bool = true;
                }
            }
            downvoted.push(bool);
        }

        return res.status(200).json({user_name,imgpath,mysubspaces,topcomm,posts,upvoted,downvoted});
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
}

const getmoreposts = async (req,res) => {
    try {
        const {num} = req.body;
        const posts = await Post.find().sort({createdAt:-1}).skip(10*num).limit(10);

        const upvoted = [],downvoted=[];

        let token=req.headers['accesstoken'] || req.headers['authorization'];
        
        if(token){

            token = token.replace(/^Bearer\s+/, "");

            const decode=await jwt.decode(token,"jwtsecret");
            const user_name=decode.user_name;
            const user = await User.findOne({user_name});

            for(let i=0;i<posts.length;i++){
                let bool = false;
                for(let j=0;j<user.upvotes.length;j++){
                    if(posts[i]._id.toString()===user.upvotes[j].toString()){
                        bool = true;
                    }
                }
                upvoted.push(bool);
            }

            for(let i=0;i<posts.length;i++){
                let bool = false;
                for(let j=0;j<user.downvotes.length;j++){
                    if(posts[i]._id.toString()===user.downvotes[j].toString()){
                        bool = true;
                    }
                }
                downvoted.push(bool);
            }

        }

        return res.status(200).json(posts,upvoted,downvoted);
    } catch (err) {
        console.log(err);
        return res.status(400).json(err);
    }
}

const upvote=async (req,res)=>{
    try{
        const _id=req.body._Id;
        const result =  await Post.updateOne({_id},{
            $inc:{
                votes:1
            }
        });
       if(!result) return res.status(404).json({success:false,msg:'Post not found.'});
       else {
            const user= await User.findOneAndUpdate({ _id:req.user._id }, { 
                $addToSet: { upvotes:req.body._Id},
                $pull: { downvotes:req.body._Id}
            });
            if(!user) return res.status(404).json({success:false,msg:'User not found.'});
            return res.status(200).json({success:true,msg:"Upvoted comment."});
        }
    }   catch(err) {
        console.log(err);
        return res.status(400).json(err);
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
       const user= await User.findOneAndUpdate({ _id:req.user._id }, { $pull: { upvotes:req.body._Id} });
     if(!user) return res.status(404).json({success:false,msg:'Post not found.'});
     else res.status(200).json({success:true,msg:result});
    }catch(err)
    {
        console.log(err);
        return res.status(400).json(err);
    }
}
const downvote=async (req,res)=>{
    try{
        const _id=req.body._Id;
        const result =  await Post.updateOne({_id},{
            $inc:{
                votes:-1
            }
        });
        if(!result.acknowledged){ 
            return res.status(404).json({success:false,msg:'Post not found.'});
        } else {
            const user= await User.findOneAndUpdate({ _id:req.user._id }, {
                    $addToSet: {downvotes:_id},
                    $pull: { upvotes:_id}
                });
            if(!user) return res.status(404).json({success:false,msg:'Post not found.'});
            return res.status(200).json({success:true,msg:result});
        }
    }  catch(err) {
        console.log(err);
        return res.status(400).json(err);
    }
}
        
const undownvote=async (req,res)=>{
    try{
        const _id=req.body._Id;
    const result =  await Post.updateOne({_id},{
           $inc:{
            votes:1
           }
       });
       if(!result) return res.status(404).json({success:false,msg:'Post not found.'});
       else {
       const user= await User.findOneAndUpdate({ _id:req.user._id }, {
            $pull: { downvotes:req.body._Id} 
        });
        if(!user) return res.status(404).json({success:false,msg:'Post not found.'});
        return res.status(200).json({success:true,msg:result});
        }
    } catch(err) {
        console.log(err);
        return res.status(400).json(err);
    }
}

const dltpost=async (req,res)=>{
    try{
        const _id = req.params.id;
        let post = await Post.findById(_id);
        if(!post){
            return res.status(404).json({success:true,msg:"Post to be deleted not found"});
        }
        if(req.user.user_name!==post.author){
            return res.status(400).json({success:false,msg:"You are not the creator of this post."});
        }
        if(post.imgpath!=null){
            fs.unlinkSync('./'+post.imgpath);
        }
        post=await Post.deleteOne({_id});
        if(!post){
            return res.status(404).json({success:true,msg:"Post to be deleted not found"});
        }
        
        return res.status(200).json({success:true,msg:"Post deleted"});
    
    }
    catch(err)
    {
        console.log(err);
        return res.status(400).json(err);
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