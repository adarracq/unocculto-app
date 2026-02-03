const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const auth = require('../middlewares/auth');


router.post('/loginOrSignup', userCtrl.loginOrSignup);
router.post('/code', userCtrl.verifyEmailCode);
router.get('/:email', userCtrl.getUserByEmail);
router.get('/id/:id', auth, userCtrl.getUserById);
router.put('/', auth, userCtrl.updateUser);
router.put('/expoPushToken', userCtrl.updateExpoPushToken);
router.put('/currentStoryId', auth, userCtrl.updateCurrentStoryId);
//router.post('/chapter', auth, userCtrl.addCompletedChapter);
router.post('/loseLife', auth, userCtrl.loseLife);
router.get('/verifyPseudo/:pseudo', auth, userCtrl.verifyPseudo);
router.post('/completeStory', auth, userCtrl.completeStory);
router.delete('/:id', auth, userCtrl.deleteUser);

router.get('/memories/due', auth, userCtrl.getDueMemories);
router.get('/memories/count', auth, userCtrl.getDueMemoriesCount);
router.post('/memories/review', auth, userCtrl.reviewMemory);

module.exports = router;
