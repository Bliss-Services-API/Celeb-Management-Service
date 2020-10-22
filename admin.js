'use strict';

require('dotenv').config();

const chalk = require('./chalk.console');
const DBConnection = require('./connections/PGConnection');
const bodyParser = require('body-parser');
const express = require('express');
const AdminRoutesAPI = require('./routes/AdminRoutes');
const firebaseAdmin = require('firebase-admin');
const firebaseServiceKey = require('./config/firebase.json');
const morgan = require('morgan');

const PORT = process.env.PORT || 7000;
const app = express();

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(firebaseServiceKey),
    storageBucket: "bigwig-media-server.appspot.com"
})

const firebaseBucket = firebaseAdmin.storage().bucket();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(morgan('dev'));

DBConnection
    .authenticate()
    .then(() => { console.info(chalk.success(`Admin DB Connection Established Successfully!`)); })
    .then(() => {
        app.use('/admin', AdminRoutesAPI(DBConnection, firebaseBucket));
        console.info(chalk.success(`Routes Established Successfully!`));
    })
    .catch((err) => { console.error(chalk.error(`Admin DB Connection Failed!\nError:${err}`)); })

app.listen(PORT, () => {
    console.log(chalk.info(`Server is running on port ${PORT}`));
})