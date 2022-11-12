const multer = require('multer');

let maxSize = 3 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if(file.mimetype === 'video/mp4')
            maxSize = 50 * 1024 * 1024;
      cb(null, './uploads');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
});



const fileFilter = (req,file,cb) => {
    if(file.mimetype === 'image/jpeg'||
    file.mimetype === 'image/jpg'||
    file.mimetype === 'image/png'||
    file.mimetype === 'video/mp4'){
        
        cb(null,true);
    }
    else
        cb(null,false);
}
const imageFilter = (req,file,cb) => {
    if(file.mimetype === 'image/jpeg'||
    file.mimetype === 'image/jpg'||
    file.mimetype === 'image/png'||
    file.mimetype === 'video/mp4'){
        cb(null,true);
    }
    else
        cb(null,false);
}


const uploadImg = multer({
    storage,
    limits:{
        fileSize:  maxSize
    },
    imageFilter
});

module.exports = {
    uploadImg
}

