const mongoose = require('mongoose');

require('dotenv').config();

/**
 * -------------- DATABASE ----------------
 */

/**
 * Connect to MongoDB Server using the connection string in the `.env` file.  To implement this, place the following
 * string into the `.env` file
 * 
 * DB_STRING=mongodb://<user>:<password>@localhost:27017/database_name
 * DB_STRING_PROD=<your production database string>
 */ 

const devConnection = process.env.DATABASE_URI;
mongoose.set('strictQuery', true)
mongoose.connect(devConnection)
mongoose.connection.on('connected', () => {
    console.log('Database connected');
});

    