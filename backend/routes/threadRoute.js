const express = require('express');
const threadController = require('../controllers/threadController');
const videoController = require('../controllers/videoController');

const authController = require('../controllers/authController');
const { upload, uploadVideo } = require('../modules/multerAPI.js');

const router = express.Router();

//router.param('slug', threadController.CheckSlug);

//ROUTE HANDLER
router
  .route('/')
  .get(threadController.GetAllThreads)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'content-creator'),
    threadController.CheckInput,
    threadController.CreateNewThread
  );

router
  .route('/content-creator/:account')
  .get(
    authController.protect,
    authController.restrictTo('content-creator', 'admin'),
    threadController.GetAllThreadsByUser
  );

router.route('/tag/:tag').get(threadController.GetAllThreadsByTag);

router.route('/search/:title').get(threadController.SearchThreads);

router.route('/top-5-popular').get(threadController.aliasTop5Threads, threadController.GetAllThreads);

router.route('/upload-video').post(uploadVideo, videoController.GetVideoThumbnail, videoController.UploadNewFileDrive);

// router.route('/upload-video-onedrive').post(uploadVideo, threadController.UploadNewFileOnedrive);

router.route('/user/:userId').get(threadController.GetAllThreadsByUserId);

router
  .route('/comments/:account')
  .get(authController.protect, authController.restrictTo('content-creator'), threadController.fetchCommentsFromUser);

router.route('/comments/ext').get(threadController.GetAllComments);

router
  .route('/comments/ext/:id')
  .get(threadController.CheckCommentID, threadController.GetComment)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'content-creator', 'user'),
    threadController.CheckCommentID,
    threadController.UpdateComment
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'content-creator', 'user'),
    threadController.CheckCommentID,
    threadController.DeleteComment
  );
router.route('/comments/like/:id').get(threadController.CheckCommentID, threadController.UserLikeComment);

router
  .route('/:slug/comment')
  .get(threadController.CheckSlug, threadController.GetAllCommentsFromThread)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'content-creator', 'user'),
    threadController.CheckSlug,
    threadController.CreateNewComment
  );

//người dùng thích bài thread
router
  .route('/:slug/like')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'content-creator', 'user'),
    threadController.CheckSlug,
    threadController.UserLikeThread
  );

//lấy số like bài thread
router.route('/:slug/like-count').get(threadController.CheckSlug, threadController.GetThreadLikeCount);

//kiểm tra bài viết đã được người dùng thích chưa
router
  .route('/:slug/like-check')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'content-creator', 'user'),
    threadController.CheckSlug,
    threadController.CheckThreadLike
  );

router
  .route('/:slug')
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'content-creator'),
    threadController.CheckSlug,
    threadController.UpdateThread
  );

router
  .route('/:slug')
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'content-creator'),
    threadController.CheckSlug,
    threadController.DeleteThread
  );
router.route('/:slug/:n?').get(threadController.CheckSlug, threadController.GetThread);

module.exports = router;
