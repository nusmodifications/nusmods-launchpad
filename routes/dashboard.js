const path = require('path');

const express = require('express');
const router = express.Router();
const nodegit = require('nodegit');
const moment = require('moment');

const config = require('../config');
const LATEST_COMMITS = 200;
const commits = require('./commits');
const buildCommitHash = require('../utils/commitHash').buildCommitHash;

/* GET commits log. */
router.get('/', async (req, res, next) => {
  const user = req.user;
  const repo = await nodegit.Repository.open(path.resolve(config.repo));
  const masterCommit = await repo.getMasterCommit();
  const history = masterCommit.history(nodegit.Revwalk.SORT.Time);
  const stagingCommit = buildCommitHash(config.stagingDir);
  const productionCommit = buildCommitHash(config.productionDir);

  history.on('end', function(commitMessages) {
    const commitObjs = commitMessages.slice(0, LATEST_COMMITS).map((commit) => {
      const author = commit.author();
      const messageLines = commit
        .message()
        .trim()
        .split('\n');
      const shortMessage = messageLines[0];
      const extendedMessage = messageLines.length > 1 ? messageLines.slice(1).join('\n') : '';
      return {
        sha: commit.sha().substring(0, 7),
        author: {
          name: author.name(),
          email: author.email(),
        },
        date: moment(commit.date()).format('MMM Do YYYY h:mma'),
        shortMessage,
        extendedMessage,
      };
    });

    res.render('dashboard', {
      title: 'NUSMods Launchpad',
      commits: commitObjs,
      isLoggedIn: req.user && req.user.id,
      user: req.user,
      stagingCommit,
      productionCommit,
      ongoingBuild: commits.ongoingBuild,
    });
  });

  // Don't forget to call `start()`!
  history.start();
});

module.exports = router;
