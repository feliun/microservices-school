const R = require('ramda');
const fs = require('fs');
const { s3 } = require('./aws');

const S3_BUCKET = 'microservices-school-recipes';

const registerInstance = (publicDns) => {
  const registry = {
    creationDate: new Date(),
    publicDns
  };
  const params = {
    Body: JSON.stringify(registry), 
    Bucket: S3_BUCKET, 
    Key: 'instances-registry'
  };
  return new Promise((resolve, reject) => {
    s3.putObject(params, (err) => (err ? reject(err) : resolve()));
  });
};

const download = R.curry((s3Key, outputFile) => new Promise((resolve, reject) => {
  const s3Stream = s3.getObject({ Bucket: S3_BUCKET, Key: s3Key }).createReadStream();
  const fileStream = fs.createWriteStream(outputFile);
  s3Stream.on('error', reject);
  fileStream.on('error', reject);
  fileStream.on('close', () => resolve(outputFile));
  s3Stream.pipe(fileStream);
}));

const downloadPemFile = download('keys/micro-school-ec2.pem');
const downloadInstanceRegistry = download('instances-registry');

module.exports = {
  downloadPemFile,
  downloadInstanceRegistry,
  registerInstance
};