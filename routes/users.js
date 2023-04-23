const router = require('express').Router();   
const {handleRegister, handleLogin, handleLogOut, sendData, getLeaderboard, handleGoogleLogin} = require('../controllers/users');
const { authMiddleware, getPayload, resetValues} = require('../controllers/utils');
const {sendNumber, verifyNumber} = require('../controllers/verifyPhoneNumber')


router.post('/login', handleLogin, resetValues)

router.post('/register', handleRegister)

router.get('/logout', handleLogOut)

router.get('/profile', authMiddleware, getPayload, sendData)

router.get('/leaderboard', authMiddleware, getPayload, getLeaderboard)

router.post('/google-login', handleGoogleLogin)

router.post('/send-message', sendNumber)

router.post('/verify-number', verifyNumber)

module.exports = router