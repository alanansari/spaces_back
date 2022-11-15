const subSpace = require('../model/subspaceModel');
const User = require('../model/userModel');
const Post = require('../model/postModel');

const jwt = require('jsonwebtoken');
require('dotenv').config();
const jwtsecret = process.env.jwtsecretkey1;

const newsubspace = async (req,res) => {

    try{
        const {name,about,rules} = req.body;

        if(!name||!about){
            return res.status(400).json({success:false,msg:'Fill all input fields!'});
        }


        let token=req.headers['accesstoken'] || req.headers['authorization'];
        token = token.replace(/^Bearer\s+/, "");

        const decode=await jwt.verify(token,jwtsecret);
        const user_name=decode.user_name;
        const user = await User.findOne({user_name});


        if(!user)
            return res.status(400).json({success:false,msg:'User not found!'});

        const oldspace = await subSpace.findOne({name});

        if(oldspace) return res.status(400).json({success:false,msg:`${name} is already taken.`});

        let filepath = null;

        if(req.file === undefined)
            return res.status(400).json({success:false,msg:"Image required."});

        
        filepath = 'uploads/' + req.file.filename;
        

        const space = await subSpace.create({
            admin: user.user_name,
            name,
            about,
            rules,
            imgpath: filepath,
            createdAt: Date.now()
        });

        const becomemem = await subSpace.findOneAndUpdate({name},{
            $addToSet:{members:req.user._id}
        },{new:true}).exec((err,result)=>{
            if(err){
                return res.status(400).json({success:false,msg:"Not able to add user to subspace"});
            }
        });

        const addspace = await User.findOneAndUpdate({user_name},{
            $addToSet:{mysubspaces:name}
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
        return res.status(400).json({success:false,msg:`${err}`});
    }
}


const viewsubspace = async (req,res) => {
    try {
        const name = req.params.subspace;
        const subspace = await subSpace.findOne({name});
        let user_name = null; let user;
        if(!subspace)
            return res.status(404).json({success:false,msg:"Subspace not found"});

        const upvoted = [],downvoted=[];
        let following = false;
        let imgpath = null;
            
        let token=req.headers['accesstoken'] || req.headers['authorization'];

        let posts = await Post.find({subspace:name}).sort({createdAt:-1}).limit(10);

        if(token){
            token = token.replace(/^Bearer\s+/, "");

            const decode=await jwt.verify(token,jwtsecret);
            user_name=decode.user_name;
            user = await User.findOne({user_name});

            imgpath = user.displaypic;

            for(let i=0;i<posts.length;i++){
                let bool = false;
                for(let j=0;j<user.upvotes.length;j++){
                    if(posts[i]._id.toString()===user.upvotes[j].toString()){
                        bool = true;
                    }
                }
                upvoted.push(bool);
                posts[i]["upvoted"] = bool;
            }

            for(let i=0;i<posts.length;i++){
                let bool = false;
                for(let j=0;j<user.downvotes.length;j++){
                    if(posts[i]._id.toString()===user.downvotes[j].toString()){
                        bool = true;
                    }
                }
                downvoted.push(bool);
                posts[i]["downvoted"] = bool;
            }

            for(let i=0;i<user.mysubspaces.length;i++){
                if(user.mysubspaces[i]===subspace.name){
                    following = true;
                    break;
                }
            }
        }
        
        return res.status(200).json({user_name,following,imgpath,subspace,posts,upvoted,downvoted});
    } catch (err) {
        console.log(err);
        return res.status(400).json({success:false,msg:`${err}`});
    }
}

const viewmoresubspace = async (req,res) => {
    try {
        const name = req.params.subspace;
        const {num} = req.body;
        const subspace = await subSpace.findOne({name});
        const posts = await Post.find({subspace:name}).sort({createdAt:-1}).skip(10*num).limit(10);

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

        return res.status(200).json({subspace,posts,upvoted,downvoted});
    } catch (err) {
        
        console.log(err);
        return res.status(400).json({success:false,msg:`${err}`});
    }
}


const follow= async (req,res)=>{
    try{

        const {subspace} = req.body;
        const user_name = req.user.user_name;

        const remsub = await User.findOneAndUpdate({user_name},{
            $addToSet:{mysubspaces:subspace}
        });
    
        const result=await subSpace.findOneAndUpdate({name:subspace},
        {
            $addToSet:{
                members:req.user._id
            }
        },{new:true});

        if(!result) return res.status(404).json({success:false,msg:'Subspace not found.'});

        else res.status(200).json({success:true,msg:"followed",});

    } catch (err){
        return res.status(400).json({success:false,msg:`${err}`});
    }
}

const unfollow= async (req,res)=>{
    try{
        const {subspace} = req.body;

        const user_name = req.user.user_name;

        const remsub = await User.findOneAndUpdate({user_name},{
            $pull:{mysubspaces:subspace}
        });

        const result=await subSpace.findOneAndUpdate({name:subspace},{
            $pull:{members:req.user._id}
        },{new:true});

        if(!result) return res.status(404).json({success:false,msg:'Subspace not found.'});

        else res.status(200).json({success:true,msg:"unfollowed"});
    } catch(err){
        return res.status(400).json({success:false,msg:`${err}`});
    }
}

const topcommunities=async (req,res)=>{
    try{
     const top=await subSpace.find().sort({"followers":-1}).limit(10);


        return res.status(200).json({top});
    } catch (err) {
        
        console.log(err);
        return res.status(400);
    }
}
const moretopcommunities=async (req,res)=>{
    try{
        const num=req.params.num;
     const top=await subSpace.find().sort({"followers":-1}).skip(10*num).limit(10);


        return res.status(200).json({top});
    } catch (err) {
        console.log(err);
        return res.status(400).json({success:false,msg:`${err}`});
    }
}

const search = async (req,res) => {
    try {
        const {text} = req.body;
        let docs = await subSpace.aggregate([
            { $match:{name: {$regex: text ,'$options': 'i'}} }
        ]).limit(5);
        
        if(!docs) return res.status(400).json({msg:'Not able to search.'});

        const subs = [];
        docs.forEach(obj=>{
            subs.push(obj.name);
        });

        return res.status(200).json(subs);
    } catch (err) {
        console.log(err);
        return res.status(400).json({success:false,msg:`${err}`});
    }
}


module.exports = {
    newsubspace,
    viewsubspace,
    viewmoresubspace,
    follow,
    search,
    unfollow,
    topcommunities,
    moretopcommunities
}