const multer = require('multer');

let maxSize = 15 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
});



// const fileFilter = (req,file,cb) => {
//     if(!(((file.mimetype === 'image/jpeg'||
//     file.mimetype === 'image/jpg'||
//     file.mimetype === 'image/png')&&file.size<=3*1024*1024)||
//     (file.mimetype === 'video/mp4'&&file.size<=50*1024*1024))){
//         cb(null,false,new Error('File too large'));
//     }
//     else
//         cb(null,true);
// }

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
    limit: maxSize,
    fileFilter : imageFilter
});

module.exports = {
    uploadImg
}

