const express = require('express');
const Upload = require('../middleware/upload');

const postController = require('../controller/postController');

const router = express.Router();

router.get('/feed',postController.getfeed);

router.get('/next',postController.getmoreposts);

router.post('/newpost', Upload.uploadImg.single('image'), postController.newpost);

router.get('/:id',postController.getpost);

module.exports = router;