const express = require('express');
const defaultController = require('../controllers/defaultController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const { uploadImage } = require('../modules/multerAPI.js');

const router = express.Router();

//ROUTE HANDLER
router.route('/').get(defaultController.Default);
router.route('/forget-password').post(authController.ForgetPassword);
router.route('/reset-password/:token').patch(authController.ResetPassword);
router.route('/fu').post(defaultController.Fu);
router.route('/change-password').patch(authController.ChangePassword);
router.post('/upload-image', uploadImage, userController.UploadImage);

router.route('/all-alive-server').get(defaultController.TestAllAlive);
router.route('/testreset').get(defaultController.ResetServerTest);

module.exports = router;
