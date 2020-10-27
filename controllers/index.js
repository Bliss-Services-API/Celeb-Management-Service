'use strict';

/**
 * 
 * Exporting all the controllers for handling routes of the server
 * 
 * @param {Sequelize} databaseConnection Sequelize object
 * @param {Firebase Object} firebaseBucket Firebase bucket object
 */
module.exports = (databaseConnection, firebaseBucket) => {
    const profileDataController = require('./ProfileDataController')(databaseConnection, firebaseBucket);
    const profileImageController = require('./ProfileImageController')(firebaseBucket);
    
    return {
        profileDataController,
        profileImageController  
    };
}