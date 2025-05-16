const express = require('express');
const fs = require('fs');
const videoController = require('../controllers/videoController.js');
const redirectController = require('../controllers/redirectController.js');
const serverController = require('../controllers/serverController.js');

const {
  upload,
  uploadVideo,
  uploadImage,
  uploadMultipartFile,
  uploadMultipartFileChunk,
} = require('../modules/multerAPI.js');
const router = express.Router();

router.route('/').get(serverController.AllVideoOnServer);

module.exports = router;
