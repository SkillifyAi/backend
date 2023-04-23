const router = require('express').Router()
const {forgotPassword, resetPassword} = require('../controllers/passwordReset')


router.post('/forgot', forgotPassword)

router.patch('/reset', resetPassword)

module.exports = router
