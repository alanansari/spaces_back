const multer = require('multer');

const storageposts = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/posts');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
});
const storageprofile = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/profile');
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
const imageFilter = (req,file,cb) => {
    if(file.mimetype === 'image/jpeg'||
    file.mimetype === 'image/jpg'||
    file.mimetype === 'image/png'){
    maxSixe=2*1024*1024;
        cb(null,true);
    }
    else
        cb(null,false);
}



const uploadposts = multer({
    storageposts,
    limits:{
        fileSize:  maxSize
    },
    fileFilter
});
const uploadImg = multer({
    storageprofile,
    limits:{
        fileSize:  maxSize
    },
    imageFilter
});

module.exports = {
    uploadImg,
    uploadposts
}