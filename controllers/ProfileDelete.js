'use strict'

const Models = require('../models');

const deleteCelebImage = async (celebProfileData, firebaseBucket) => {
    return new Promise(async (resolve, reject) => {
        try {
            const file = firebaseBucket.file(celebProfileData[0]['celeb_image_link']);
            const fileExist = file.exists()
            if(fileExist[0]){
                await file.delete();
                resolve('Celeb Image Deleted!')
            } else {
                resolve(`Image File Doesn't Exist! It seems it was already deleted.`);
            }
        }
        catch(err) {
            reject(err);
        }
    });
}

module.exports = (DBConnection, firebaseBucket) => {
    const celebProfileModel = Models(DBConnection).CelebProfileModel;
    const celebStatsModel = Models(DBConnection).CelebStatsModel;

    const deleteCelebProfileById = function (req) {
        return DBConnection.transaction((transactionKey) => {

            //Get CelebImageLink from database
            return celebProfileModel.findAll({ 
                attributes: ['celeb_image_link'], 
                where: { 
                    celeb_id: req.body.celeb_id }
                }, 
            { transaction: transactionKey })
            
            //Delete the celeb image file, if exists, from firebaseStorage Bucket
            .then(async (celebData) => { await deleteCelebImage(celebData, firebaseBucket) })

            //Delete Celeb Records from Database
            .then(() => {
                return celebStatsModel.destroy({ 
                    where: { celeb_id: req.body.celeb_id }
                },
                { transaction: transactionKey })

                .then(() => {
                    return celebProfileModel.destroy({ 
                        where: { 
                            celeb_id: req.body.celeb_id 
                        }
                    }, 
                    { transaction: transactionKey })
                })
            })
        })
        
        .then(() => { 
            console.log('Celeb Profile Deleted Successfully!');
            return 'Celeb Profile Deleted Successfully!!'
        })
        
        .catch((err) => {
            console.error(`Error Deleting Celeb Profile!\n${err}`);
            return {Error: err};
        });
    };

    const deleteCelebProfileByName = function (req) {
        return DBConnection.transaction((transactionKey) => {

            //Get Celeb Id and Celeb Image
            return celebProfileModel.findAll({
                attributes: ['celeb_id', 'celeb_image_link'],
                where: { 
                    celeb_name: req.body.celeb_name,
                }
            }, {transaction: transactionKey})

            //Delete the celeb image file, if exists, from firebaseStorage Bucket
            .then(async (celebData) => { 
                await deleteCelebImage(celebData, firebaseBucket) 
                return celebData[0]['celeb_id'];
            })

            //Delete Celeb Records from Database
            .then((celebId) => {
                return celebStatsModel.destroy({
                    where: { celeb_id: celebId }
                }, {transaction: transactionKey})                    

                .then(() => {
                    return celebProfileModel.destroy({
                        where: { celeb_id: celebId }
                    }, {transaction: transactionKey})
                })
            })
        })
        .then(() => { 
            console.log(`${req.body['celeb_name']} profile has been deleted successfully!`);
            return `${req.body['celeb_name']} profile has been deleted successfully!`;
        })
        .catch((err) => {
            console.error(`Error Deleting Celeb Profile!\n${err}`);
            return {Error: err};
        });
    };

    return {
        deleteCelebProfileById,
        deleteCelebProfileByName,
    };
}