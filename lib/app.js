'use strict';

const Rx = require('rx');
const express = require('express');
const config = require('./config');
const SioFb = require('./sioFb');
const SioBot = require('./sioBot');
const pkg = require('./../package.json');

module.exports = function() {

  const errorHandler = (e) => {
    console.error(e);
    if (e.stack) {
      console.error(e.stack);
    }
  };

  const textHandler = (message) => {
    console.log('OK: Sent image with text %s.', message.text.replace(/\n/m, ' '));
  };

  const observer = Rx.Observer.create(undefined, errorHandler, undefined);

  const getDatePart = (image, markdown) => {
    return (markdown ? '*\[' : '[') + 
      new Date(image.created_time).toLocaleDateString() + 
      ']' + (markdown ? '*' : '') + ' ';
  };

  const getText = (image) => {
    return getDatePart(image, true) + image.name + '\n' +
      '[Image](' + image.images[0].source + ') | ' +
      '[FB Post](' + image.link + ')';
  };

  const getShortCaption = (image) => {
    let caption = '';
    let createdTime = getDatePart(image);
    let link = '\n(' + image.link + ')';
    // if the link is too big, remove it altogether
    if (link.length > 200) {
      link = '';
    }
    caption = link;
    let text = (createdTime + image.name).trim();
    // if the regular message is too long than the remaining available space
    if (text.length > (200 - link.length)) {
      text = text.substring(0, (197 - link.length)) + '...';
    }
    caption = text + caption;
    return caption;
  };

  const getSendImageFn = (event) => {
    return (image) => {
      return sioBot.sendText(event.chat.id, getText(image));
    };
  };

  let app = express();
  app.get('/', (req, res) => {
    res.send(pkg.name + ' v' + pkg.version);
  });
  app.listen(config.port || 3000, () => {
    console.log('Telegram Sio Bot is live on port %s!', config.port || 3000);
  });

  let sioBot = new SioBot({
    start: (event) => {
      return sioBot.addChat(event)
        .doOnNext(() => {
          return sioBot.sendText(event.chat.id, 'OK AHAHAHAHLOL')
        }).subscribe(observer);
    },
    stop: (event) => {
      return sioBot.delChat(event)
        .doOnNext(() => {
          return sioBot.sendText(event.chat.id, 'UFFA CHE PYZZA PERO\' VABBE\' CIAO');
        }).subscribe(observer);        
    },
    oggy: (event) => {
      return sioFb.getLastStrip()
        .selectMany(getSendImageFn(event))
        .subscribe(textHandler, errorHandler);
    },
    canemagic: (event) => {
      // stupid Facebook can only offset up to 500 elements
      return sioFb.getStripsWithConfig({
          limit: 1,
          offset: Math.floor(Math.random() * 499)
        })
        .selectMany(getSendImageFn(event))
        .subscribe(textHandler, errorHandler);
    },
    banana: (event) => {
      return sioBot.sendText(event.chat.id, 'CHI HA DETTO BANANA?')
        .subscribe(observer);
    },
    version: (event) => {
      return sioBot.sendText(event.chat.id, pkg.version)
        .subscribe(observer);
    }
  });

  let sioFb = new SioFb();
  sioFb.pollForNewStrips()
    .selectMany(image => {
      return sioBot.sendTextAll(getText(image));
    })
    .subscribe(observer);

};