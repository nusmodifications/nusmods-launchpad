const path = require('path');
const fs = require('fs');

const express = require('express');
const router = express.Router();
const nodegit = require('nodegit');

const config = require('../config');
const LATEST_COMMITS = 200;
const COMMIT_HASH_FILE = 'commit-hash.txt';

/* GET commits log. */
router.get('/', async (req, res, next) => {
  const user = req.user;
  const repo = await nodegit.Repository.open(path.resolve(config.repo));
  const masterCommit = await repo.getMasterCommit();
  const history = masterCommit.history(nodegit.Revwalk.SORT.Time);
  const stagingCommit = fs.readFileSync(path.resolve(config.stagingDir, COMMIT_HASH_FILE))
                          .toString()
                          .trim();
  const productionCommit = fs.readFileSync(path.resolve(config.productionDir, COMMIT_HASH_FILE))
                            .toString()
                            .trim();
  history.on('end', function(commits) {
    const commitObjs = commits.slice(0, LATEST_COMMITS).map(commit => {
      const author = commit.author();
      const messageLines = commit.message().trim().split('\n');
      const shortMessage = messageLines[0];
      const extendedMessage = messageLines.length > 1 ? messageLines.slice(1).join('\n') : '';
      return {
        sha: commit.sha().slice(0, 7),
        author: {
          name: author.name(),
          email: author.email(),
        },
        date: commit.date(),
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
    });
  });

  // Don't forget to call `start()`!
  history.start();
});

module.exports = router;
