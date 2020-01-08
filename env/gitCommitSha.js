import childProcess from 'child_process';

export const gitCommitSHA = async () =>
  new Promise((resolve, reject) => {
    childProcess.exec('git rev-parse HEAD', (err, stdout) => {
      return err ? reject(err) : resolve(stdout.toString().trim());
    });
  });
