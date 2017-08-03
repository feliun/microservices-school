const fs = require('fs');
const { s3 } = require('./aws');

const S3_BUCKET = 'microservices-school-recipes';

const downloadPemFile = (pemKeyPath) => new Promise((resolve, reject) => {
  const s3Stream = s3.getObject({ Bucket: S3_BUCKET, Key: 'keys/micro-school-ec2.pem' }).createReadStream();
  const fileStream = fs.createWriteStream(pemKeyPath);
  s3Stream.on('error', reject);
  fileStream.on('error', reject);
  fileStream.on('close', () => resolve(pemKeyPath));
  s3Stream.pipe(fileStream);
});

module.exports = {
  downloadPemFile
};