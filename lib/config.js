'use strict';

var _ = require('lodash');

let config = {
  facebook: {
    appId: process.env.TELEGRAM_SIO_DAILY_BOT_FACEBOOK_APP_ID,
    appSecret: process.env.TELEGRAM_DAILY_SIO_BOT_FACEBOOK_APP_SECRET
  },
  telegram: {
    token: process.env.TELEGRAM_SIO_DAILY_BOT_TELEGRAM_TOKEN
  }
};

let jsonConfig = {};
try {
  jsonConfig = require('./../config.json');
} catch (Error) {}

module.exports = _.defaultsDeep(config, jsonConfig);
