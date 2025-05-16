const fs = require('fs');

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('./../models/mongo/User');
const UpgradeReq = require('./../models/mongo/UpgradeReq');
const UpgradeLog = require('./../models/mongo/UpgradeLog');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');


const imgurAPI = require('../modules/imgurAPI');
const cloudinary = require('../modules/cloudinaryAPI');
const mailingAPI = require('../modules/mailingAPI');

exports.CheckID = catchAsync(async (req, res, next) => {
  if (user === undefined || !user) {
    return res.status(401).json({
      status: 'failed',
      message: 'invalid ID',
    });
  }
  next();
});

exports.CheckInput = catchAsync(async (req, res, next) => {
  var isInvalid = false;

  if (!req.body) {
    isInvalid = true;
  }

  if (isInvalid) {
    return next(new AppError('bodt is empty', 400));
  }
  next();
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Getting token and check if it's there

  console.log('protect');
  console.log(req.headers.authorization);
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // if (token === undefined) {
  //   return next(new AppError('You are not login', 401));
  // }
  //2) Validate token

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  console.log(decoded);
  //3) Check if user is existed

  const currentUser = await User.findById(decoded.id);
  //console.log(currentUser);

  if (!currentUser) {
    return next(new AppError('User no longer existed', 401));
  }
  //4) Check if user change password after JWT was issued

  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password. Please login again'));
  }

  // Access to protected route
  req.user = currentUser;
  next();
});

exports.GetUser = catchAsync(async (req, res, next) => {
  console.log(req.params);
  const account = req.params.account;

  req.query.fields = 'account,createdDate,username,email,photo,role,lastUpdated,premium';
  const features = new APIFeatures(User.findOne({ account: account }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populateObjects()
    .category()
    .timeline();
  const user = await features.query;

  if (user === undefined || !user || !user[0]) {
    return next(new AppError('No user found!', 404));
  }

  if (!(user[0].account === req.user.account || req.user.role === 'admin')) {
    return next(new AppError('You are not the admin or owner of this account!', 401));
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
});
exports.GetSelfUser = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 200,
    data: req.user,
  });
});

exports.GetUserById = catchAsync(async (req, res, next) => {
  req.query.fields = 'username, email, photo, role';

  const features = new APIFeatures(User.findOne({ _id: req.params.userId }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populateObjects()
    .category()
    .timeline();
  const user = await features.query;

  if (user === undefined || !user || !user[0]) {
    return next(new AppError('No user found!', 404));
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.UpdateUser = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (req.body.username !== '' && req.body.username) {
    user.username = req.body.username;
  }
  if (req.body.email !== '' && req.body.email) {
    user.email = req.body.email;
  }
  if (req.body.birthday !== '' && req.body.birthday) {
    user.birthday = req.body.birthday;
  }
  if (req.body.address !== '' && req.body.address) {
    user.address = req.body.address;
  }
  if (req.body.phone !== '' && req.body.phone) {
    user.phone = req.body.phone;
  }
  if (req.body.photo ) {
    user.photo = req.body.photo;
  }
  // user.role = req.body.role;
  // user.living_city = req.body.living_city;

  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    status: 'success',
    data: user,
    message: 'success update user',
  });
});

exports.DeleteUser = catchAsync(async (req, res, next) => {
  console.log(req.params);
  const account = req.params.account;
  const user = await User.findOne({ account: account });

  if (user === undefined || !user) {
    return next(new AppError('No user found!', 404));
  }

  if (!(user.account === req.user.account || req.user.role === 'admin')) {
    return next(new AppError('You are not the admin or owner of this account!', 401));
  }

  await user.deleteOne();
  res.status(204).json({
    status: 'success delete',
  });
});

exports.UpgradeReqUser = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (user === undefined || !user) {
    return next(new AppError('No user found!', 404));
  }
  if (user.premium === 'premium' || user.premium === 'admin' || user.premium === 'vip') {
    return next(new AppError('User already premium, vip or admin!', 400));
  }
  const upgradeReqCheck = await UpgradeReq.findOne({ user: user._id });
  if (upgradeReqCheck) {
    return next(new AppError('User upgrade request is pended!', 404));
  }

  // user.birthday = req.body.birthday;
  // user.address = req.body.address;
  // user.phone = req.body.phone;
  // await user.save({ validateBeforeSave: false });

  const upgradeReq = await UpgradeReq.create({ user: user, message: 'User want to upgrade to premium' });

  res.status(201).json({
    status: 'success',
    message: 'success request upgrade',
    upgradeReq: upgradeReq,
  });
});

exports.AcceptUpgradeReq = catchAsync(async (req, res, next) => {
  console.log(req.params);
  const account = req.params.account;

  const user = await User.findOne({ account: account });
  if (user === undefined || !user) {
    return next(new AppError('No user found!', 404));
  }

  const upgradeReq = await UpgradeReq.findOne({ user: user });
  console.log(upgradeReq);
  if (upgradeReq === undefined || !upgradeReq) {
    return next(new AppError('No upgrade request found!', 404));
  }

  const upgradeLog = await UpgradeLog.create({ admin: req.user, upgradeReq: upgradeReq, accepted: true });
  user.premium = 'premium';
  await user.save({ validateBeforeSave: false });
  upgradeReq.accepted = true;
  await upgradeReq.save({ validateBeforeSave: false });

  res.status(201).json({
    status: 'success',
    message: 'success upgrade user',
    premium: user.premium,
  });
});

exports.GetAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({});

  res.status(200).json({
    status: 'success get all user',
    data: users,
    requestTime: req.requestTime,
    message: 'Here is all the users!',
  });
});

exports.GetAllUpgradeRequest = catchAsync(async (req, res, next) => {
  const unaccepted_req = await UpgradeReq.find({ accepted: false });
  const accepted_req = await UpgradeReq.find({ accepted: true });

  res.status(200).json({
    status: 'success get all request',
    unaccepted_req,
    accepted_req,
  });
});

exports.GetUserUpgradeRequest = catchAsync(async (req, res, next) => {
  const unaccepted_req = await UpgradeReq.find({ accepted: false, user: req.user });
  const accepted_req = await UpgradeReq.find({ accepted: true, user: req.user });

  res.status(200).json({
    status: 'success get user request',
    data: {
      unaccepted_req,
      accepted_req,
    },
  });
});

exports.GetUserUpgradeRequestByAccount = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ account: req.params.account });

  console.log(user);

  if (user === undefined || !user) {
    return next(new AppError('No user found!', 404));
  }

  if (!(user.account === req.user.account || req.user.role === 'admin')) {
    return next(new AppError('You are not the admin or owner of this account!', 401));
  }
  const unaccepted_req = await UpgradeReq.find({ accepted: false, user: user });
  const accepted_req = await UpgradeReq.find({ accepted: true, user: user });

  res.status(200).json({
    status: 'success get user request',
    data: {
      unaccepted_req,
      accepted_req,
    },
  });
});

exports.UploadImage = catchAsync(async (req, res, next) => {
  let photo = { link: 'https://i.imgur.com/KNJnIR0.jpg' };

  if (!req.file) {
  } else {
    photo = await imgurAPI({ image: fs.createReadStream(req.file.path), type: 'stream' });
  }

  if (req.file) {
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path, function (err) {
        if (err) throw err;
        console.log(req.file.path + ' deleted!');
      });
    } else {
    }
  }

  res.status(201).json({
    status: 'success upload image',
    data: photo.link,
  });
});
