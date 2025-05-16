const cloudinary = require('cloudinary');

module.exports = async (photo) => {
  const data = cloudinary.v2.uploader.upload(photo, {
    folder: 'avatars',
    width: 150,
    crop: 'scale',
  });
  return data;
};
