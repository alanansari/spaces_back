

const newpost = async (req,res) => {
    console.log(req.file);
    return res.status(200).json({success:true,msg:'Posted!'});
}


module.exports = {
    newpost
}