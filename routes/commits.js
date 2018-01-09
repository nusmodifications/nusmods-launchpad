const promisify = require('util').promisify;
const execPromise = promisify(require('child_process').exec);

const express = require('express');
const router = express.Router();

const config = require('../config');
const sendMessage = require('../utils/slackbot');
const { latestCommitHash, buildCommitHash } = require('../utils/commitHash');

const exp = {
  router,
  ongoingBuild: null,
};

router.post('/master/pull', async (req, res) => {
  const cmd = `cd ${config.repo} && git pull`;
  console.log(cmd);
  sendMessage('Pulling master…');
  await execPromise(cmd);
  const currentCommit = latestCommitHash(config.app);
  sendMessage(`Done pulling master. Now at \`${currentCommit}\`.`);
  res.sendStatus(204);
});

router.post('/master/yarn', async (req, res) => {
  const cmd = `cd ${config.app} && yarn install`;
  console.log(cmd);
  const currentCommit = latestCommitHash(config.app);
  sendMessage(`Installing dependencies for \`${currentCommit}\`…`);
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
  const currentCommit = latestCommitHash(config.app);
  exp.ongoingBuild = currentCommit;
  console.log(cmd);
  sendMessage(`Building \`${currentCommit}\`…`);

  // Respond first. Client will auto reload the page
  res.sendStatus(204);

  try {
    // Has to be async anyway or else the whole server freezes.
    await execPromise(cmd);
    const stagingCommit = buildCommitHash(config.stagingDir);
    sendMessage(`Built \`${currentCommit}\`! Staging now at \`${stagingCommit}\`.`);
  } catch (error) {
    sendMessage(`\`${currentCommit}\` failed to build. ${error.message}`);
  } finally {
    exp.ongoingBuild = null;
  }
});

router.post('/master/promote_staging', async (req, res) => {
  const cmd = `cd ${config.app} && yes | yarn run promote-staging`;
  const stagingCommit = buildCommitHash(config.stagingDir);
  console.log(cmd);
  sendMessage(`Promoting staged build of \`${stagingCommit}\`…`);
  try {
    await execPromise(cmd);
    sendMessage(`Done promoting staged build of \`${stagingCommit}\`.`);
  } catch (error) {
    sendMessage(`Failed to promote staging. ${error.message}`);
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
  sendMessage(`Checking out commit ${commitHash}`);
  await execPromise(cmd);
  sendMessage(`Done checking out commit ${commitHash}`);
  res.sendStatus(204);
});

module.exports = exp;
