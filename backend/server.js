const dotenv = require('dotenv');
var path = require('path');

dotenv.config({ path: './config.env' });

const app = require('./app');
const cronjobAPI = require('./modules/cronjobAPI');

const dbVideoSharing = require('./config/database/db_index');

dbVideoSharing.connect();

//console.log(process.env);
//START SERVER
const port = process.env.PORT || 9000;
const server = app.listen(port, () => {
  console.log('App listening to ' + port);
});

//START CRON JOB
const cron = require('node-cron');

cron.schedule(
  '0 3 * * 0',
  async () => {
    console.log('running a task every sunday on 3:0 am, Ho Chi Minh city');

    cronjobAPI.ResetVideoEveryWeek();
  },
  {
    scheduled: true,
    timezone: 'Asia/Ho_Chi_Minh',
  }
);
