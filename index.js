const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const debug = require('debug');
let git = simpleGit(__dirname);

require('dotenv').config();

const createAndWrite = async () => {
  debug.enable('simple-git,git:*');

  // TARGET_REPO example: https://github.com/{user}/{repository}.git, in this example I'm using my upload-repo repository
  // The -n argument is required for noCheckout, so no files/folders will be written to the current directory
  // this prevents the entire target repo (upload-repo) from moving in with its garbage.

  // However, you will see a folder be created during the process, if everything goes well
  // the folder will be removed at the end. If not, then you have a new roommate until I get around to fixing that.

  // As a side note, you can clone the same repo in here to the same effect.
  await git.clone(process.env.TARGET_REPO, ['-n']);

  const newPath = path.join(__dirname, 'git-test');
  const newRepoPath = path.join(newPath, 'test.json');

  git = simpleGit(newPath);

  // Reset is required, otherwise other files/folders will be deleted in commit
  // Originally tried chaining it, that didn't work out too well. For proof check out the billion of reverts in this repo. Oof.
  await git.reset('hard');

  fs.copyFile(path.join(__dirname, 'test.json'), newRepoPath, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Successfully copied and moved the file');
    }
  });

  // Write option
  // const testObj = {
  //   obj: {
  //     sampleObj: {
  //       moreStuff: 'Stringg',
  //       num2: 4782378,
  //       num: 412,
  //       words: 'ofhdjsklfd jfkl dsajfklds',
  //       address: '378 bleh',
  //       didItWork: 'Yuus',
  //     },
  //   },
  // };

  // fs.writeFileSync(
  //   path.join(newPath, '/test.json'),
  //   JSON.stringify(testObj),
  //   (err) => {
  //     if (err) console.log('Failed**********', err);
  //   },
  // );

  // Could add some sort of counter to the commit?
  // ex: Publish #55
  await git
    .add('./test.json')
    .commit('Testing env')
    .push('origin', 'master', ['--force']);
};

const removeRepo = () => {
  fs.rmdirSync('git-test', { recursive: true }, (err) => {
    if (err) {
      console.log(err);
    }
  });
};

// Feel free to kill the IIFE
(async () => {
  await createAndWrite();
  await removeRepo();
})();
