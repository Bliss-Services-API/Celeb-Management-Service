'use strict';

/**
 * 
 * Routes handled by the server. These routes are used to access celeb profile data and images and 
 * manipulate them using various routes.
 * 
 * @param {Object} databaseConnection Sequelize object, which contains the database connection
 * @param {Object} S3Client AWS S3 Client Object
 * 
 */
module.exports = (databaseConnection, S3Bucket) => {

    //Import modules
    const fs = require('fs');
    const multer = require('multer');
    const chalk = require('../chalk.console');
    const express = require('express');
    const controller = require('../controllers')(databaseConnection, S3Bucket);

    //Initialize Variables
    const router = express.Router();
    const celebProfileDataMultipart = multer({dest: 'tmp/celeb-images/'});
    const profileDataController = controller.profileDataController;
    const profileImageController = controller.profileImageController;


    /**
     * 
     * Route to GET if the Image exists in the AWS S3 Bucket
     * 
     */
    router.get(`/image/exists`, async (req, res) => {
        const imageFileName = req.query.image_file_name;

        try {
            const imageExists = await profileImageController.checkImageExist(imageFileName);
            const response = {
                Message: 'DONE',
                ImageExists: imageExists
            };

            console.log(chalk.info(JSON.stringify(response)));
            res.send(response);
        }
        catch(err) {
            console.error(chalk.error(`{ERR: ${err.message}}`));
            res.send({
                ERR: err.message
            });
        }
    })
    
    /**
     * 
     * Route to GET the CDN link for downloading celeb image;
     * 
     */
    router.get('/image/downloadurl', async (req, res) => {
        const imageFileName = req.query.celeb_image_file_name;

        try {
            const imageExists = await profileImageController.checkImageExist(imageFileName);
            if(imageExists) {
                const url = await profileImageController.getDownloadUrl(imageFileName);
                const response = {
                    Message: 'DONE',
                    Response: 'Celeb Image Download URL Fetched',
                    URL: url
                };

                console.log(chalk.info(JSON.stringify(response)));
                res.send(response);

            } else {
                const response = {
                    ERR: `Image Doesn't Exists`
                };

                console.log(chalk.info(JSON.stringify(response)));
                res.send(response);
            }
        }
        catch(err) {
            console.error(chalk.error(`{ERR: ${err}}`));
            res.send({
                ERR: err.message
            });
        }
    });


    /**
     * 
     * Route to DELETE the celeb image, if the celeb profile has not been created yet
     * 
     */
    router.delete('/image/delete', async (req, res) => {
        const imageFileName = req.query.celeb_image_file_name;

        try {
            const response = await profileImageController.deleteImage(imageFileName);
            console.log(chalk.info(JSON.stringify(response)));
            res.send(response);
        }
        catch(err) {
            console.error(chalk.error(`ERR: ${err}`));
            res.send({
                ERR: err
            });
        }
    });
    
    /**
     * 
     * Route to POST the celeb Profile data in the DB and upload celeb image in the 
     * S3 Bucket. It uses multipart/form-data handling controllers.
     * 
     */
    router.post('/profile/upload', 
        celebProfileDataMultipart.single('celeb_image'),
        async (req, res) => {

            //Initialize Variables
            const celebName = req.body.celeb_name;
            const celebCategory = req.body.celeb_category;
            const celebIntroduction = req.body.celeb_introduction;
            const celebResponseTime = req.body.celeb_response_time;
            const imageFileName = req.body.celeb_image_file_name;
            const imageMIMEType = req.file.mimetype;
            const imageFileReadStream = fs.createReadStream(req.file.path);

            try {
                //Check if Image and Profile Exists already
                const imageExists = await profileImageController.checkImageExist(imageFileName);
                console.log(imageExists);
                const profileExists = await profileDataController.checkIfProfileExists(celebName);

                if(profileExists) {
                    //If Profile Exists, no need to do any thing.
                    
                    res.send({
                        ERR: 'Profile Already Exists'
                    });

                } else if(imageExists) {
                    //If Profile doesn't exists, but image has already been uploaded in the last requests,
                    //then no need to upload image again, just return the CDN link for the image, and
                    //upload the profile in the database
                    
                    const celebImageLink = profileImageController.getDownloadUrl(imageFileName);
                    const response = await profileDataController.createNewCelebAccount(celebName, celebCategory, celebIntroduction, celebResponseTime, celebImageLink);

                    response['ImageExists'] = true;
                    console.log(chalk.info(JSON.stringify(response)));
                    res.send(response);

                } else {
                    //Upload Image and then the profile in the database. None of the exists

                    const celebImageLink = await profileImageController.uploadCelebImage(imageFileReadStream, imageFileName, imageMIMEType);
                    const response = await profileDataController.createNewCelebAccount(celebName, celebCategory, celebIntroduction, celebResponseTime, celebImageLink);

                    response['ImageExists'] = false;
                    console.log(chalk.info(JSON.stringify(response)));
                    res.send(response);

                }
            }
            catch(err) {
                console.error(chalk.error(`ERR: ${err}`));
                res.send({
                    ERR: err.message
                });
            }
            finally {
                //Remove Celeb's Temp Image, stored in the temp/ folder
                fs.unlinkSync(req.file.path);
            }
        }
    );


    /**
     * 
     * Route to DELETE celeb profile record and celeb stats record, as well as celeb image from GCS
     * 
     */
    router.delete('/profile/delete', async (req, res) => {
        const celebName = req.query.celeb_name;
        const imageFileName = req.query.celeb_image_file_name;

        try {
            const profileExists = await profileDataController.checkIfProfileExists(celebName);
            if(!profileExists) {
                res.send({
                    Message: 'DONE',
                    Response: 'No Such Profile Exists.'
                });
            };

            const response = await profileDataController.deleteCelebProfile(celebName, imageFileName);
            console.log(chalk.info(JSON.stringify(response)));
            res.send(response);
        }
        catch(err) {
            console.error(chalk.error(`ERR: ${err}`));
            res.send({
                ERR: err.message
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
            const response = await profileDataController.getAllCelebProfile();
            console.log(chalk.info(JSON.stringify(response)));
            res.send(response);
        }
        catch(err) {
            console.error(chalk.error(`ERR: ${err}`));
            res.send({
                ERR: err.message
            });
        }
    });

  
    return router;
};