'use strict';

/**
 * 
 * Routes handled by the server. These routes are used to access celeb profile data and manipulate them.
 * 
 * @param {Object} databaseConnection Sequelize object, which contains the database connection
 * @param {Object} firebaseBucket Object containing the firebase bucket object
 * @param {Object} chalk Object extending chalk.js attributes
 * 
 */
module.exports = (databaseConnection, firebaseBucket, chalk) => {

    const router = require('express').Router();
    const profileController = require('../controllers');
    const celebProfileController = profileController(databaseConnection, firebaseBucket);

    /**
     * 
     * Route to GET signedURL for PUT celeb image in GCS
     * 
     */
    router.get('/profile/image/upload-url', async (req, res) => {
        const celebName = req.query.celeb_name;
        const celebImageType = req.query.image_type;
        const override = req.query.override;

        try {
            const response = await celebProfileController.profileImageController.getImageUploadSignedURL(celebName, celebImageType, override);
            console.log(chalk.info(JSON.stringify(response)));
            res.send(response);
        }
        catch(err) {
            console.error(chalk.error(`{ERR: ${err}}`));
            res.status(401).send({
                ERR: err
            });
        }
    });


    /**
     * 
     * Route to GET if the Image exists in the GCS
     * 
     */
    router.get(`/profile/image/exists`, async (req, res) => {
        const celebName = req.query.celeb_name;
        const imageType = req.query.image_type;

        const celebFileName = `celebs/${celebName}.${imageType}`;

        try {
            const response = await celebProfileController.profileImageController.checkImageExist(celebFileName);
            console.log(chalk.info(JSON.stringify(response)));
            res.send(response);
        }
        catch(err) {
            console.error(chalk.error(`{ERR: ${err}}`));
            res.send({
                ERR: err
            });
        }
    })

    
    /**
     * 
     * Route to POST the celeb Profile data in the DB
     * 
     */
    router.post('/profile/data', async (req, res) => {
        const celebName = req.body.celeb_name;
        const celebCategory = req.body.celeb_category;
        const celebIntroduction = req.body.celeb_introduction;
        const celebResponseTime = req.body.celeb_response_time;
        const celebImageType = req.body.celeb_image_type;

        try {
            const response = await celebProfileController.profileDataController.createNewCelebAccount(celebName, celebCategory, celebIntroduction, celebResponseTime, celebImageType)
            console.log(chalk.info(JSON.stringify(response)));
            res.send(response);
        }
        catch(err) {
            console.error(chalk.error(`{ERR: ${err}}`));
            res.send({
                ERR: err
            });
        }
    })


    /**
     * 
     * Route to DELETE celeb profile record and celeb stats record, as well as celeb image from GCS
     * 
     */
    router.delete('/profile/delete', async (req, res) => {
        const celebName = req.query.celeb_name;

        try {
            const response = await celebProfileController.profileDataController.deleteCelebProfile(celebName);
            console.log(chalk.info(JSON.stringify(response)));
            res.send(response);
        }
        catch(err) {
            console.error(chalk.error(`{ERR: ${err}}`));
            res.send({
                ERR: err
            });
        }
    });


    /**
     * 
     * Route to GET all the celeb's record in the database, except their images' GCS references
     * 
     */
    router.get('/profile/fetch/all', async (req, res) => {
        try {
            const response = await celebProfileController.profileDataController.getAllCelebProfile();
            console.log(chalk.info(JSON.stringify(response)));
            res.send(response);
        }
        catch(err) {
            console.error(chalk.error(`{ERR: ${err}}`));
            res.send({
                ERR: err
            });
        }
    });

    return router;
};