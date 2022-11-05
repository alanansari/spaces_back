const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const pathon = path.join(__dirname, '../uploads/');
        fs.mkdirSync(pathon,{recursive: true});
        return cb(null, pathon);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req,file,cb) => {
    if(file.mimetype === 'image/jpeg'||
    file.mimetype === 'image/jpg'||
    file.mimetype === 'image/png')
        cb(null,true);
    else
        cb(null,false);
}

const uploadImg = multer({
    storage,
    limits:{
        fileSize: 5 * 1024 * 1024
    },
    fileFilter
});

module.exports = {
    uploadImg
}