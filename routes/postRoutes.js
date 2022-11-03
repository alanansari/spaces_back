const express = require('express');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/img');
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() +'.jpg');
    }
});

const uploadImg = multer({
    storage,
    limits:{
        fileSize: 5242880
    }
});

const postController = require('../controller/postController');


const router = express.Router();

router.post('/newpost', uploadImg.single('image'), postController.newpost);


module.exports = router;