const cloudinary = require('cloudinary');
const CloudinaryStorage = require('multer-storage-cloudinary');
require('dotenv').config();
cloudinary.v2.config({
    //cloud_name, api_key, api_secret should be not changed
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wanderlust_DEV',
    allowedFormats: ['png', 'jpg', 'jpeg']
  },
});

module.exports = {
    cloudinary,
    storage
}