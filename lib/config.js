'use strict';

const _ = require('lodash');

const config = {
  facebook: {
    appId: process.env.TELEGRAM_SIO_DAILY_BOT_FACEBOOK_APP_ID,
    appSecret: process.env.TELEGRAM_DAILY_SIO_BOT_FACEBOOK_APP_SECRET
  },
  telegram: {
    token: process.env.TELEGRAM_SIO_DAILY_BOT_TELEGRAM_TOKEN
  },
  redis: {
    host: process.env.TELEGRAM_SIO_DAILY_BOT_REDIS_HOST,
    port: process.env.TELEGRAM_SIO_DAILY_BOT_REDIS_PORT,
    password: process.env.TELEGRAM_SIO_DAILY_BOT_REDIS_PASSWORD
  },
  port: process.env.PORT
};

let jsonConfig = {};
try {
  jsonConfig = require('./../config.json');
} catch (Error) {}

module.exports = _.defaultsDeep(config, jsonConfig);
