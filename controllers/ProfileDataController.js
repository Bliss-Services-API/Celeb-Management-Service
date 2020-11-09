'use strict'


/**
 * 
 * Controller for Handling Celeb Data uploaded in the Postgresql database in the AWS-RDS
 * 
 * @param {Sequelize} databaseConnection Sequelize Object, containing the connection for the Database
 * @param {aws-sdk object} S3Client Object containing the AWS S3 reference
 * 
 */
module.exports = (databaseConnection, S3Bucket) => {
    //Importing Modules
    const Models = require('../models');
    const imageController = require('./ProfileImageController');

    //Initializing Variablse
    const celebProfileModel = Models(databaseConnection).celebProfileModel;
    const celebStatsModel = Models(databaseConnection).celebStatsModel;
    
    /**
     * 
     * Function for uploading celeb data in the database, and completing the profile creation
     * 
     * @param {string} celebName Name of the celeb, whose profile is to be created
     * @param {string} celebCategory 8 bits, representing the category celeb works
     * @param {text} celebIntroduction Text, introducing celeb
     * @param {number} celebResponseTime BigInt, representing how many seconds does it take for celeb to
     * respond to the request from the clients
     * @param {string} celebImageLink URL for downloading celeb image from the CDN (cached)
     * 
     * @returns JSON responding whether the profile has been created
     * 
     */
    const createNewCelebAccount = async (celebName, celebCategory, celebIntroduction, celebResponseTime, celebImageLink) => {
        const celebJoiningDate = new Date().getTime();

        const celebProfileData = {
            celeb_name: celebName,
            celeb_category: celebCategory,
            celeb_introduction: celebIntroduction,
            celeb_image_link: celebImageLink,
            celeb_joining_date: celebJoiningDate
        };

        const celebStatsData = {
            celeb_name: celebName,
            celeb_shares: 0,
            celeb_likes: 0,
            celeb_response_rate: 100,
            celeb_response_time: celebResponseTime,
            celeb_last_online: celebJoiningDate
        };

        return databaseConnection.transaction(async (transactionKey) => {
            await celebProfileModel.create(celebProfileData, {transaction: transactionKey});
            await celebStatsModel.create(celebStatsData, {transaction: transactionKey});
            
            return {
                Message: 'DONE',
                Response: 'Profile Created Successfully!'
            }
        })
        .catch((err) => {
            return new Error(err);
        });
    }

    /**
     * 
     * Function for getting all of the celeb profile, present in the database
     * 
     * @returns JSON, containing the array of Celebs
     * 
     */
    const getAllCelebProfile = async () => {
        const celebsFetched = await celebProfileModel.findAll(
            { includes: [{ model: celebStatsModel }] }
        );

        const celebs = [];

        celebsFetched.forEach(celeb => {
            celebs.push(celeb['dataValues']);    
        });

        return {
            Message: 'DONE',
            Celebs: celebs
        };
    }

    /**
     * 
     * Function to check whether celeb profile exists in the database
     * 
     * @param {string } celebName Name of the celeb, whose profile is being checked
     * @returns boolean true, if profile exists. false, if it doesn't
     * 
     */
    const checkIfProfileExists = async celebName => {
        const celebProfile = await celebProfileModel.findAll({
            where: {
                celeb_name: celebName
            }
        });

        if(celebProfile.length === 0) {
            return false;
        } else {
            return true;
        };
    }
    
     /**
     * 
     * Function to delete celeb profile and the image from the database and AWS S3
     * 
     * @param {string } celebName Name of the celeb, whose profile is being checked
     * @param {string} imageFileName Name of the Celeb Image File (.png)
     * @returns name of the celeb whose profile has been deleted
     * 
     */
    const deleteCelebProfile = async (celebName, imageFileName) => {
        return databaseConnection.transaction(async (transactionKey) => {
            await celebStatsModel.destroy({where: { celeb_name: celebName }}, {transaction: transactionKey});
            await celebProfileModel.destroy({where: { celeb_name: celebName }}, {transaction: transactionKey});
            await imageController(databaseConnection, S3Bucket).deleteImage(imageFileName);

            return {
                Message: 'DONE',
                Response: 'Profile Deleted Successfully!',
                CelebName: celebName
            };
        })
        .catch((err) => {
            throw new Error(err);
        })
    };

    return {
        createNewCelebAccount, getAllCelebProfile, deleteCelebProfile, checkIfProfileExists
    };
}