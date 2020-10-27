'use strict';

/**
 * 
 * Server for handling all the operation related to Celebrities in the Bliss app.
 * Routes needs API key associated with the admin to be able to access everything in the server.
 * Routes needs JWT token associated with the users to be able to access data only for the app.
 * 
 */

require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const celebRoutes = require('./routes/routes');
const firebaseAdmin = require('firebase-admin');
const firebaseServiceKey = require('./config/firebase.json');
const morgan = require('morgan');
const chalk = require('./chalk.console');

const PORT = process.env.PORT || 7000;
const ENV = process.env.NODE_ENV;

let databaseConnection;

if(ENV === 'development') {
    databaseConnection = require('./connections/PGConnection')('development');
} else {
    databaseConnection = require('./connections/PGConnection')('production');
}

console.log(chalk.info(`ENV = ${ENV}`));
const app = express();

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(firebaseServiceKey),
    storageBucket: "twilight-cloud.appspot.com"
})

const firebaseBucket = firebaseAdmin.storage().bucket();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
// app.use(morgan('dev'));

databaseConnection
    .authenticate()
    .then(() => console.info(chalk.success(`Celebs Database Connection Established Successfully!`)))
    .then(() => app.use('/admin/celeb', celebRoutes(databaseConnection, firebaseBucket, chalk)))
    .then(() => console.info(chalk.success(`Routes Established Successfully!`)))
    .catch((err) => console.error(chalk.error(`Celebs Database Connection Failed!\nError:${err}`)))

app.listen(PORT, () => console.log(chalk.info(`Server is running on port ${PORT}`)))