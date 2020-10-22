'use strict';

const Sequelize = require('sequelize');
const dbConfig = require('../config/config.json');

const connection = new Sequelize(dbConfig.development.database, dbConfig.development.username, dbConfig.development.password, {
    host: dbConfig.development.host,
    port: dbConfig.development.port,
    dialect: dbConfig.development.dialect,
    logging: console.log,
    pool: {
        max: 5,
        min: 0,
        idle: 1000
    },
})

module.exports = connection;