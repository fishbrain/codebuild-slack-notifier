const child_process = require('child_process');

module.exports.gitCommitSHA = () =>
  new Promise((resolve, reject) => {
    child_process.exec('git rev-parse HEAD', function(err, stdout) {
      return err ? reject(err) : resolve(stdout.toString().trim());
    });
  });
