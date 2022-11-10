const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const commentSchema = new mongoose.Schema({
    author:{ 
        type: String,
        required:true
    },
    text: {
        type:String,
        required:true
    },
    votes:{
        type:Number,
        default: 0
    },
    childId:[{
        type:ObjectId,
        ref:"comments"
    }]
});


const commentModel = mongoose.model("comments", commentSchema);

module.exports = commentModel;