const express = require('express');

const validation = require('../middleware/authveriftoken');
const commentController = require('../controller/commentController');

const router = express.Router();

// post comment on a post
router.post('/comment',validation.authverifytoken,commentController.comment);


// see all my comments and heading of the post
router.get('/mycomments',validation.authverifytoken,commentController.mycomments);


router.get('/:id/comments',commentController.getpostcomm);


// post reply on a comment
router.post('/:id',validation.authverifytoken,commentController.reply);

// see replies on a comment
// router.get('/',commentController.replies);
router.get('/:id/:num',commentController.replies);

router.delete('/:id',validation.authverifytoken,commentController.delcomm);

//comment id
router.put('/cupvote',validation.authverifytoken,commentController.cupvote);
router.put('/cunupvote',validation.authverifytoken,commentController.cunupvote);
router.put('/cdownvote',validation.authverifytoken,commentController.cdownvote);
router.put('/cundownvote',validation.authverifytoken,commentController.cundownvote);




module.exports = router;