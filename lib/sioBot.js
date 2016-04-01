'use strict';

const https = require('https');
const Rx = require('rx');
const Telegram = require('node-telegram-bot');
const config = require('./config');
const BotRepository = require('./botRepository');

const BOT_NAME = 'SioDailyBot';

const rxHttpsGet = (url) => {
  return Rx.Observable.create(obs => {
    https.get(url, (res) => {
      obs.onNext(res);
      obs.onCompleted();
    }).on('error', (e) => {
      obs.onError(e);
    });
  });
};

class SioBot {

  constructor(commands) {
    this.bot = new Telegram(config.telegram);
    this.repository = new BotRepository();

    this.rxSendMessage = Rx.Observable.fromNodeCallback(this.bot.sendMessage, this.bot);
    this.rxSendPhoto = Rx.Observable.fromNodeCallback(this.bot.sendPhoto, this.bot); 

    this.startPolling(commands);
  }

  startPolling(commands) {
    console.log('Trying to start polling Telegram...');

    let events = Rx.Observable.fromEvent(this.bot, 'message');
    let newChats = events.filter(SioBot.isChatExisting);
    let oldChats = events.filter(event => !SioBot.isChatExisting(event));

    let newChatsSubscriber = newChats.doOnNext(this.addChat, this).subscribe();
    let oldChatsSubscriber = oldChats.doOnNext(this.delChat, this).subscribe();

    let commandsSubscriber = Rx.Observable
      .from(Object.keys(commands))
      .select(c => new RegExp('(?:/)(' + c + ')(?:@' + BOT_NAME + '){0,1}(?:(?:\\s)+(.*))*'))
      .selectMany(c => {
        return events
          .filter(e => e && e.text)
          .select(event => {
            let matches = event.text.match(c);
            if (matches) {
              return {
                command: matches[1],
                args: matches[2],
                event: event
              }
            }
          });
      })
      .filter(c => c)
      .doOnNext(c => {
        console.log('Calling command %s with param %s', c.command, c.args);
        return commands[c.command](c.event, c.args);
      })
      .subscribe();
    
    this.bot.start();

    let errors = Rx.Observable.fromEvent(this.bot, 'error');
    let errorsSubscriber = errors
      .filter(err => err.message === 'Duplicate token.')
      .subscribe(err => {
        newChatsSubscriber.dispose();
        oldChatsSubscriber.dispose();
        commandsSubscriber.dispose();
        errorsSubscriber.dispose();
        console.error('There is another bot instance polling Telegram, retrying in 5000ms');
        setTimeout(() => {
          this.bot.stop();
          this.startPolling(commands);
        }, 5000);
      });
  }

  static isChatExisting(event) {
    return (!event.left_chat_participant || event.left_chat_participant.username !== BOT_NAME);
  };

  addChat(event) {
    this.repository.addChat(event.chat.id);
  };

  delChat(event) {
    this.repository.delChat(event.chat.id);
  };

  getAllChats() {
    return this.repository.getAllChats();
  };

  sendImage(chatId, imageLink, caption) {
    return rxHttpsGet(imageLink)
      .selectMany(stream => {
        console.log('Sending image "%s" to chat %s...', caption, chatId);
        return this.rxSendPhoto({
          chat_id: chatId,
          caption: caption,
          files: {
            filename: caption + '.jpg',
            stream: stream,
            contentType: 'image/jpg'
          }
        });
      });
  };

  sendImageAll(imageLink, title, url) {
    return this.getAllChats()
      .selectMany(chatId => {
        return this.sendImage(chatId, imageLink, title, url);
      });
  };

  sendText(chatId, text) {
    return this.rxSendMessage({
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    });
  };

  sendTextAll(text) {
    return this.getAllChats()
      .selectMany(chatId => {
        return this.sendText(chatId, text);
      });
  };

}

module.exports = SioBot;