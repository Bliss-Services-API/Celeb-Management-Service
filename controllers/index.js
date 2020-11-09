'use strict';

/**
 * 
 * Exporting all the controllers for handling routes of the server
 * 
  * @param {Sequelize} databaseConnection Sequelize object
 * @param {AWS-SDK S3 Object} S3Bucket Firebase bucket object
 */
module.exports = (databaseConnection, S3Bucket) => {
    const profileDataController = require('./ProfileDataController')(databaseConnection, S3Bucket);
    const profileImageController = require('./ProfileImageController')(databaseConnection, S3Bucket);
    
    return {
        profileDataController,
        profileImageController  
    };
}