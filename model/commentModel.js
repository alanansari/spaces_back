const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const commentSchema = new mongoose.Schema({
    author:{ type: String,required:true},
    text: {type:String,required:true},
    upvotes:[{type:ObjectId,ref:"user"}],
    downvotes:[{type:ObjectId,ref:"user"}],
    childId:[{type:ObjectId,ref:"comments"}]
});


const commentModel = mongoose.model("comments", commentSchema);

module.exports = commentModel;