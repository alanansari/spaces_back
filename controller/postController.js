const { findById } = require('../model/postModel');
const jwt = require("jsonwebtoken");
const User = require('../model/userModel');
const Post = require('../model/postModel');
const subSpace = require('../model/subspaceModel');
const fs = require('fs');
require('dotenv').config();
const jwtsecret = process.env.jwtsecretkey1;


const postform = async(req,res)=>{
    try {
        let token=req.headers['accesstoken'] || req.headers['authorization'];
        token = token.replace(/^Bearer\s+/, "");

        const decode = await jwt.verify(token,jwtsecret);
        const user_name=decode.user_name;
        const user = await User.findOne({user_name});

        if (!user) return res.status(409).json({sucess:false,msg:"This username doesn't have an account"});

        return res.status(200).json(user.mysubspaces);
    } catch (err) {
        console.log(err);
        return res.status(400).json({success:false,msg:`${err}`});
    }
}

const newpost = async (req,res) => {
    try{
        const {subspace,heading,para} = req.body;

        let filepath = null;
        if(para==='') para=null;
        
        if(req.file !== undefined){
            filepath = 'uploads/' + req.file.filename;
        }


        let token=req.headers['accesstoken'] || req.headers['authorization'];
        token = token.replace(/^Bearer\s+/, "");

        const decode=await jwt.verify(token,jwtsecret);
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
        return res.status(400).json({success:false,msg:`${err}`});
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
        return res.status(400).json({success:false,msg:`${err}`});
    }
}


const getfeed = async (req,res) => {
    try {
        let topcomm = await subSpace.aggregate([
            {$unwind:"$members"},
            { 
             $group :{_id:'$_id',
             name:{ "$first": "$name" },
             members:{$sum:1},
             createdAt:{ "$first": "$createdAt" }}
            },
            {$sort:{members: -1,createdAt: -1}}
        ]).limit(5);

        const posts = await Post.find().sort({createdAt:-1}).limit(10);

        return res.status(200).json({topcomm,posts});
    } catch (err) {
        console.log(err);
        return res.status(400).json({success:false,msg:`${err}`});
    }
}

const getlogfeed = async (req,res) => {
    try {

        let token=req.headers['accesstoken'] || req.headers['authorization'];
        token = token.replace(/^Bearer\s+/, "");

        const decode=await jwt.verify(token,jwtsecret);
        const user_name=decode.user_name;
        const user = await User.findOne({user_name});
        const mysubspaces = user.mysubspaces;
        const imgpath = user.displaypic;

        let topcomm = await subSpace.aggregate([
            {$unwind:"$members"},
            { 
             $group :{_id:'$_id',
             name:{ "$first": "$name" },
             members:{$sum:1},
             createdAt:{ "$first": "$createdAt" }}
            },
            {$sort:{members: -1,createdAt: -1}}
        ]).limit(5);

        let posts = await Post.find({subspace:{$in:user.mysubspaces}}).sort({createdAt:-1}).limit(10);
        const restposts = await Post.find({subspace:{$nin:user.mysubspaces}}).sort({createdAt:-1}).limit(10);

        posts = posts.concat(restposts);
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
                    break;
                }
            }
            downvoted.push(bool);
        }    

        return res.status(200).json({user_name,imgpath,mysubspaces,topcomm,posts,upvoted,downvoted});
    } catch (err) {
        console.log(err);
        return res.status(400).json({success:false,msg:`${err}`});
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

            const decode=await jwt.verify(token,jwtsecret);
            const user_name=decode.user_name;
            const user = await User.findOne({user_name});

            for(let i=0;i<posts.length;i++){
                let bool = false;
                for(let j=0;j<user.upvotes.length;j++){
                    if(posts[i]._id.toString()===user.upvotes[j].toString()){
                        bool = true;
                        break;
                    }
                }
                upvoted.push(bool);
            }

            for(let i=0;i<posts.length;i++){
                let bool = false;
                for(let j=0;j<user.downvotes.length;j++){
                    if(posts[i]._id.toString()===user.downvotes[j].toString()){
                        bool = true;
                        break;
                    }
                }
                downvoted.push(bool);
            }

        }

        return res.status(200).json(posts,upvoted,downvoted);
    } catch (err) {
        console.log(err);
        return res.status(400).json({success:false,msg:`${err}`});
    }
}

