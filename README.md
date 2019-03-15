# NUSMods Launchpad

Deployment dashboard for NUSMods - https://launch.nusmods.com

![Demo](screenshots/demo.png)

## Installation

```sh
$ yarn
$ cp config.example.js config.js
# Create GitHub Oauth app and replace config with app ID and secret.
# You can also ask for our development ID and secret if you don't want to create one yourself
# If desired, create Slack app and replace config with API token and target channel IDs.
$ npm start
$ open http://localhost:3000
```

## Deployment

```sh
$ pm2 start ecosystem.config.js
```

## License

MIT
