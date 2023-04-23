const express = require('express');
const router = express.Router()
const getResponse = require('./ChatGpt.js')
const db = require('./db/conn.js')





router.get('/test', async (req,res) => {

    try {
        const collection = db.getDb().collection('Users');
        const result = await collection.findOne({ name: 'Tudor' });
        res.json(result);
        res.send()
      } catch (e) {
        console.error(e);
        res.status(500).send('Internal Server Error');
      }
})

router.get("*",(req,res) => {
    res.send("Testingy")
})

module.exports = router