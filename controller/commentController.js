const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const Comment = require('../model/commentModel');
const Post = require('../model/postModel');

const comment = async(req,res)=>{
    try {
        const {postId,text} = req.body;

        if(!postId) return res.status(400).json({success:true,msg:'Give post id'});

        const post = Post.findById(postId);

        if(!post) return res.status(404).json({success:true,msg:'Post not found'});

        if(!text) return res.status(400).json({success:true,msg:'Give comment content'});

        let token=req.headers['accesstoken'] || req.headers['authorization'];
        token = token.replace(/^Bearer\s+/, "");

        const decode = await jwt.decode(token,"jwtsecret");
        const user_name=decode.user_name;
        const user = await User.findOne({user_name});

        if (!user) return res.status(409).json({sucess:false,msg:"This username doesn't have an account"});

        const comment = await Comment.create({
            author: user_name,
            text
        });

        const appendcomm = await Post.findByIdAndUpdate(postId,{
            $push:{comments:comment._id}
        });

        return res.status(200).json({success:true,msg:'Posted Comment'});
    } catch (err) {
        console.log(err);
    }
}

const replies = async (req,res) => {
    try {

        const commId = req.params.id;

        const comment = await Comment.findById(commId).populate('childId').limit(10);

        if(!comment)
            return res.status(404).json({success:false,msg:'Comment not found.'});

        return res.status(200).json(comment);
        
    } catch (err) {
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

        const decode = await jwt.decode(token,"jwtsecret");
        const user_name=decode.user_name;
        const user = await User.findOne({user_name});

        if (!user) return res.status(409).json({sucess:false,msg:"This username doesn't have an account"});

        const comment = await Comment.create({
            author: user_name,
            text
        });

        const appendcomm = await Comment.findByIdAndUpdate(commId,{
            $push:{childId:comment._id}
        });

        return res.status(200).json({success:true,msg:'Posted Comment reply'});
        
    } catch (err) {
        return res.status(400).json({success:false,msg:`${err}`});
    }
}

module.exports = {
    comment,
    replies,
    reply
}