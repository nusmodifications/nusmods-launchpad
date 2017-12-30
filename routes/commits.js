const childProcess = require('child_process');

const express = require('express');
const router = express.Router();

const config = require('../config');

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
  console.log(cmd);
  childProcess.execSync(cmd);
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
  const cmd = `cd ${config.app} && git reset --hard ${commitHash}`;
  console.log(cmd);
  childProcess.execSync(cmd);
  res.sendStatus(204);
});

module.exports = router;
