const express = require('express');
const Upload = require('../middleware/upload');
const validation = require('../middleware/authveriftoken');

const subspaceController = require('../controller/subspaceController');

const router = express.Router();

router.post('/newsubspace',validation.authverifytoken,Upload.uploadImg.single('image'),subspaceController.newsubspace);

router.post('/search',subspaceController.search);

router.put('/follow',validation.authverifytoken,subspaceController.follow);

router.put('/unfollow',validation.authverifytoken,subspaceController.unfollow);

router.get('/userinfo',validation.authverifytoken,subspaceController.userinfo);

router.get('/topcommunities',subspaceController.topcommunities);

router.get('/topcommunities/:num',subspaceController.moretopcommunities);

router.post('/:subspace',subspaceController.viewmoresubspace);

router.get('/:subspace',subspaceController.viewsubspace);



module.exports = router;