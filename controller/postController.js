const { findById } = require('../model/postModel');
const Post = require('../model/postModel');

const newpost = async (req,res) => {
    try{
        const {user_name,subspace,heading,para} = req.body;


        let filepath = null;

        if(req.file !== undefined){
            filepath = req.file.path;
        }

        // Using JWT

        // let token=req.headers['accesstoken'] || req.headers['authorization'];
        // token = token.replace(/^Bearer\s+/, "");

        // const decode=await jwt.decode(token,"jwtsecret");
        // const user_name=decode.user_name;
        // const user = await User.findOne({user_name});

        // if (!user) return res.status(409).json({sucess:false,msg:"This username doesn't have an account"});

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
        
        const post = await Post.findById(postId);

        if(!post){
            return res.status(404).json({success:false,msg:'Post not found.'});
        }

        return res.status(200).json(post);

    } catch(err) {
        console.log(err);
    }
}

const getallposts = async (req,res) => {
    try {
        const posts = await Post.find().limit(10);
        return res.status(200).json(posts);
    } catch (err) {
        console.log(err);
    }
}

const getmoreposts = async (req,res) => {
    try {
        const {num} = req.body;
        const posts = await Post.find().skip(10*num).limit(10);
        return res.status(200).json(posts);
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    newpost,
    getpost,
    getallposts,
    getmoreposts
}