const R = require('ramda');
const { join } = require('path');
const fs = require('fs');

const { downloadPemFile } = require('./lib/s3');
const { runInstallation } = require('./lib/ssh');
const { checkInstances, createInstance, extractPublicDns, findPublicDns } = require('./lib/ec2');

const PEM_KEY_PATH = join(__dirname, 'micro-school-ec2.pem');

const DELAY = 5000;

const removeFile = (filePath) => new Promise((resolve, reject) => {
  fs.unlink(filePath, (err) => (err ? reject(err) : resolve()));
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const setup = (publicDnsName) =>
  downloadPemFile(PEM_KEY_PATH)
  .then(() => 
    wait(DELAY)
    .then(() => {
      console.log('About to run setup commands via ssh...');
      return runInstallation(publicDnsName, PEM_KEY_PATH)
      .then(() => removeFile(PEM_KEY_PATH));
    }));

checkInstances()
.then(({ Reservations }) => {
  if (Reservations.length > 0) {
    const publicDnsName = extractPublicDns(Reservations);
    console.log(`The EC2 ${publicDnsName} instance has already been configured and it is running!`);
    return setup(publicDnsName)
  }
  return createInstance()
    .then(() => 
      findPublicDns()
      .then(setup));
})
.then(() => {
  console.log('DONE!!');
  process.exit(0);
})
.catch((err) => {
  console.error(err);
  process.exit(1);
});
