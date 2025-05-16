const express = require('express');
const fs = require('fs');
const videoController = require('../controllers/videoController.js');
const actionController = require('../controllers/actionController.js');
const authController = require('../controllers/authController');

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

// bê từ redirect qua
router
  .route('/comment/:videoID')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'user', 'content-creator'),
    actionController.GetVideoByID,
    actionController.CommentVideo
  );
router
  .route('/add-playlist/:videoID')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'user', 'content-creator'),
    actionController.GetVideoByID,
    actionController.AddVideoToPlaylist
  );
router
  .route('/create-playlist')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'user', 'content-creator'),
    actionController.CreatePlaylist
  );
router
  .route('/get-all-playlist')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'user', 'content-creator'),
    actionController.GetUserAllPlaylist
  );

router
  .route('/get-all-comment/:videoID')
  .get(actionController.GetVideoByID, actionController.GetAllVideoCommentWithVideoID);

module.exports = router;
