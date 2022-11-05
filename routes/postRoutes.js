const express = require('express');
const Upload = require('../middleware/upload');
const validation = require('../controller/authController');

const postController = require('../controller/postController');

const router = express.Router();

router.get('/feed',postController.getfeed);

router.get('/next',postController.getmoreposts);

router.post('/newpost',validation.authverifytoken, Upload.uploadImg.single('image'), postController.newpost);

router.get('/:id',postController.getpost);

module.exports = router;