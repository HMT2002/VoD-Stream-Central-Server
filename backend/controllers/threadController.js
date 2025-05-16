const fs = require('fs');
const path = require('path');
const moment = require('moment');

const Thread = require('../models/mongo/Thread');
const User = require('../models/mongo/User');
const Comment = require('../models/mongo/Comment');
const Like = require('../models/mongo/Like');
const Notification = require('../models/mongo/Notification');


const helperAPI = require('../modules/helperAPI');
const imgurAPI = require('../modules/imgurAPI');

const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const NotificationFactory = require('./../utils/notificationFactory');

const fluentFfmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
fluentFfmpeg.setFfmpegPath(ffmpegPath);
const ffmpeg = require('ffmpeg');
const axios = require('axios');

exports.CheckSlug = catchAsync(async (req, res, next) => {
  // console.log('Slug value is: ' + req.params.slug);

  // let slug = req.params.slug;

  // slug = slug.trim();

  // // chuyển về dạng tổ hợp
  // slug = slug.normalize('NFD');
  // // xóa các ký tự dấu tổ hợp
  // slug = slug.replace(/[\u0300-\u036f]/g, '');
  // // chuyển chữ đ/Đ thành d/D
  // slug = slug.replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'));

  // slug = slug.toLowerCase();
  // slug = slug.replace('-', '_');

  // slug = slug.replace(' ', '-');

  //req.query.populateObjects = 'user';
  // req.query.fields = 'title,createDate,content,user,video,slug';
  const features = new APIFeatures(
    Thread.findOne({ slug: req.params.slug }).populate('user', 'username photo'),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populateObjects()
    .category()
    .timeline();
  const thread = await features.query;
  // const thread = await Thread.findOne({ slug: req.params.slug }).populate('user');

  if (thread.length === 0) {
    return next(new AppError('No thread found with that slug', 404));
  }

  req.thread = thread[0];

  next();
});

exports.CheckCommentID = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  req.query.populateObjects = 'user,thread';
  const features = new APIFeatures(Comment.findOne({ _id: id }).populate('user', 'username photo'), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populateObjects()
    .category()
    .timeline();
  const comment = await features.query;

  // const comment = await Comment.findOne({ _id: id });

  // const thread = await Thread.findOne({ slug: req.params.slug }).populate('user');

  if (comment.length === 0) {
    return next(new AppError('No comment found with that id', 404));
  }

  req.comment = comment[0];

  next();
});

exports.CheckInput = (req, res, next) => {
  var isInvalid = false;

  if (!req.body) {
    isInvalid = true;
  }

  if (isInvalid) {
    return next(new AppError('Missing thread information'), 406);
  }
  next();
};

exports.aliasTop5Threads = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-createDate';
  // req.query.fields = 'createDate,title';
  req.query.timeline = Date.now;

  next();
};

