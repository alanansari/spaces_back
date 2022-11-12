const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const postSchema = new mongoose.Schema({
    author: {
        type: String,
        required:true
    },
    subspace: {
        type: String,
        required:true
    },
    heading: {
        type: String,
        required:true
    },
    para: {
        type: String,
        default: null
    },
    imgpath: {
        type: String
    },
    votes:{
        type:Number,
        default: 0
    },
    comments: [{
        type:ObjectId,
        ref:"comments"
    }],
    createdAt: {
        type: Number
    },
    followers:{
        type:Number
    }
});


const postModel = mongoose.model("posts", postSchema);

module.exports = postModel;