const express = require('express');

const validation = require('../middleware/authveriftoken');
const commentController = require('../controller/commentController');

const router = express.Router();

// post comment on a post
router.post('/comment',validation.authverifytoken,commentController.comment);

// post reply on a comment
router.post('/:id',validation.authverifytoken,commentController.reply);

// see replies on a comment
router.get('/:id',commentController.replies);

//comment id
router.put('/cupvote',commentController.cupvote);

router.put('/cunupvote',commentController.cunupvote);
router.put('/cdownvote',commentController.cdownvote);
router.put('/cundownvote',commentController.cundownvote);




module.exports = router;