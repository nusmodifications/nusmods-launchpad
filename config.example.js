module.exports = {
  // Location of the NUSMods repo root and the website root on the local filesystem
  repo: `${process.env.HOME}/Developer/nusmods/`,
  app: `${process.env.HOME}/Developer/nusmods/www`,

  // Location of the NUSMods website files for staging and production on the local filesystem
  stagingDir: `${process.env.HOME}/Developer/nusmods/www/dist`,
  productionDir: `${process.env.HOME}/Developer/nusmods.com`,

  // Where Launchpad will be served from
  host: 'http://localhost:3000',

  // Generate a long, randomly generated string to encrypt login sessions
  sessionSecret: 'RANDOMLY GENERATED KEY',

  // The Slack API token and the channel on which the updates will be posted
  slackBroadcastChannels: ['nusmods'],
  slackAPIToken: 'SLACK_TOKEN',

  // GitHub app client ID and secret from https://github.com/organizations/nusmodifications/settings/applications
  // and a whitelist of users allowed to access the app
  githubClientId: 'CLIENT_ID',
  githubClientSecret: 'CLIENT_SECRET',
  githubUsernames: [
    'ZhangYiJiang',
    'taneliang',
    'li-kai',
    'jiholim',
  ],
};
