const express = require('express');

const subspaceController = require('../controller/subspaceController');


const router = express.Router();

router.post('/newsubspace', subspaceController.newsubspace);


module.exports = router;