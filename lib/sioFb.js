'use strict';

const Rx = require('rx');
const _ = require('lodash');
const config = require('./config');
const BotRepository = require('./botRepository');

const PHOTOS_ENDPOINT = '10150121181310700/photos';
// the `since` parameter would be a nice thing but it's broken, Facebook being Facebook
const PHOTOS_CONFIG = {
  fields: 'name,created_time,link,images'
};
// poll every 5 minutes
const PHOTOS_POLLING = 1000 * 60 * 5;

class SioFb {

  constructor() {
    this.graph = require('fbgraph');
    this.repository = new BotRepository();
    this.lastCheckedDate = null;
    this.rxAuthorize = Rx.Observable.fromNodeCallback(this.graph.authorize, this.graph);
    this.rxGet = Rx.Observable.fromNodeCallback(this.graph.get, this.graph);
  };

  getGraph() {
    if (!this.graph.getAccessToken()) {
      return this.rxAuthorize({
        'client_id': config.facebook.appId,
        'client_secret': config.facebook.appSecret,
        'grant_type': 'client_credentials'
      }).select(res => this.graph);
    }
    return Rx.Observable.just(this.graph);
  };

  getStripsWithConfig(config) {
    return this.getGraph()
      .selectMany(() => {
        return this.rxGet(PHOTOS_ENDPOINT, _.defaults(config, PHOTOS_CONFIG));
      })
      .selectMany(x => x.data);
  };

  getLatestStrips() {
    return this.getStripsWithConfig({limit: 3});
  };

  getLastStrip() {
    return this.getLatestStrips().first();
  };

  getNewStrips() {
    let lastPolledDate;
    console.log('Polling for new strips...');
    return this.repository.getLastPolledDate()
      .selectMany(date => {
        console.log('Polling last run on %s.', date);
        lastPolledDate = date;
        return this.getLatestStrips();
      })
      .filter(x => {
        return (lastPolledDate === null || new Date(x.created_time) > lastPolledDate);
      })
      .doOnCompleted(this.repository.setLastPolledDate, this.repository);
  }

  pollForNewStrips() {
    return Rx.Observable.timer(0, PHOTOS_POLLING)
      .selectMany(this.getNewStrips.bind(this));
  };

}

module.exports = SioFb;