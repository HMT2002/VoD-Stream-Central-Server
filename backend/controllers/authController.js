const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const crypto = require('crypto');

const User = require('./../models/mongo/User');
const Log = require('./../models/mongo/Log');
const Server = require('./../models/mongo/Server');
const Video = require('./../models/mongo/Video');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

const imgurAPI = require('../modules/imgurAPI');
const cloudinary = require('../modules/cloudinaryAPI');
const mailingAPI = require('../modules/mailingAPI');
const moment = require('moment');

const SignToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

exports.SignUp = catchAsync(async (req, res, next) => {
  console.log('signup!');
  console.log(req.body);

  const { account, password, passwordConfirm, email, username, role } = req.body;

  //console.log(photo);

  // const cloudinaryData = await cloudinary(req.body.photo);

  // console.log(cloudinaryData);

  if (!account || !password || !passwordConfirm || !email || !username) {
    next(new AppError('Please provide full information for sign up.', 400));
  }

  let photo = { link: 'https://i.imgur.com/KNJnIR0.jpg' };

  if (!req.file) {
  } else {
    photo = await imgurAPI({ image: fs.createReadStream(req.file.path), type: 'stream' });
  }

  const newUser = await User.create({
    account: account,
    password: password,
    passwordConfirm: passwordConfirm,
    email: email,
    username: username,
    passwordChangedAt: Date.now(),
    role: role,
    photo: { link: photo.link },
  });

  const token = SignToken(newUser._id);

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
    status: 'success create new user',
    data: {
      account: newUser.account,
      avatar: newUser.photo.link,
      username: newUser.username,
      role: newUser.role,
      token: token,
    },
  });
});

// #region Old-Signup
// exports.SignUp = catchAsync(async (req, res, next) => {
//   console.log(req.body);

//   const { account, password, passwordConfirm, email, username, role } = req.body;

//   //console.log(photo);

//   // const cloudinaryData = await cloudinary(req.body.photo);

//   // console.log(cloudinaryData);

//   if (!account || !password || !passwordConfirm || !email || !username) {
//     next(new AppError('Please provide full information for sign up.', 400));
//   }

//   const photo = await imgurAPI({ image: fs.createReadStream(req.file.path), type: 'stream' });
//   const newUser = await User.create({
//     account: account,
//     password: password,
//     passwordConfirm: passwordConfirm,
//     email: email,
//     username: username,
//     passwordChangedAt: Date.now,
//     role: role,
//     photo: { link: photo.link },
//   });

//   const token = SignToken(newUser._id);

//   fs.unlinkSync(req.file.path, function (err) {
//     if (err) throw err;
//     console.log(req.file.path + ' deleted!');
//   });
//   res.status(201).json({
//     status: 'success create new user',
//     token: token,
//     data: {
//       user: newUser,
//     },
//   });
// });
// #endregion

exports.SignIn = catchAsync(async (req, res, next) => {
  console.log(req.body);

  const { account, password } = req.body;
  if (!account || !password) {
    return next(new AppError('Please provide account and password.', 400));
  }
  const user = await User.findOne({ account: account }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Wrong information.', 401));
  }

  console.log(user);

  const token = SignToken(user._id);

  res.status(200).json({
    status: 'success sign in',
    data: {
      account: user.account,
      avatar: user.photo.link,
      username: user.username,
      role: user.role || 'guest',
      token: token,
    },
  });
});

exports.SignUpGoogle = catchAsync(async (req, res, next) => {
  console.log('signup!');
  console.log(req.body);

  const { account, password, passwordConfirm, email, username, role } = req.body;

  //console.log(photo);

  // const cloudinaryData = await cloudinary(req.body.photo);

  // console.log(cloudinaryData);

  if (!account || !password || !passwordConfirm || !email || !username) {
    next(new AppError('Please provide full information for sign up.', 400));
  }

  let photo = { link: 'https://i.imgur.com/KNJnIR0.jpg' };

  if (!req.file) {
  } else {
    photo = await imgurAPI({ image: fs.createReadStream(req.file.path), type: 'stream' });
  }

  const newUser = await User.create({
    account: account,
    password: password,
    passwordConfirm: passwordConfirm,
    email: email,
    username: username,
    passwordChangedAt: Date.now,
    role: role,
    photo: { link: photo.link },
  });

  const token = SignToken(newUser._id);

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
    status: 'success create new user',
    data: {
      account: newUser.account,
      avatar: newUser.photo.link,
      username: newUser.username,
      role: newUser.role,
      token: token,
    },
  });
});
exports.SignInGoogle = catchAsync(async (req, res, next) => {
  console.log(req.body);

  const { account, password } = req.body;
  if (!account || !password) {
    return next(new AppError('Please provide account and password.', 400));
  }
  const user = await User.findOne({ account: account }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Wrong information.', 401));
  }

  console.log(user);

  const token = SignToken(user._id);

  res.status(200).json({
    status: 'success sign in',
    data: {
      account: user.account,
      avatar: user.photo.link,
      username: user.username,
      role: user.role || 'guest',
      token: token,
    },
  });
});

exports.SignOut = catchAsync(async () => {
  console.log(req.body);
  res.status(201).json({
    status: 'User sign out!',
    data: {
      user: req.body,
    },
  });
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
    return next(new AppError('Signed in user is no longer existed', 401));
  }
  //4) Check if user change password after JWT was issued

  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password. Please login again'));
  }

  // Access to protected route
  req.user = currentUser;
  next();
});

exports.Check = catchAsync(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    status: 200,
    message: 'user token is fine',
    role: req.user.role,
  });
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles ['admin','content-creator']. role='guest'

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

exports.ForgetPassword = async (req, res, next) => {
  //1. Get user base on email
  console.log(req.body);
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Please provide email to reset password', 400));
  }
  const user = await User.findOne({ email: email });

  if (!user) {
    return next(new AppError('Check input email, no user', 404));
  }

  //2. Generate the random reset token

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  //3. Send it to user email

  const resetURL = req.protocol + ':/' + req.get('host') + '/api/v1/reset-password/' + resetToken;

  const message =
    'Forgot password? Submit a PATCH request with your new password and passwordConfirm to: ' +
    resetURL +
    ' . If you did not forget email, please ignore this email! ';

  try {
    await mailingAPI({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
      token: resetToken,
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There were an error sending email. Try again later', 500));
  }
};

exports.ResetPassword = catchAsync(async (req, res, next) => {
  //1. Get user base on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now } });
  //2. If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired!', 400));
  }
  //3. Update the changedPasswordAt property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //4. Log the user in, send JWT
  const token = SignToken(user._id);
  res.status(201).json({
    status: 'success',
    token: token,
  });
});

exports.ChangePassword = catchAsync(async (req, res, next) => {
  console.log('Change password route');
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  console.log(decoded);

  const currentUser = await User.findById(decoded.id).populate([{ path: 'department', strictPopulate: false }]);

  if (!currentUser) {
    return next(new AppError('Signed in user is no longer existed', 401));
  }
  currentUser.password = req.body.password;
  currentUser.passwordConfirm = req.body.passwordConfirm;
  currentUser.passwordResetToken = undefined;
  currentUser.passwordResetExpires = undefined;
  await currentUser.save();
  //4. Log the user in, send JWT
  const newToken = SignToken(currentUser._id);
  res.status(200).json({
    status: 200,
    token: newToken,
    message: 'Success change password',
  });
});
