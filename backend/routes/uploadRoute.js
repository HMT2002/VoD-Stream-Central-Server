const express = require('express');
const fs = require('fs');
const uploadController = require('../controllers/uploadController.js');
const {
  upload,
  uploadVideo,
  uploadImage,
  uploadMultipartFile,
  uploadMultipartFileChunk,
} = require('../modules/multerAPI.js');
const router = express.Router();

//ROUTE HANDLER

router
  .route('/sub')
  .post(uploadController.CheckFileBeforeReceive, uploadMultipartFileChunk, uploadController.UploadNewFileSubtitle);

module.exports = router;
