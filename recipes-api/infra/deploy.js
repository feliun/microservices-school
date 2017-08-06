const fs = require('fs');
const { join } = require('path');
const { downloadPemFile, downloadInstanceRegistry } = require('./s3');
const { replaceServiceContainer } = require('./ssh');

if (!process.env.SERVICE) throw new Error("No SERVICE environment variable has been specified");

const PEM_KEY_PATH = join(__dirname, 'micro-school-ec2.pem');
const INSTANCE_REGISTRY_PATH = join(__dirname, 'instances-registry.json');

const removeFile = (filePath) => new Promise((resolve, reject) => {
  fs.unlink(filePath, (err) => (err ? reject(err) : resolve()));
});

const cleanUp = () => Promise.all([ removeFile(PEM_KEY_PATH), removeFile(INSTANCE_REGISTRY_PATH) ]);

Promise.all([
  downloadPemFile(PEM_KEY_PATH),
  downloadInstanceRegistry(INSTANCE_REGISTRY_PATH)
])
  .then((result) => {
    const { publicDns } = require(INSTANCE_REGISTRY_PATH);
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
