const { join } = require('path');
const { downloadPemFile, downloadInstanceRegistry } = require('./s3');

const PEM_KEY_PATH = join(__dirname, 'micro-school-ec2.pem');
const INSTANCE_REGISTRY_PATH = join(__dirname, 'instances-registry.json');

Promise.all([
  downloadPemFile(PEM_KEY_PATH),
  downloadInstanceRegistry(INSTANCE_REGISTRY_PATH)
])
  .then((result) => {
    const { publicDns } = require(INSTANCE_REGISTRY_PATH);
    console.log("instancesRegistry", publicDns);
  })
  .catch(console.error);
