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
const morgan = require('morgan');
const chalk = require('./chalk.console');
const AWS = require('aws-sdk');

const PORT = process.env.PORT || 7000;
const ENV = process.env.NODE_ENV;

let databaseConnection;

if(ENV === 'development') {
    console.log(chalk.info('##### SERVER RUNNING IN DEVELOPMENT MODE #####'));
    databaseConnection = require('./connections/PGConnection')('development');
} else if(ENV == 'production') {
    console.log(chalk.info('##### SERVER RUNNING IN PRODUCTION MODE #####'));
    databaseConnection = require('./connections/PGConnection')('production');
}
else {
    console.error(chalk.error('##### NO ENV PROVIDED #####'));
    process.exit(1);
}

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(morgan('dev'));

AWS.config.getCredentials((err) => {
    if(err) {
        console.error(chalk.error(`CREDENTIALS NOT LOADED`));
        process.exit(1);
    }
    else console.log(chalk.info(`##### AWS ACCESS KEY IS VALID #####`));
});

AWS.config.update({region: 'us-east-2'});
const S3Client = new AWS.S3({apiVersion: '2006-03-01'});

databaseConnection
    .authenticate()
    .then(() => console.info(chalk.success(`Celebs Database Connection Established Successfully!`)))
    .then(() => app.use('/admin/celeb', celebRoutes(databaseConnection, S3Client)))
    .then(() => console.info(chalk.success(`Routes Established Successfully!`)))
    .catch((err) => console.error(chalk.error(`Celebs Database Connection Failed!\nError:${err}`)));

app.listen(PORT, () => console.log(chalk.info(`Server is running on port ${PORT}`)))