const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// const getStorage = () => {
//   return new CloudinaryStorage({
//     cloudinary,
//     params: {
//       folder: `nitva`,
//       resource_type: 'auto',
//     },
//   });
// };
const getStorage = () => {
  return new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
      let resourceType = "auto";

      if (file.mimetype === "application/pdf") {
        resourceType = "image";
      }

      return {
        folder: "nitva",
        resource_type: resourceType,
        access_mode: "public",   // 🔥 THIS LINE FIXES IT
      };
    },
  });
};




module.exports = { cloudinary, getStorage };


