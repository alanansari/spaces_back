const express = require('express');
const Upload = require('../middleware/upload');


const validation = require('../middleware/authveriftoken');

const postController = require('../controller/postController');

const router = express.Router();

router.get('/feed',postController.getfeed);

router.get('/next',postController.getmoreposts);

router.get('/postform',validation.authverifytoken,postController.postform);

router.post('/newpost',validation.authverifytoken, Upload.uploadImg.single('image'), postController.newpost);

router.put('/upvote',validation.authverifytoken,postController.upvote);

router.put('/unupvote',validation.authverifytoken,postController.unupvote);

router.put('/downvote',validation.authverifytoken,postController.downvote);

router.put('/undownvote',validation.authverifytoken,postController.undownvote);

router.get('/:id',postController.getpost);

module.exports = router;