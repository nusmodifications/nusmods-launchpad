# NUSMods Launchpad

Deployment dashboard for NUSMods - http://launch.nusmods.com

![Demo](screenshots/demo.png)

## Installation

```sh
$ yarn
$ cp config.example.js config.js
# Create FB app and replace config with app ID and secret.
# If desired, create Slack app and replace config with API token and target channel IDs.
$ npm start
$ open http://localhost:3000
```

## Deployment

```sh
$ npm run forever
```

## License

MIT
