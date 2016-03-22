'use strict';

const Rx = require('rx');
const express = require('express');
const config = require('./config');
const SioFb = require('./sioFb');
const SioBot = require('./sioBot');

module.exports = function() {

  const observer = Rx.Observer.create(undefined, (e) => console.error(e.stack), undefined);

  const imageToCaption = (image) => {
    return '[' + new Date(image.created_time).toLocaleDateString() + '] ' + image.name + '\n(' +
           image.link + ')';
  };

  let sioBot = new SioBot({
    start: (event) => {
      return sioBot.sendText(event.chat.id, 'OK AHAHAHAHLOL')
        .subscribe(observer);
    },
    stop: (event) => {
      return sioBot.sendText(event.chat.id, 'LOL NO.')
        .subscribe(observer);
    },
    oggy: (event) => {
      return sioFb.getLastStrip()
        .selectMany(image => {
          return sioBot.sendImage(event.chat.id, image.images[0].source, imageToCaption(image));
        })
        .subscribe(observer);
    },
    canemagic: (event) => {
      // stupid Facebook can only offset up to 500 elements
      return sioFb.getStripsWithConfig({
          limit: 1,
          offset: Math.floor(Math.random() * 499)
        })
        .selectMany(image => {
          return sioBot.sendImage(event.chat.id, image.images[0].source, imageToCaption(image));
        })
        .subscribe(observer);
    },
    banana: (event) => {
      return sioBot.sendText(event.chat.id, 'CHI HA DETTO BANANA?')
        .subscribe(observer);
    }
  });

  let sioFb = new SioFb();
  sioFb.pollForNewStrips()
    .selectMany(image => {
      return sioBot.sendImageAll(image.images[0].source, imageToCaption(image));
    })
    .subscribe(observer);

  let app = express();
  app.get('/', (req, res) => {
    res.send('Banana!');
  });
  app.listen(config.port, () => {
    console.log('Telegram Sio Bot is live on port %s!', config.port);
  });

};