'use strict'

const Models = require('../models');

module.exports = (DBConnection, firebaseBucket) => {
    const celebProfileModel = Models(DBConnection).CelebProfileModel;
    const celebStatsModel = Models(DBConnection).CelebStatsModel;

    const getAllCelebProfile = function() {
        return celebProfileModel
        .findAll({
            includes: [{
                model: celebStatsModel
            }]
        })
        .then((celebs) => { return celebs; })
        .catch((err) => { return `Error Fetching Data! ${err}` })
    }
    
    return {
        getAllCelebProfile,
    };
}