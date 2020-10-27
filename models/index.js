'use strict';

/**
 * 
 * Exporting all the Models in the app, including their associations
 * 
 * @param {Sequelize} databaseConnection Sequelize object
 */
module.exports = (databaseConnection) => {
    const celebProfileModel = require('./CelebProfileModel')(databaseConnection);
    const celebStatsModel = require('./CelebStatsModel')(databaseConnection);

    celebStatsModel.belongsTo(celebProfileModel, { foreignKey: 'celeb_name' });
    celebProfileModel.hasOne(celebStatsModel, { foreignKey: 'celeb_name' });

    return {
        celebProfileModel,
        celebStatsModel
    };
};