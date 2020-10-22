module.exports = (pgConnection) => {
    const CelebProfileModel = require('./CelebProfileModel')(pgConnection);
    const CelebStatsModel = require('./CelebStatsModel')(pgConnection);

    CelebStatsModel.belongsTo(CelebProfileModel, { foreignKey: 'celeb_id' });
    CelebProfileModel.hasOne(CelebStatsModel, { foreignKey: 'celeb_id' });

    return {
        CelebProfileModel,
        CelebStatsModel
    };
};