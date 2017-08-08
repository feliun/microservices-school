const { join } = require('path');
const { downloadPemFile, downloadInstanceRegistry } = require('./lib/s3');
const { replaceServiceContainer } = require('./lib/ssh');
const { removeFile } = require('./lib/utils');

if (!process.env.SERVICE) throw new Error("No SERVICE environment variable has been specified");

const PEM_KEY_PATH = join(__dirname, 'micro-school-ec2.pem');
const INSTANCE_REGISTRY_PATH = join(__dirname, 'instances-registry.json');

const cleanUp = () => {
  console.log('Cleaning up...');
  return Promise.all([ removeFile(PEM_KEY_PATH), removeFile(INSTANCE_REGISTRY_PATH) ]);
};

Promise.all([
  downloadPemFile(PEM_KEY_PATH),
  downloadInstanceRegistry(INSTANCE_REGISTRY_PATH)
])
  .then((result) => {
    const { publicDns } = require(INSTANCE_REGISTRY_PATH);
    console.log(`All needed files dowloaded. Replacing service docker container in ${publicDns}...`);
    return replaceServiceContainer(publicDns, PEM_KEY_PATH, process.env)
      .then(() => cleanUp())
      .then(() => {
        console.log(`The service ${process.env.SERVICE} has been deployed`);
        process.exit(0)
      })
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
