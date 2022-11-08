const subspace = require('../model/subspaceModel');

const ismember=async (req,res,next)=>{

    const result=await subspace.findOne({name:req.body.subspace})
    if(!result)
    {
        return res.status(400).send("Subspace not found");
    }
    else{
        try{
            const member=await result.find({members:req.user.id})
            next();
        }
        catch(err)
        {
            return res.status(400).send("You are mot a member");
        }
    }
}

module.exports={ismember}