const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    author: { type: String,required:true},
    subspace: {type: String,required:true},
    heading: {type: String,required:true},
    para: {type: String},
    votes: {type: Number},
    imgpath: {type: String},
    createdAt: {type: Number}
});


const postModel = mongoose.model("posts", postSchema);

module.exports = postModel;