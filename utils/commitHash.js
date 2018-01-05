const path = require('path');
const fs = require('fs');
const childProcess = require('child_process');

const COMMIT_HASH_FILE = 'commit-hash.txt';

function buildCommitHash(buildDir) {
  try {
    return fs
      .readFileSync(path.resolve(buildDir, COMMIT_HASH_FILE))
      .toString()
      .trim();
  } catch (err) {}
  return null;
}

function latestCommitHash(repoDir) {
  return childProcess
    .execSync(`cd ${repoDir} && git rev-parse HEAD`)
    .toString()
    .trim()
    .substring(0, 7);
}

module.exports = { buildCommitHash, latestCommitHash };
