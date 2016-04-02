'use strict';

const Redis = require('ioredis');
const Rx = require('rx');
const config = require('./config');

const CHATS_SET_KEY = 'chats';
const LAST_POLLED_DATE = 'lastPolledDate';

class BotRepository {
  constructor() {
    this.redis = new Redis({
      port: config.redis.port,
      host: config.redis.host,
      password: config.redis.password
    });
  }

  addChat(chatId) {
    this.redis.sadd(CHATS_SET_KEY, chatId);
  }

  delChat(chatId) {
    this.redis.srem(CHATS_SET_KEY, chatId);
  }

  getAllChats() {
    return Rx.Observable.fromPromise(this.redis.smembers(CHATS_SET_KEY))
      .flatMap(el => el);
  }

  getLastPolledDate() {
    return Rx.Observable.fromPromise(this.redis.get(LAST_POLLED_DATE))
      .select(date => new Date(parseInt(date, 10)));
  }

  setLastPolledDate() {
    this.redis.set(LAST_POLLED_DATE, (new Date()).getTime());
  }

}

module.exports = BotRepository;
