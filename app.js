const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser')
const morgan = require('morgan')

// const passport = require('passport');

/**
 * -------------- GENERAL SETUP ----------------
 */

// Gives us access to variables set in the .env file via `process.env.VARIABLE_NAME` syntax
require('dotenv').config();

// Create the Express application
const app = express();

// Configures the database and opens a global connection that can be used in any module with `mongoose.connection`
require('./config/database');

// Must first load the models
require('./models/user');

// Logger function

app.use(morgan('tiny'))

// For creating cookies

app.use(cookieParser())

// Instead of using body-parser middleware, use the new Express implementation of the same thing

app.use(express.urlencoded({extended: true}));

// Allows our Angular application to make HTTP requests to Express application

const corsOptions = {
    origin: 'skillify-api.azurewebsites.net',
    credentials: true
};

app.use(cors(corsOptions));


/**
 * -------------- ROUTES ----------------
 */

// Imports all of the routes from ./routes/index.js
app.use(require('./routes'));


/**
 * -------------- SERVER ----------------
 */


const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`Server is listening on port: ${port}`)
});
