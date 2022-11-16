const User = require('../model/userModel');

const  cleanDB = async () => {
    try{
        const delold = await User.deleteMany({email_verify:false,expiryOTP:{$lt:Date.now()}});
        if(delold){
            console.log("deleted");
        }
    } catch(err){
        console.log(err);
    }
}

module.exports = {cleanDB};