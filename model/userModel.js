const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
    user_name: { type: String,required:true, unique: true},
    email: { type: String,required:true, unique: true },
    password: { type: String },
    email_verify: {type: Boolean},
    mailedOTP: {type: String},
    expiryOTP: {type: Number},
    mysubspaces: [{type: String}],
    myposts: [{type: String}],
    token: { type: String },
    upvotes:[{type:ObjectId,ref:"user"}],
    downvotes:[{type:ObjectId,ref:"user"}],
    cupvotes:[{type:ObjectId,ref:"user"}],
    cdownvotes:[{type:ObjectId,ref:"user"}],
    firstname:
    {
      type:String
    },
    lastnamename:
    {
      type:String
    }

  });


const userModel = mongoose.model("user", userSchema);

module.exports = userModel;