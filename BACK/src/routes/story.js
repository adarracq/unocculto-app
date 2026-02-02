const express = require('express');
const router = express.Router();
const storyCtrl = require('../controllers/story');
const auth = require('../middlewares/auth');

router.get('/id/:id', storyCtrl.getByID);
router.get('/next/:countryCode', auth, storyCtrl.getNextByCountryCode);
router.get('/available/destinations', auth, storyCtrl.getAvailableDestinations);
module.exports = router;