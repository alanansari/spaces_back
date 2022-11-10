const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const subspaceSchema = new mongoose.Schema({
    admin: {
        type: String,
        required:true
    },
    name: {
        type: String,
        required:true,
        unique:true
    },
    about: {
        type: String
    },
    rules: {
        type:String
    },
    imgpath:{
        type:String
    },
    members: [{
        type: ObjectId,
        ref:"user"
    }],
    createdAt: {
        type: Number
    },
    follower:{
        tupe:Number
    }
});


const subspaceModel = mongoose.model("subspaces", subspaceSchema);

module.exports = subspaceModel;