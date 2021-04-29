const simpleGit = require('simple-git');
const path = require('path');
let git = simpleGit(path.resolve(__dirname));
const fs = require('fs');
const debug = require('debug');
require('dotenv').config();

const testObj = {
  obj: {
    sampleObj: { 
      moreStuff: 'Stringg',
      num2: 4782378,
      num: 412, 
      words: 'ofhdjsklfd jfkl dsajfklds',
      address: '378 bleh',
      didItWork: 'Maybe'
    }
  }
};

const createRepo = async () => {
  debug.enable('simple-git,git:*');
  await git.clone(process.env.TARGET_REPO, ['-n'])

  git = simpleGit(path.resolve(__dirname, './upload-repo'));

  await git.reset('hard');

  await writeToRepo();
  await addAndCommit(git);

}

const removeRepo = () => {
  fs.rmdirSync('upload-repo', {recursive: true}, (err) => {
    if (err) {
      console.log(err);
    }
  })
}

const writeToRepo = async () => {
  console.log('write')
  fs.writeFileSync(path.resolve(__dirname, './upload-repo/test.json'), JSON.stringify(testObj), (err) => {
    if (err) console.log('Failed**********', err);
  })
}

const addAndCommit = async (newGit) => {
  await newGit
    .add('./test.json')
    .commit('Testing env')
    .push('origin', 'master', ['--force'])
}

const createAndRemove = async () => {
  await createRepo();
  await removeRepo();

}

createAndRemove();