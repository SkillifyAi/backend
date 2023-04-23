const express = require('express');
const morgan = require('morgan')
const cors = require('cors');
const db = require('./db/conn.js')
const router = require('./routes.js')

const PORT = process.env.PORT || 5000

const app = express()


const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
};

app.use(cors(corsOptions))
app.use(morgan('tiny'))
app.use(express.urlencoded({extended : false}))
app.use(express.json())
app.use('/',router)

db.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        })
    })
    .catch((err) => {
        console.error(err);
        process.exit(1)
    })

