module.exports = (DBConnection, firebaseBucket) => {
    const CreateProfile = require('./ProfileCreate')(DBConnection, firebaseBucket).createNewCelebAccount;
    const DeleteProfileById = require('./ProfileDelete')(DBConnection, firebaseBucket).deleteCelebProfileById;
    const DeleteProfileByName = require('./ProfileDelete')(DBConnection, firebaseBucket).deleteCelebProfileByName;
    const FetchCelebProfile = require('./FetchCelebProfile')(DBConnection, firebaseBucket).getAllCelebProfile;
    
    return {
        CreateProfile,
        DeleteProfileById,
        DeleteProfileByName,
        FetchCelebProfile
    };
}