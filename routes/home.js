const router = require('express').Router()
const utils = require('../controllers/utils')
const home = require('../controllers/home')

router.get('/authentificated', home.authentificate, utils.authMiddleware, (req, res) => {
    res.status(200).json({succes: true, token: true})
})

module.exports = router