const express = require('express')
const router = express.Router();

router.use('/stripe', require('./payment'))
router.use(express.json())
router.use('/users', require('./users'));
router.use('/home', require('./home'))
router.use('/plans', require('./plans'))
router.use('/chatGpt', require('./chatGpt'))
router.use('/passwordReset', require('./passwordReset'))


module.exports = router;