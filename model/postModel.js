const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const postSchema = new mongoose.Schema({
    author: { type: String,required:true},
    subspace: {type: String,required:true},
    heading: {type: String,required:true},
    para: {type: String},
    imgpath: {type: String},
    votes:
    {
        type:Number
    },
    comments: [{type:ObjectId,ref:"comments"}],
    createdAt: {type: Number}
});


const postModel = mongoose.model("posts", postSchema);

module.exports = postModel;