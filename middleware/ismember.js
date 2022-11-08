const subspace = require('../model/subspaceModel');

const ismember=async (req,res,next)=>{

    const result=await subspace.findOne({name:req.body.subspace})
    if(!result)
    {
        return res.status(400).send("Subspace not found");
    }
    else{
        try{
            console.log(result);
            const id = req.user._id;
            const member=await result.members.find(id);
            next();
        }
        catch(err)
        {
            console.log(err);
            return res.status(400).send("You are not a member");
        }
    }
}

module.exports={ismember}