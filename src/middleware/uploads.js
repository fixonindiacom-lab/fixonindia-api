const multer = require("multer");
const { getStorage } = require("../config/cloudinary");

const storage = getStorage("profile"); // store profile images under nitvashcodx/profile

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
