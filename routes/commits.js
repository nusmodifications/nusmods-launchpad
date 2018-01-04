const childProcess = require('child_process');
const promisify = require('util').promisify;

const express = require('express');
const router = express.Router();

const config = require('../config');
const sendMessage = require('../utils/slackbot');

const execPromise = promisify(childProcess.exec);

const exp = {
  router,
  ongoingBuild: null,
};

router.post('/master/pull', async (req, res) => {
  const cmd = `cd ${config.repo} && git pull`;
  console.log(cmd);
  sendMessage('Pulling master...');
  await execPromise(cmd);
  sendMessage('Done pulling master.');
  res.sendStatus(204);
});

router.post('/master/yarn', async (req, res) => {
  const cmd = `cd ${config.app} && yarn install`;
  console.log(cmd);
  sendMessage('Running `yarn`...');
  try {
    await execPromise(cmd);
    sendMessage('Done installing dependencies.');
  } catch (error) {
    sendMessage('Failed to install dependencies.');
  } finally {
    res.sendStatus(204);
  }
});

router.post('/master/build', async (req, res) => {
  const cmd = `cd ${config.app} && yarn run build`;
  const currentCommit = childProcess
    .execSync(`cd ${config.app} && git rev-parse HEAD`)
    .toString()
    .trim()
    .substring(0, 7);
  exp.ongoingBuild = currentCommit;
  console.log(cmd);
  sendMessage('Building ' + currentCommit + '...');

  // Respond first. Client will auto reload the page
  res.sendStatus(204);

  try {
    // Has to be async anyway or else the whole server freezes.
    await execPromise(cmd);
    sendMessage('Built ' + currentCommit + '!');
  } catch (error) {
    sendMessage(currentCommit + ' failed to build.', error);
  } finally {
    exp.ongoingBuild = null;
  }
});

router.post('/master/promote_staging', async (req, res) => {
  const cmd = `cd ${config.app} && yes | yarn run promote-staging`;
  console.log(cmd);
  sendMessage('Promoting staged build...');
  try {
    await execPromise(cmd);
    sendMessage('Done promoting staged build.');
  } catch (error) {
    sendMessage('Failed to promote staging.');
  } finally {
    res.sendStatus(204);
  }
});

router.post('/:commitHash/checkout', async (req, res) => {
  const commitHash = req.params.commitHash;
  if (commitHash.length !== 7 || !/[0-9a-f]{7}/.test(commitHash)) {
    res.sendStatus(403);
    return;
  }
  const cmd = `cd ${config.app} && git reset --hard ${commitHash}`;
  console.log(cmd);
  sendMessage('Checking out commit ', commitHash);
  await execPromise(cmd);
  sendMessage('Done checking out commit ', commitHash);
  res.sendStatus(204);
});

module.exports = exp;
