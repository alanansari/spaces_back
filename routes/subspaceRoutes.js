const express = require('express');
const Upload = require('../middleware/upload');
const validation = require('../middleware/authveriftoken');

const subspaceController = require('../controller/subspaceController');


const router = express.Router();

router.post('/newsubspace',validation.authverifytoken,Upload.uploadImg.single('image'),subspaceController.newsubspace);


module.exports = router;