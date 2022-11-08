const express = require('express');
const Upload = require('../middleware/upload');


const validation = require('../middleware/authveriftoken');
const ismember = require('../middleware/ismember');

const postController = require('../controller/postController');

const router = express.Router();

router.get('/feed',postController.getfeed);

router.get('/loggedfeed',validation.authverifytoken,postController.getlogfeed);

router.post('/next',postController.getmoreposts);

router.get('/postform',validation.authverifytoken,postController.postform);

router.post('/newpost',validation.authverifytoken,Upload.uploadImg.none(),ismember.ismember, Upload.uploadImg.single('image'), postController.newpost);

router.put('/upvote',validation.authverifytoken,postController.upvote);

router.put('/unupvote',validation.authverifytoken,postController.unupvote);

router.put('/downvote',validation.authverifytoken,postController.downvote);

router.put('/undownvote',validation.authverifytoken,postController.undownvote);

router.get('/:id',postController.getpost);

module.exports = router;