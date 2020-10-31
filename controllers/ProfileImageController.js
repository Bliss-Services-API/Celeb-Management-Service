'use strict'

/**
 * Function to handle the operations on the celeb images, uploaded on the Google Cloud Storage.
 * Opertions include, check if image exists, delete image, and generating signedURL for uploading image.
 * @param {Object} firebaseBucket Object containing the firebase bucket object
 */
module.exports = (firebaseBucket) => {

    /**
     * Function to check if the celeb image file already exists in the Google Cloud Storage
     * @param {String} imageFileName Name of the image file stored in the google cloud storage
     */
    const checkImageExist = async (imageFileName) => {
        const imageFile = firebaseBucket.file(imageFileName);
        const imageExists = await imageFile.exists();

        return {
            Message: 'DONE',
            'ImageExists?': imageExists[0]
        };
    }

    /**
     * 
     * Function to delete celeb image file stored in the Google Cloud Storage
     * @param {String} imageFileName Name of the image file stored in the google cloud storage
     * 
     */
    const deleteImage = async (imageFileName) => {
        const imageFile = firebaseBucket.file(imageFileName);
        const imageFileDeleteResponse = await imageFile.delete();

        if(imageFileDeleteResponse[0]) {
            return {
                Message:'DONE',
                'ImageDeleted?': true
            }
        } else {
            throw new Error(`Image Couldn't Delete`);
        }
    }

    /**
     * 
     * @param {String} celebName Name fo the Celeb
     * @param {String} imageType MIME type of the Celeb Image to be uploaded in the Google CLoud Storage
     * @param {boolean} imageOverrite if true, will override the image if already exists. Else, if image already exists, will throw an error
     */
    const getImageUploadSignedURL = async (celebName, imageType, imageOverrite = false) => {
        const celebFileName = `celebs/${celebName}.${imageType}`;
        const celebImageFile = firebaseBucket.file(celebFileName);

        const signedUrlOptions = {
            version: 'v4',
            action: 'write',
            expires: Date.now() + 120000,
            contentType: `image/${imageType}`
        };

        const fileExists = await checkImageExist(celebFileName);
        const signedUrlGenerationResponse = await celebImageFile.getSignedUrl(signedUrlOptions);
        const celebImageUploadURL = signedUrlGenerationResponse[0];

        if(fileExists["ImageExists?"] && !imageOverrite) {
            throw new Error(`Celeb Image Already Exists`);
        } else if(fileExists["ImageExists?"] && imageOverrite) {
            return {
                Message: 'DONE',
                Response: `Celeb Image Already Exists. Uploading will override the image`,
                URL: celebImageUploadURL,
                ImageOverriden: true,
            };
        }

        else if(!fileExists["ImageExists?"]) {
            return {
                Message: 'DONE',
                Response: `Image Uploaded Successfully!`,
                URL: celebImageUploadURL,
                ImageOverriden: false,
            }
        }

        else {
            throw new Error("Bad Request")
        }
    }
    
    return {
        getImageUploadSignedURL, checkImageExist, deleteImage
    };
}