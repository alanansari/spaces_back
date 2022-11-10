const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
});

let maxSize = 5 * 1024 * 1024;

const fileFilter = (req,file,cb) => {
    if(file.mimetype === 'image/jpeg'||
    file.mimetype === 'image/jpg'||
    file.mimetype === 'image/png'||
    file.mimetype === 'video/mp4'){
        if(file.mimetype === 'video/mp4')
            maxSize = 50 * 1024 * 1024;
        cb(null,true);
    }
    else
        cb(null,false);
}



const uploadfile = multer({
    storage,
    limits:{
        fileSize:  maxSize
    },
    fileFilter
});

module.exports = {
    uploadfile
}