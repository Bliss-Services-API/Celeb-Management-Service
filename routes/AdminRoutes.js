'use strict';

const router = require('express').Router();
const ProfileController = require('../controllers');

module.exports = (DBConnection, firebaseBucket) => {

    const CelebProfileController = ProfileController(DBConnection, firebaseBucket);

    router.use('/', (req, res, next) => {
        if(req.header("admin_key") == process.env.API_KEY) next();
        else res.status(403).send("Unauthorized Access!");
    })

    router.post('/celeb/profile/create', async (req, res) => {
        const signedUrl = await CelebProfileController.CreateProfile(req);
        res.send({ "Response": signedUrl });
    })

    router.delete('/celeb/profile/delete/id', async (req, res) => {
        const ack = await CelebProfileController.DeleteProfileById(req);
        res.send({ "Response": ack });
    });

    router.delete('/celeb/profile/delete/name', async (req, res) => {
        const ack = await CelebProfileController.DeleteProfileByName(req);
        res.send({ "Response" : ack });
    });

    router.get('/celeb/profile/fetch/all', async (req, res) => {
        const ack = await CelebProfileController.FetchCelebProfile();
        res.send({ "Response" : ack });
    });

    return router;
};