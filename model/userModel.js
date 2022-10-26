const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_name: { type: String,required:true, unique: true},
    email: { type: String,required:true, unique: true },
    password: { type: String },
    token: { type: String },
  });


const userModel = mongoose.model("user", userSchema);

module.exports = userModel;