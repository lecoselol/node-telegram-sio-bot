telegram-sio-daily-bot
======================

_Telegram (Dum)bot for daily Sio comic strips_

----------------------

`npm install -g telegram-sio-daily-bot`

## Configuration

### Environment variables

The bot can be configured with the following environment variables:

* `TELEGRAM_SIO_DAILY_BOT_FACEBOOK_APP_ID` with a Facebook app ID
* `TELEGRAM_SIO_DAILY_BOT_FACEBOOK_APP_SECRET` with a Facebook app secret
* `TELEGRAM_SIO_DAILY_BOT_TELEGRAM_TOKEN` with the Telegram bot token

### JSON config file

Configuration can be provided in development mode with a `config.json` file (see 
[config.json.sample](config.json.sample)) with the following structure:

```json
{
  "facebook": {
    "appId": "facebook-app-id",
    "appSecret": "facebook-app-secret"
  },
  "telegram": {
    "token": "telegram-bot-token"
  }
}
```

## Run

To run the application, execute either one of `npm start` or `telegram-sio-daily-bot` (if installed
globally).

## License

```
Copyright 2016 Francesco Pontillo

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
