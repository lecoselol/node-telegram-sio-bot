const Redis = require('ioredis');
const Rx = require('rx');
const config = require('./config');

class ChatRepository {
  constructor() {
    this.redis = new Redis({
      port: config.redis.port,
      host: config.redis.host,
      password: config.redis.password
    });
  }

  addChat(chatId) {
    redis.sadd('chats', chatId);
  };

  delChat(chatId) {
    redis.srem('chats', chatId);
  };

  getAllChats() {
    return Rx.Observable.fromPromise(redis.smembers('chats'));
  }

}

module.exports = ChatRepository;