exports.SearchThreads = catchAsync(async (req, res) => {
  // req.query.populateObjects = 'user';
  console.log(req.params);

  const features = new APIFeatures(
    Thread.find({ title: new RegExp(req.params.title, 'i') }).populate('user', 'username photo'),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populateObjects()
    .category()
    .timeline();
  const threads = await features.query;

  res.status(200).json({
    status: 'success',
    data: {
      threads: threads,
    },
  });
});

exports.GetAllThreads = catchAsync(async (req, res) => {
  // req.query.populateObjects = 'user';

  const features = new APIFeatures(Thread.find().populate('user', 'username photo'), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populateObjects()
    .category()
    .timeline();
  const threads = await features.query;

  // console.log('req cookies is: ');
  // console.log(req.cookies);
  //console.log(threads);
  res.status(200).json({
    status: 'success',
    // result: threads.length,
    // requestTime: req.requestTime,
    data: {
      threads: threads,
    },
  });
});

exports.GetAllThreadsByUser = catchAsync(async (req, res) => {
  // req.query.populateObjects = 'user';

  const creator = await User.findOne({ account: req.params.account });
  const features = new APIFeatures(Thread.find({ user: creator }).populate('user', 'username photo'), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populateObjects()
    .category()
    .timeline();
  const threads = await features.query;

  res.status(200).json({
    status: 'success',
    // result: threads.length,
    // requestTime: req.requestTime,
    data: {
      threads: threads,
    },
  });
});

exports.GetAllThreadsByUserId = catchAsync(async (req, res) => {
  // req.query.populateObjects = 'user';
  const creator = await User.findOne({ _id: req.params.userId });
  const features = new APIFeatures(Thread.find({ user: creator }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populateObjects()
    .category()
    .timeline();
  const threads = await features.query;

  res.status(200).json({
    status: 'success',
    // result: threads.length,
    // requestTime: req.requestTime,
    data: {
      threads: threads,
    },
  });
});

exports.GetAllThreadsByTag = catchAsync(async (req, res) => {
  const features = new APIFeatures(Thread.find({ tag: req.params.tag }).populate('user', 'username photo'), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populateObjects()
    .category()
    .timeline();
  const threads = await features.query;

  res.status(200).json({
    status: 'success',
    data: { threads: threads },
  });
});


exports.GetThread = catchAsync(async (req, res, next) => {
  // console.log(req.params);

  const thread = req.thread;
  if (thread === undefined || !thread) {
    return next(new AppError('No thread found!', 404));
  }
  res.status(200).json({
    status: 200,
    data: {
      thread: thread,
    },
  });
});

exports.CreateNewThread = catchAsync(async (req, res, next) => {
  console.log('api/v1/threads');
  //console.log(req.params);
  console.log(req.body);

  const user = req.user;
  const newThread = await Thread.create({ ...req.body, user: user });

  res.status(201).json({
    status: 200,
    data: newThread,
  });
});

exports.CreateNewComment = catchAsync(async (req, res, next) => {
  console.log('api/v1/threads/' + req.params.slug + '/comment');
  //console.log(req.body);

  const slug = req.params.slug;
  const thread = req.thread;
  const user = req.user;
  const comment = { ...req.body, thread: thread, user: user };
  //console.log(comment);

  const newComment = await Comment.create(comment);
  //console.log(newComment);

  const notification = new NotificationFactory(
    req.user.username + ' has comment in your post',
    'comment',
    user,
    thread.user,
    thread
  ).create();
  // console.log(notification);
  res.status(201).json({
    status: 200,
    data: { content: newComment.content, user: newComment.user._id, thread: newComment.thread._id },
  });
});

exports.UserLikeThread = catchAsync(async (req, res, next) => {
  console.log('api/v1/threads/' + req.params.slug + '/like');
  //console.log(req.body);

  const slug = req.params.slug;
  const thread = req.thread;
  const user = req.user;

  const check = await Like.findOne({ user: user, thread: thread });
  // console.log(check);
  if (check) {
    console.log('already liked!');

    await User.findByIdAndUpdate(thread.user, { $inc: { points: -1 } });
    await Thread.findByIdAndUpdate(thread, { $inc: { points: -1 } });

    await check.deleteOne();

    const checknotify = await Notification.findOne({
      thread: thread,
      sender: user,
      receiver: thread.user,
      notitype: 'like',
    });
    await checknotify.deleteOne();

    res.status(201).json({
      status: 'success dislike!',
      threadPoints: thread.points - 1 * 1,
      userPoint: thread.user.points - 1 * 1,
    });
  } else {
    console.log('havent liked yet!');

    const like = { thread: thread, user: user };

    const newLike = await Like.create(like);

    await User.findByIdAndUpdate(thread.user, { $inc: { points: 1 } });
    await Thread.findByIdAndUpdate(thread, { $inc: { points: 1 } });
    //console.log(newLike);

    const notification = new NotificationFactory(
      req.user.username + ' liked your post',
      'like',
      user,
      thread.user,
      thread
    ).create();

    res.status(201).json({
      status: 200,
      data: newLike,
      threadPoints: thread.points + 1 * 1,
      userPoint: thread.user.points + 1 * 1,
    });
  }
});

exports.UserLikeComment = catchAsync(async (req, res, next) => {
  const user = req.user;
  const comment = req.comment;
  res.status(201).json({
    status: 200,
    user,
    comment,
    data: {
      message: 'Not yet finish',
    },
  });
});

exports.GetThreadLikeCount = catchAsync(async (req, res, next) => {
  console.log('api/v1/threads/' + req.params.slug + '/like-count');
  //console.log(req.body);

  const slug = req.params.slug;
  const thread = await Thread.findOne({ slug: slug });
  const user = req.user;

  // const check = await Like.find({ user: user, thread: thread });
  // console.log(check);

  res.status(201).json({
    status: 200,
    data: thread.points,
  });
});

exports.CheckThreadLike = catchAsync(async (req, res, next) => {
  console.log('api/v1/threads/' + req.params.slug + '/like-check');
  //console.log(req.body);

  const slug = req.params.slug;
  const thread = await Thread.findOne({ slug: slug });
  const user = req.user;

  const check = await Like.findOne({ user: user, thread: thread });
  if (check) {
    console.log('already liked!');
    res.status(201).json({
      status: 'check!',
      message: 'User already like thread!',
    });
  } else {
    console.log('havent liked yet!');
    res.status(201).json({
      status: 'check!',
      message: 'User havent like thread yet!',
    });
  }
});

exports.GetAllComments = catchAsync(async (req, res, next) => {
  console.log('api/v1/threads/comments/ext/');
  //console.log(req.body);

  //console.log(comment);

  const features = new APIFeatures(
    Comment.find().populate('user', 'username photo').populate('thread', 'title slug content tag'),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populateObjects('user')
    .category()
    .timeline();

  const comments = await features.query;
  //console.log(newComment);

  res.status(201).json({
    status: 200,
    data: comments,
  });
});

exports.GetComment = catchAsync(async (req, res, next) => {
  // console.log('api/v1/threads/comments/ext/' + req.params.id);
  // const id = req.params.id;

  // const comment = await Comment.findOne({ _id: id });

  res.status(201).json({
    status: 200,
    data: req.comment,
  });
});

exports.GetAllCommentsFromThread = catchAsync(async (req, res, next) => {
  console.log('api/v1/threads/' + req.params.slug + '/comment');
  //console.log(req.body);

  const slug = req.params.slug;
  // req.query.populateObjects='user'

  const thread = await Thread.findOne({ slug: slug });
  //console.log(comment);

  const features = new APIFeatures(Comment.find({ thread: thread }).populate('user', 'username photo'), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populateObjects()
    .category()
    .timeline();
  const comments = await features.query;

  const userThreadsComments = comments.filter((comment) => comment.user != null);

  res.status(201).json({
    status: 200,
    data: userThreadsComments,
  });
});

exports.fetchCommentsFromUser = async (req, res, next) => {
  // console.log('api/v1/threads/' + req.params.account + '/comment');
  //console.log(req.body);

  // req.query.populateObjects='user'

  const features = new APIFeatures(
    Comment.find().populate('user', 'username photo').populate('thread', 'title slug video user'),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate()
    .populateObjects()
    .category()
    .timeline();
  const comments = await features.query;

  const userThreadsComments = comments.filter(
    (comment) =>
      comment.thread.user.valueOf() === req.user._id.valueOf() &&
      comment.user != null &&
      comment.user.valueOf() != req.user._id.valueOf()
  );

  res.status(200).json({
    status: 200,
    data: userThreadsComments,
  });
};

exports.UpdateThread = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const thread = req.thread;
  console.log('threadUserId ? reqUserId: ' + (thread.user.id !== req.user.id));
  if (thread === undefined || !thread) {
    return next(new AppError('No user found!', 404));
  }
  if (thread.user.id !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You are not the admin or the creator of this thread!', 401));
  }

  thread.content = req.body.content;
  thread.video = req.body.video;
  thread.title = req.body.title;
  thread.slug = req.body.slug;
  thread.tag = req.body.tag;
  thread.updateDate = Date.now;
  await thread.save();

  console.log(thread);

  res.status(201).json({
    status: 'success update',
    data: thread,
  });
});

exports.DeleteThread = catchAsync(async (req, res, next) => {
  console.log(req.params);
  const slug = req.params.slug;
  const thread = await Thread.findOne(req.thread).populate('user');

  if (!(thread.user.account === req.user.account || req.user.role === 'admin')) {
    return next(new AppError('You are not the admin or the creator of this thread!', 401));
  }

  await thread.deleteOne();

  res.status(200).json({
    status: 'success delete',
  });
});

exports.UpdateComment = catchAsync(async (req, res, next) => {
  console.log('api/v1/threads/comments/ext/' + req.params.id);
  const id = req.params.id;

  const comment = req.comment;
  if (comment === undefined || !comment) {
    return next(new AppError('No user found!', 404));
  }
  if (!(comment.user.account === req.user.account)) {
    return next(new AppError('You are not the creator of this comment!', 401));
  }

  comment.content = req.body.content;

  await comment.save();

  res.status(200).json({
    status: 'success update comment',
    data: comment,
  });
});

exports.DeleteComment = catchAsync(async (req, res, next) => {
  console.log('api/v1/threads/comments/ext/' + req.params.id);
  const id = req.params.id;

  const comment = req.comment;

  if (
    !comment.user.account === req.user.accoun &&
    !comment.thread.user.valueOf() === req.user._id.valueOf() &&
    !req.user.role === 'admin'
  ) {
    return next(new AppError('You are not the creator of this comment!', 401));
  }

  await comment.deleteOne();

  res.status(200).json({
    status: 'success delete',
  });
});

// User.findById("63b1332c8a41f608100eeffd")
//     .populate({ path: "posts", select: "title -_id" })
