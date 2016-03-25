const Redis = require('ioredis');
const Rx = require('rx');
const config = require('./config');

const CHATS_SET_KEY = 'chats';

class ChatRepository {
  constructor() {
    this.redis = new Redis({
      port: config.redis.port,
      host: config.redis.host,
      password: config.redis.password
    });
  }

  addChat(chatId) {
    this.redis.sadd(CHATS_SET_KEY, chatId);
  };

  delChat(chatId) {
    this.redis.srem(CHATS_SET_KEY, chatId);
  };

  getAllChats() {
    return Rx.Observable.fromPromise(this.redis.smembers(CHATS_SET_KEY));
  }

}

module.exports = ChatRepository;
