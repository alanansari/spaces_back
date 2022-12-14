const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
    user_name: { 
      type: String,
      required:true,
      unique: true
    },
    email: { 
      type: String,
      required:true,
      unique: true
    },
    password: { 
      type: String
    },
    email_verify: {
      type: Boolean
    },
    displaypic:{
      type: String,
      default: null
    },
    mailedOTP: {
      type: String
    },
    expiryOTP: {
      type: Number
    },
    mysubspaces: [{
      type: String
    }],
    token: { 
      type: String
     },
    upvotes:[{
      type:ObjectId,
      ref:"posts"
    }],
    downvotes:[{
      type:ObjectId,
      ref:"posts"
    }],
    cupvotes:[{
      type:ObjectId,
      ref:"comments"
    }],
    cdownvotes:[{
      type:ObjectId,
      ref:"comments"
    }]
  });


const userModel = mongoose.model("user", userSchema);

module.exports = userModel;