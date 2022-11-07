const subspace = require('../model/subspaceModel');
const mongoose = require('mongoose');

const ismember=async (req,res,next)=>{
    const result=await subspace.findOne({_id:req.body._id})
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