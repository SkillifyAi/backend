const router = require('express').Router()
const chatGpt = require('../controllers/chatGpt')
const {authMiddleware, getPayload} = require('../controllers/utils')
const {planNumber} = require('../controllers/plans')

router.post("/", authMiddleware, getPayload, planNumber, chatGpt)

module.exports = router;