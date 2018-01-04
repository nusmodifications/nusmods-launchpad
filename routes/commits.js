const childProcess = require('child_process');

const express = require('express');
const router = express.Router();

const config = require('../config');

const exp = {
  router,
  ongoingBuild: null,
};

router.post('/master/pull', (req, res) => {
  const cmd = `cd ${config.repo} && git pull`;
  console.log(cmd);
  childProcess.execSync(cmd);
  res.sendStatus(204);
});

router.post('/master/yarn', (req, res) => {
  const cmd = `cd ${config.app} && yarn install`;
  console.log(cmd);
  childProcess.execSync(cmd);
  res.sendStatus(204);
});

router.post('/master/build', (req, res) => {
  const cmd = `cd ${config.app} && yarn run build`;
  const currentCommit = childProcess
    .execSync(`cd ${config.app} && git rev-parse HEAD`)
    .toString()
    .trim()
    .substring(0, 7);
  exp.ongoingBuild = currentCommit;
  console.log(cmd);
  // Has to be async or else the whole server freezes.
  childProcess.exec(cmd, null, () => {
    exp.ongoingBuild = null;
  });
  res.sendStatus(204);
});

router.post('/master/promote_staging', (req, res) => {
  const cmd = `cd ${config.app} && yarn run promote-staging`;
  console.log(cmd);
  childProcess.execSync(cmd, { input: 'y\n' });
  res.sendStatus(204);
});

router.post('/:commitHash/checkout', (req, res) => {
  const commitHash = req.params.commitHash;
  if (commitHash.length !== 7 || !/[0-9a-f]{7}/.test(commitHash)) {
    res.sendStatus(403);
    return;
  }
  const cmd = `cd ${config.app} && git reset --hard ${commitHash}`;
  console.log(cmd);
  childProcess.execSync(cmd);
  res.sendStatus(204);
});

module.exports = exp;
