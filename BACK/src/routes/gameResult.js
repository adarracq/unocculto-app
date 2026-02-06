const express = require('express');
const router = express.Router();
const gameCtrl = require('../controllers/gameResult');
const auth = require('../middlewares/auth');

router.get('/leaderboard/weekly', auth, gameCtrl.getHebdoLeaderBoard);
router.get('/leaderboard/:mode/:region/:lvl', auth, gameCtrl.getLeaderboard);
router.post('/finish', auth, gameCtrl.finishGame);
module.exports = router;