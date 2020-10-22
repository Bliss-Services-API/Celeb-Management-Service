'use strict'

const Models = require('../models');
const crypto = require('crypto');

module.exports = (DBConnection, firebaseBucket) => {
    const celebProfileModel = Models(DBConnection).CelebProfileModel;
    const celebStatsModel = Models(DBConnection).CelebStatsModel;

    const createNewCelebAccount = async function (req) {

        const celebProfile = req.body.profile;
        const celebStats = req.body.stats;
        const celebImageMetadata = req.body.image;

        const idUnEncrypted = celebProfile['celeb_name'].concat(process.env.MAGIC_WORD);
        const celebEncryptedId = crypto.createHash('sha256').update(idUnEncrypted).digest('hex');

        celebProfile['celeb_id'] = celebEncryptedId;
        celebProfile['celeb_joining_date'] = new Date().getTime();

        celebStats['celeb_id'] = celebEncryptedId;
        celebStats['celeb_shares'] = '0';
        celebStats['celeb_likes'] = '0';
        celebStats['celeb_response_rate'] = '100';
        celebStats['celeb_last_online'] = new Date().getTime();

        const metadata = { contentType: celebImageMetadata.contentType }

        const signUrlOptions = {
            action: 'write',
            expires: new Date().getTime() + 60000 * 5,
            contentType: metadata.contentType,
        };

        let imageFileName = '';

        if(metadata.contentType === 'image/png') imageFileName = `celeb_images/${celebProfile['celeb_name']}.png`;
        if(metadata.contentType === 'image/jpeg') imageFileName = `celeb_images/${celebProfile['celeb_name']}.jpg`;

        const file = firebaseBucket.file(imageFileName)
        celebProfile['celeb_image_link'] = imageFileName;

        return file.getSignedUrl(signUrlOptions).then((data) => {
            const signedUrl = data[0];
            console.log(signedUrl);
            return signedUrl;
        })
        .then((signedUrl) => {
            return DBConnection.transaction((transactionKey) => {
                return celebProfileModel.create(celebProfile, {transaction: transactionKey})
                .then(() => { 
                    return celebStatsModel.create(celebStats, {transaction: transactionKey})
                })
            })
            .then(() => {
                return {
                    Message: 'Celeb Profile Created Successfully!',
                    SignedURL: signedUrl
                }
            })
            .catch((err) => { throw new Error(err) })
        })
        .then((signedUrl) => { return signedUrl })
        .catch((err) => { return { Error: err.message } })
    }
    
    return {
        createNewCelebAccount
    };
}