'use strict'


/**
 * 
 * ProfileDataContoller handle the requests for the celeb profile operations.
 * Operations include profile creation, fetching profile, deleting profile.
 * 
 * @param {Object} databaseConnection Sequelize object, which contains the database connection
 * @param {Object} firebaseBucket Object containing the firebase bucket object
 * 
 */
module.exports = (databaseConnection, firebaseBucket) => {
    const Models = require('../models');
    const imageController = require('./ProfileImageController');
    const celebProfileModel = Models(databaseConnection).celebProfileModel;
    const celebStatsModel = Models(databaseConnection).celebStatsModel;

    /**
     * 
     * Function which will create the record of the celeb in both the profile db, and in the stats db
     * 
     * @param {String} celebName Celeb Name, who wants to create a new account
     * @param {String (8 bits)} celebCategory Bits represents the category in sequence, in which the celeb works in
     * @param {Text} celebIntroduction Celeb's brienf introduction
     * @param {BigInt} celebResponseTime Response time, according to the celeb
     * @param {String} celebImageType MIME type of celeb image, viz., png, jpeg, ... etc
     */
    const createNewCelebAccount = async (celebName, celebCategory, celebIntroduction, celebResponseTime, celebImageType) => {
        const imageFileName = `celebs/${celebName}.${celebImageType}`;
        const celebImageReference = firebaseBucket.file(imageFileName);
        const celebJoiningDate = new Date().getTime();

        const celebProfileData = {
            celeb_name: celebName,
            celeb_category: celebCategory,
            celeb_introduction: celebIntroduction,
            celeb_image_link: imageFileName,
            celeb_joining_date: celebJoiningDate
        };

        const celebStatsData = {
            celeb_name: celebName,
            celeb_shares: 0,
            celeb_likes: 0,
            celeb_response_rate: 100,
            celeb_response_time: celebResponseTime,
            celeb_last_online: new Date().getTime()
        };

        const imageUploaded = await celebImageReference.exists();
        if(imageUploaded[0]){
            return databaseConnection.transaction((transactionKey) => {
                return celebProfileModel.create(celebProfileData, {transaction: transactionKey})
                .then(() => {
                    return celebStatsModel.create(celebStatsData, {transaction: transactionKey})
                })
                .then(() => {
                    return {
                        Message: 'DONE'
                    }
                })
            })
            .catch((err) => {
                return new Error(err);
            });
        }
        else {
            throw new Error(`Please Upload Image Before Uploading Data`);
        }

    }

    /**
     * 
     * Function to fetch all the profile of the celebs from the profile db and the stats db.
     * 
     */
    const getAllCelebProfile = async () => {
        const celebsFetched = await celebProfileModel.findAll(
            { attributes: ['celeb_name', 'celeb_category', 'celeb_introduction', 'celeb_joining_date']},
            { includes: [{ model: celebStatsModel }] });

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
     * Function to delete the celeb image, then the celeb records from profile db, and then
     * the stats db.
     * 
     * @param {String} celebName Name of the Celebrity, whose profile wants to be deleted
     * 
     */
    const deleteCelebProfile = async celebName => {
        try {
            return databaseConnection.transaction((transactionKey) => {
                return celebProfileModel.findAll({
                        attributes: ['celeb_image_link'],
                        where: { celeb_name: celebName }
                    }, {transaction: transactionKey})
                    
                .then(async (celebProfileDataFetched) => {
                    const celebImageFileName = celebProfileDataFetched[0]['dataValues']['celeb_image_link'];
                    const celebImageDelete = await imageController(firebaseBucket).deleteImage(celebImageFileName);
                    return celebImageDelete;
                })
                .then((celebImageDelete) => {
                    if(celebImageDelete.Message === 'DONE') {
                        return celebStatsModel.destroy({where: { celeb_name: celebName }}, {transaction: transactionKey})
                        .then(() => {
                            return celebProfileModel.destroy({where: { celeb_name: celebName }}, {transaction: transactionKey});
                        })
                    }
                })
            })
            .then(() => {
                return {
                    Message: 'DONE',
                    CelebProfileDeleted: celebName
                };
            })
            .catch((err) => {
                throw new Error(err);
            });
        }
        catch(err) {
            throw new Error(err);
        }
    };

    return {
        createNewCelebAccount, getAllCelebProfile, deleteCelebProfile
    };
}