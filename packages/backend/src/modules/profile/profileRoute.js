const express = require('express');

const { profileController } = require('./profile.controller');

const router = express.Router();

router.get('/matches', profileController.getMatchHistory);

module.exports = router;
