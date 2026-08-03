const express = require('express');

const { analyzePdf } = require('../controllers/analyzeController');

const router = express.Router();

router.post('/analyze', analyzePdf);

module.exports = router;
