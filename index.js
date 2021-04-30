const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const debug = require('debug');
let git = simpleGit(__dirname);

let targetRepo = 'git-test';

require('dotenv').config();

const createAndWrite = async () => {
  debug.enable('simple-git,git:*');

  // TARGET_REPO example: https://github.com/{user}/{repository}.git, in this example I'm using my upload-repo repository
  // The -n argument is required for noCheckout; *this prevents the entire target repo from moving in with its garbage.
  // *no files/folders will be written to the disk when cloning.

  // The folder that does get created from cloning will be incinerated at the end assuming you didn't break everything.

  // As a side note, you can clone the same repo in here.
  // If cloning the same repo, do be sure to do a pull afterwards. Otherwise, you're gonna have a bad time when running this again.
  // TODO: add authentication
  
  // To switch target repository names, update TARGET_REPO in .env and targetRepo above

  await git.clone(process.env.TARGET_REPO, ['-n']);
  await git.stash()

  const newPath = path.join(__dirname, targetRepo);
  const newRepoPath = path.join(newPath, 'test.json');
  
  // Switch over to the target repo, if you don't then commits will be done under git-test
  git = simpleGit(newPath);

  // Reset is required, this forces the HEAD and the working files to be unstaged. Otherwise other files/folders will be deleted in commit
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

  await git
    .add('./test.json')
    .commit('Testing self clone') // Could add some sort of counter to the commit? ex: Publish #55
    .push('origin', 'master', ['--force']); 

    // ************** Cloned the same repo? Uncomment the line above **************
};

const removeRepo = () => {
  fs.rmdirSync(targetRepo, { recursive: true }, (err) => {
    if (err) {
      console.log(err);
    }
  });
};

// Feel free to kill the IIFE
(async () => {
  await createAndWrite();
  await removeRepo();

  git = simpleGit(__dirname);
  await git
    // .add('./*')
    // .commit('Updating self')
    // .push('origin', 'master', ['--force'])
    .pull();
})();
