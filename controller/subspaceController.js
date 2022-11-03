const subspace = require('../model/subspaceModel');
const User = require('../model/userModel');

const newsubspace = async (req,res) => {

    try{
        const {user_name,name,about} = req.body;

        if(!name||!about){
            return res.status(400).json({success:false,msg:'Fill all input fields!'});
        }

        // Using token

        // const token=req.headers["accesstoken"];
        // const decode=await jwt.decode(token,"jwtsecret");
        // const user_name=decode.user_name;

        const user = await User.findOne({user_name});

        if(!user)
            return res.status(400).json({success:false,msg:'User not found!'});

        const oldspace = await subspace.findOne({name});

        if(oldspace) return res.status(400).json({success:false,msg:`${name} is already taken.`});

        const space = await subspace.create({
            admin: user.user_name,
            name,
            about,
            createdAt: Date.now()
        });

        return res.status(200).json(space);
    } catch (err){
        console.log(err);
    }
}


module.exports = {
    newsubspace
}