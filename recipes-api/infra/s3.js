const R = require('ramda');
const AWS = require('aws-sdk');
const fs = require('fs');

const region = 'eu-west-1';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region
});

const S3_BUCKET = 'microservices-school-recipes';
const s3 = new AWS.S3();

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
  downloadInstanceRegistry
};
