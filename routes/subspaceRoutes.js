const express = require('express');
const Upload = require('../middleware/upload');
const validation = require('../middleware/authveriftoken');

const subspaceController = require('../controller/subspaceController');

const router = express.Router();

router.post('/newsubspace',validation.authverifytoken,Upload.uploadfile.single('image'),subspaceController.newsubspace);

router.post('/search',subspaceController.search);

router.put('/follow',validation.authverifytoken,subspaceController.follow);

router.put('/unfollow',validation.authverifytoken,subspaceController.unfollow);

router.get('/topcommunities',subspaceController.topcommunities);

router.post('/topcommunities',subspaceController.moretopcommunities);

router.post('/:subspace',subspaceController.viewmoresubspace);

router.get('/:subspace',subspaceController.viewsubspace);



module.exports = router;