const { join } = require('path');

const { downloadPemFile, registerInstance } = require('./lib/s3');
const { runInstallation } = require('./lib/ssh');
const { checkInstances, createInstance, extractPublicDns, findPublicDns } = require('./lib/ec2');
const { removeFile, wait } = require('./lib/utils');

const PEM_KEY_PATH = join(__dirname, 'micro-school-ec2.pem');

const DELAY = 5000;

const setup = (publicDnsName) =>
  downloadPemFile(PEM_KEY_PATH)
  .then(() =>
    wait(DELAY)
    .then(() => {
      console.log('About to run setup commands via ssh...');
      return runInstallation(publicDnsName, PEM_KEY_PATH)
      .then(() => removeFile(PEM_KEY_PATH))
      .then(() => registerInstance(publicDnsName));
    }));

checkInstances()
.then(({ Reservations }) => {
  if (Reservations.length > 0) return extractPublicDns(Reservations);
  return createInstance()
    .then(() =>
      findPublicDns()
      .then((publicDns) =>
        setup(publicDns)
        .then(() => publicDns)
      )
    )
})
.then((publicDns) => {
  console.log(`The EC2 ${publicDns} instance has been configured and it is running!`);
  process.exit(0);
})
.catch((err) => {
  console.error(err);
  process.exit(1);
});
