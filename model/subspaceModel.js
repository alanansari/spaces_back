const mongoose = require('mongoose');

const subspaceSchema = new mongoose.Schema({
    admin: { type: String,required:true},
    name: { type: String,required:true,unique:true},
    about: { type: String},
    posts: [{type:String}],
    members: [{type: String}],
    createdAt: {type: Number}
});


const subspaceModel = mongoose.model("subspaces", subspaceSchema);

module.exports = subspaceModel;