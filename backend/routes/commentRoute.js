const express = require('express');
const fs = require('fs');
const videoController = require('../controllers/videoController.js');
const actionController = require('../controllers/actionController.js');
const authController = require('../controllers/authController.js');

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
  .route('/video/:videoID')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'user', 'content-creator'),
    actionController.GetVideoByID,
    actionController.CommentVideo
  )
  .get(actionController.GetVideoByID, actionController.GetAllVideoCommentWithVideoID);

router
  .route('/info/:infoID')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'user', 'content-creator'),
    actionController.GetInfoByID,
    actionController.CommentInfo
  )
  .get(actionController.GetInfoByID, actionController.GetAllVideoCommentWithInfoID);

router.route('/user/:userID').get(actionController.GetUserByID, actionController.GetAllVideoCommentWithUserID);

module.exports = router;