const upvote=async (req,res)=>{
    try{
        const _id=req.body._Id;

        let arr = req.user.upvotes;
        let arr2 = req.user.downvotes;
        
        let upvoted = false,downvoted=false;
    
        for(let j=0;j<arr.length;j++){
            if(_id.toString()===arr[j].toString()){
                upvoted = true;
                break;
            }
        }

        for(let j=0;j<arr2.length;j++){
            if(_id.toString()===arr2[j].toString()){
                downvoted = true;
                break;
            }
        }
               
        if(upvoted===false){
            let incr = downvoted ? 2 : 1;
            const result =  await Post.updateOne({_id},{
                $inc:{
                    votes:incr
                }
            });

            if(!result) return res.status(404).json({success:false,msg:'Post not found.'});
        
            const user= await User.findOneAndUpdate({ _id:req.user._id }, { 
                $addToSet: { upvotes:req.body._Id},
                $pull: { downvotes:req.body._Id}
            });
            if(!user) return res.status(404).json({success:false,msg:'User not found.'});
            return res.status(200).json({success:true,msg:"Upvoted."});
        }

        return res.status(400).json({success:false,msg:"Already upvoted."});
        
    }   catch(err) {
        console.log(err);
        return res.status(400).json({success:false,msg:`${err}`});
    }
}

const unupvote=async (req,res)=>{
    try{
        const _id=req.body._Id;

        let arr = req.user.upvotes;

        let bool = false;
    
        for(let j=0;j<arr.length;j++){
            if(_id.toString()===arr[j].toString()){
                bool = true;
                break;
            }
        }

        if(bool===true){

            const result =  await Post.updateOne({_id},{
            $inc:{
                votes:-1
            }
            });

            const user= await User.findOneAndUpdate({ _id:req.user._id },
                { $pull: { upvotes:req.body._Id} }
            );

            if(!user) return res.status(404).json({success:false,msg:'Post not found.'});
            
            return res.status(200).json({success:true,msg:"Unupvoted."});
        }

        return res.status(400).json({success:false,msg:"Already Not Upvoted."});

    }catch(err){
        console.log(err);
        return res.status(400).json({success:false,msg:`${err}`});
    }
}
const downvote=async (req,res)=>{
    try{
        const _id=req.body._Id;

        let arr = req.user.downvotes;
        let arr2 = req.user.upvotes;
        
        let bool = false,upvoted = false;
    
        for(let j=0;j<arr.length;j++){
            bool = false
            if(_id.toString()===arr[j].toString()){
                bool = true;
                break;
            }
        }

        for(let j=0;j<arr2.length;j++){
            if(_id.toString()===arr2[j].toString()){
                upvoted = true;
                break;
            }
        }

        if(bool===false){

            let decr = upvoted ? -2 : -1;
            const result =  await Post.updateOne({_id},{
                $inc:{
                    votes:decr
                }
            });
            if(!result.acknowledged){ 
                return res.status(404).json({success:false,msg:'Post not found.'});
            }

                const user= await User.findOneAndUpdate({ _id:req.user._id }, {
                        $addToSet: {downvotes:_id},
                        $pull: { upvotes:_id}
                    });
                if(!user) return res.status(404).json({success:false,msg:'Post not found.'});
                return res.status(200).json({success:true,msg:"Downvoted"});
        }
        return res.status(400).json({success:true,msg:"Already Downvoted."});
    }  catch(err) {
        console.log(err);
        return res.status(400).json({success:false,msg:`${err}`});
    }
}
        
const undownvote=async (req,res)=>{
    try{
        const _id=req.body._Id;

        let arr = req.user.downvotes;
        
        let bool = false;
    
        for(let j=0;j<arr.length;j++){
            bool = false
            if(_id.toString()===arr[j].toString()){
                bool = true;
                break;
            }
        }

        if(bool===true){

            const result =  await Post.updateOne({_id},{
                $inc:{
                    votes:1
                }
            });

            if(!result) return res.status(404).json({success:false,msg:'Post not found.'});
        
            const user= await User.findOneAndUpdate({ _id:req.user._id }, {
                $pull: { downvotes:req.body._Id} 
            });
            if(!user) return res.status(404).json({success:false,msg:'Post not found.'});

            return res.status(200).json({success:true,msg:"Undownvoted"});
        }
        return res.status(400).json({success:false,msg:"Already Not Downvoted"});
    } catch(err) {
        console.log(err);
        return res.status(400).json({success:false,msg:`${err}`});
    }
}

const dltpost=async (req,res)=>{
    try{
        const _id = req.params.id;
        let post = await Post.findById(_id);
        if(!post){
            return res.status(404).json({success:true,msg:"Post to be deleted not found"});
        }

        const subspace = post.subspace;
        const sub = await subSpace.findOne({subspace});


        if(req.user.user_name!==post.author&&req.user.user_name!==sub.admin){
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
        return res.status(400).json({success:false,msg:`${err}`});
    }
}
 
const myposts = async (req,res) => {
    try {
        const {user_name} = req.user;
        const num = req.query.num || 0;
        const myposts = await Post.find({author:user_name},{para:0,author:0}).sort({createdAt:-1});
        res.status(200).json({myposts});
    } catch (err) {
        return res.status(400).json({success:false,msg:`${err}`});
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
    dltpost,
    myposts
}