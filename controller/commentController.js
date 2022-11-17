const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const Comment = require('../model/commentModel');
const Post = require('../model/postModel');
require('dotenv').config();
const jwtsecret = process.env.jwtsecretkey1;

const comment = async(req,res)=>{
    try {
        const {postId,text} = req.body;

        if(!postId) return res.status(400).json({success:true,msg:'Give post id'});

        const post = Post.findById(postId);

        if(!post) return res.status(404).json({success:true,msg:'Post not found'});

        if(!text) return res.status(400).json({success:true,msg:'Give comment content'});

        let token=req.headers['accesstoken'] || req.headers['authorization'];
        token = token.replace(/^Bearer\s+/, "");

        const decode = await jwt.decode(token,jwtsecret);
        const user_name=decode.user_name;
        const user = await User.findOne({user_name});

        if (!user) return res.status(409).json({sucess:false,msg:"This username doesn't have an account"});

        const comment = await Comment.create({
            postId,
            author: user_name,
            text,
            createdAt: Date.now()
        });

        const appendcomm = await Post.findByIdAndUpdate(postId,{
            $addToSet:{comments:comment._id}
        });

        return res.status(200).json({success:true,msg:'Posted Comment'});
    } catch (err) {
        console.log(err);
        return res.status(400).json({success:false,msg:`${err}`});
    }
}

const getpostcomm = async(req,res) => {
    try {
        const postId = req.params.id;

        // const num = Number(req.params.num) || 0;
        // const post = await Post.findById(postId).populate('comments');

        // if(!post){
        //     return res.status(404).json({success:false,msg:'Post not found.'});
        // }

        // let {comments} = post;

        // comments.sort((a,b)=>b.votes-a.votes);

        // comments = comments.slice(num*10,num*10+10);

        const comment = await Comment.find({postId},{childId:0});

        return res.status(200).json(comment);

    } catch (err) {
        return res.status(400).json({success:false,msg:`${err}`});
    }
}

const replies = async (req,res) => {
    try {

        const commId = req.params.id;
        const num = Number(req.params.num) || 0;

        const comment = await Comment.findById(commId).populate('childId');

        if(!comment)
            return res.status(404).json({success:false,msg:'Comment not found.'});

        let comments = comment.childId;
        
        comments.sort((a,b)=>b.votes-a.votes);

        comments = comments.slice(num*10,num*10+10);

        return res.status(200).json({comments});
        
    } catch (err) {
        console.log(err);
        return res.status(400).json({success:false,msg:`${err}`});
    }
}

const reply = async (req,res) => {
    try {
        const commId = req.params.id;
        const {text} = req.body;
        

        if(!text) return res.status(400).json({success:true,msg:'Give comment content'});

        let token=req.headers['accesstoken'] || req.headers['authorization'];
        token = token.replace(/^Bearer\s+/, "");

        const decode = await jwt.decode(token,jwtsecret);
        const user_name=decode.user_name;
        const user = await User.findOne({user_name});

        if (!user) return res.status(400).json({sucess:false,msg:"This username doesn't have an account"});

        const parentcomm = await Comment.findById(commId);

        if (!parentcomm)
            return res.status(400).json({success:false,msg:"No comment found to reply to"});

        const postId = parentcomm.postId || 0;

        const comment = await Comment.create({
            author: user_name,
            parentId:commId,
            postId,
            text,
            createdAt: Date.now()
        });

        const appendcomm = await Comment.findByIdAndUpdate(commId,{
            $addToSet:{childId:comment._id}
        });

        return res.status(200).json({success:true,msg:'Posted Comment reply'});
        
    } catch (err) {
        return res.status(400).json({success:false,msg:`${err}`});
    }
}

const cupvote=async (req,res)=>{
    try{
        const _id=req.body._Id;
        const result =  await Comment.updateOne({_id},{
           $inc:{
            votes:1
           }
        })
        if(!result) return res.status(404).json({success:false,msg:'Comment not found.'})
        else {
            const user= await User.findOneAndUpdate({ _id:_id }, {
                $addToSet: { cupvotes:_id},
                $pull: {cdownvotes:_id},
            });
            if(!user) return res.status(404).json({success:false,msg:'Post not found.'});
            return res.status(200).json({success:true,msg:"Comment upvote"});
        }
     } catch(err) {
        console.log(err);
        return res.status(400).json({success:false,msg:`${err}`});
    }
}
const cunupvote=async (req,res)=>{
    try{
        const _id=req.body._Id;
        const result =  await Comment.updateOne({_id},{
           $inc:{
            votes:-1
           }
       })
        if(!result) return res.status(404).json({success:false,msg:'Comment not found.'})
        else {
            const user= await User.findOneAndUpdate({ _id:req.user._id }, { $pull: { cupvotes:_id} })
            if(!user) return res.status(404).json({success:false,msg:'Post not found.'})
            return res.status(200).json({success:true,msg:"Comment unupvoed"})
        }
     } catch(err) {
        console.log(err);
    }
}
const cdownvote=async (req,res)=>{
    try{
        const _id=req.body._Id;
        const result =  await Comment.updateOne({_id},{
           $inc:{
            votes:-1
           }
        });
        if(!result) return res.status(404).json({success:false,msg:'Comment not found.'});
        else {
            const user= await User.findOneAndUpdate({ _id:req.user._id }, {
                $addToSet: { cdownvotes:_id},
                $pull: { cupvotes:_id}
            });
            if(!user) return res.status(404).json({success:false,msg:'Post not found.'});
            return res.status(200).json({success:true,msg:"Comment downvoted"});
        }
     
    }catch(err){
        console.log(err);
    }
}
const cundownvote=async (req,res)=>{
    try{
        const _id=req.body._Id;
        const result =  await Comment.updateOne({_id},{
            $inc:{
                votes:1
            }
        });

       if(!result) return res.status(404).json({success:false,msg:'Comment not found.'});
       else {
            const user= await User.findOneAndUpdate({ _id:req.user._id }, { $pull: { cdownvotes:_id} });
            if(!user) return res.status(404).json({success:false,msg:'Post not found.'});
            return res.status(200).json({success:true,msg:"Comment undownvoted"});
        }
    }catch(err){
        console.log(err);
        return res.status(400).json({success:false,msg:`${err}`});
    }
}

const mycomments = async (req,res) => {
    try {
        const {user_name} = req.user;
        let mycomments = await Comment.find({author:user_name},{childId:0,author:0})
                                .populate('postId','_id subspace heading');

        
        return res.status(200).json({mycomments});
        
    } catch (err) {
        return res.status(400).json({success:false,msg:`${err}`});
    }
}


module.exports = {
    comment,
    getpostcomm,
    replies,
    reply,
    cupvote,
    cdownvote,
    cunupvote,
    cundownvote,
    mycomments
}