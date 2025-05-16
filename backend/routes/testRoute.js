const express = require('express');
const fs = require('fs');
const testController = require('../controllers/testController');
const threadController = require('../controllers/threadController');
const userController = require('../controllers/userController');
const {
  upload,
  uploadVideo,
  uploadImage,
  uploadMultipartFile,
  uploadMultipartFileChunk,
} = require('../modules/multerAPI.js');
const router = express.Router();
const tempHls = fs.readFileSync('./public/client.html', 'utf-8');

//ROUTE HANDLER

router.route('/multipart-upload').post(uploadVideo, testController.UploadNewFile);

router.route('/upload-video').post(uploadVideo, testController.UploadNewFile);
router.route('/upload-video-large').post(uploadVideo, testController.UploadNewFileLarge);
router
  .route('/upload-video-large-multipart')
  .post(uploadMultipartFileChunk, testController.UploadNewFileLargeMultilpart);
// router.route('/upload-video-large-multipart-concatenate').post( testController.UploadNewFileLargeMultilpartConcatenate,testController.UploadNewFileLargeGetVideoThumbnail);
router
  .route('/upload-video-large-multipart-concatenate')
  .post(testController.UploadNewFileLargeMultilpartConcatenate, testController.UploadNewFileLargeConvertToHls);

router.route('/threads').get(testController.GetAllThreads).post(testController.CreateNewThread);
router.route('/ffmpeg').post(testController.FFmpeg);
router.route('/video-stream-file/:filename').get(testController.VideoStreamingFile);
router.route('/video-stream-hls/:filename').get(testController.VideoStreamingHLS);
router.route('/video-proc/convert-stream/:filename').get(testController.VideoConverter);
router.route('/video-proc/OPTIONSVideoRequest/:filename').options(testController.VideoPlayOPTIONS);

router.route('/template-hls/:filename').get(testController.VideoTemplateHLSStreaming, (req, res, next) => {
  console.log('template');
  console.log(req.filename);
  res.writeHead(200, {
    'Content-type': 'text/html',
  });
  const output = tempHls.replace(/{%FILENAME%}/g, req.filename);

  res.end(output);
  return;
});

module.exports = router;
