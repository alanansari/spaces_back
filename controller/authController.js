const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require('../model/userModel');

const signup = async (req,res)=>{
    try{
        //get user input
        const {user_name,email,password} = req.body;

        // check if user email already exists
        const oldMail = await User.findOne({ email });

        if (oldMail) {
            return res.status(409).json({sucess:false,msg:"Email Already Exist."});
        }

        // check if username already exist
        const oldUser = await User.findOne({ user_name });

        if (oldUser) {
            return res.status(409).send({sucess:false,msg:"Username Already Exist."});
        }

        // email verification
        
        // encrypting password
        const encryptedPassword = await bcrypt.hash(password, 12);

        // Create new user in database
        const user = await User.create({
        user_name,
        email: email.toLowerCase(), // convert email to lowercase
        password: encryptedPassword,
        });

  
        // return new user
        res.status(201).json({sucess:true,msg:`Welcome to spaces! ${user_name}.`});
    } catch (err) {
      console.log(err);
    }
}

const login = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

        if (!user) return res.status(409).json({sucess:false,msg:"This email doesn't have an account"});

        const result = await bcrypt.compare(password, user.password);

        if (!result) return res.status(409).json({sucess:false,msg:"Wrong Password"});

        return res.status(200).json({sucess: true,msg:`Welcome back! ${user.user_name}`});
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
    signup,
    login
}