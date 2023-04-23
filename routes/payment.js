const express = require('express');
const { createCheckout, handleCheckout, handlePortal} = require('../controllers/payment')
const utils = require('../controllers/utils')
const router = require('express').Router()
const bodyParser = require('body-parser')

router.post('/create-checkout-session', express.json(), utils.getPayload, createCheckout)

router.post('/webhook', bodyParser.raw({type: 'application/json'}), handleCheckout)

router.post('/customer-portal', express.json(), handlePortal)

module.exports = router