const express = require('express');

const validation = require('../middleware/authveriftoken');
const commentController = require('../controller/commentController');

const router = express.Router();

// post comment on a post
router.post('/comment',validation.authverifytoken,commentController.comment);

router.get('/:id/comments/:num',commentController.getpostcomm);

// see replies on a comment
router.get('/:id/:num',commentController.replies);

// post reply on a comment
router.post('/:id',validation.authverifytoken,commentController.reply);


//comment id
router.put('/upvote',commentController.upvote);

router.put('/unupvote',commentController.downvote);




module.exports = router;