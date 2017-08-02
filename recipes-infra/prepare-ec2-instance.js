// your role should contain
// - AmazonEC2FullAccess
// - AmazonS3FullAccess

const R = require('ramda');
const fs = require('fs');
const { ec2, s3 } = require('./aws');
const ec2Config = require('./config/ec2.json');

const INSTANCE_NAME = 'recipes-ec2-instance';
const S3_BUCKET = 'microservices-school-recipes';
const OUTPUT_KEY = './micro-school-ec2.pem';
const DELAY = 5000;

const setup = (publicDnsName) => {
  // TODO script ssh and add .pem file to s3
  const instructions = [
    `ssh -i ~/.ssh/${ec2Config.KeyName}.pem -o "StrictHostKeyChecking no" ec2-user@${publicDnsName}`,
    'sudo yum update -y',
    'sudo yum install -y docker',
    'sudo service docker start',
    'sudo usermod -a -G docker ec2-user', //no sudo needed
    'docker info',
    'docker ps',
    'exit'
  ];
  console.log(instructions.join('\n'));
  return downloadPemFile();
};

const downloadPemFile = () => new Promise((resolve, reject) => {
  const s3Stream = s3.getObject({ Bucket: S3_BUCKET, Key: 'keys/micro-school-ec2.pem' }).createReadStream();
  const fileStream = fs.createWriteStream(OUTPUT_KEY);
  s3Stream.on('error', reject);
  fileStream.on('error', reject);
  fileStream.on('close', () => resolve(OUTPUT_KEY));
  s3Stream.pipe(fileStream);
});

const checkInstances = () => {
  console.log('Checking running instances...');
  const params = { Filters: [ { Name: 'instance-state-name', Values: [ 'running'] } ] };
  return ec2.describeInstances(params);
};

const createInstance = () => {
  console.log('Creating new EC2 instance...');
  const tags = {
    TagSpecifications: [{
      ResourceType: 'instance',
      Tags: [{
          Key: 'Name',
          Value: INSTANCE_NAME,
      }]
    }]
  };
  const instanceConfig = R.merge(ec2Config, tags);
  return ec2.runInstances(instanceConfig);
};

const extractPublicDns = (Reservations) => Reservations 
  && Reservations[0] 
  && Reservations[0].Instances
  && Reservations[0].Instances[0]
  && Reservations[0].Instances[0].PublicDnsName;

const delay = (fn, ...args) => new Promise((resolve) => {
  setTimeout(() => fn(args).then(resolve), DELAY);
});

const findPublicDns = () => 
  checkInstances()
  .then(({ Reservations }) => {
    const publicDns = extractPublicDns(Reservations);
    return publicDns ? publicDns : delay(findPublicDns);
  });

checkInstances()
.then(({ Reservations }) => {
  if (Reservations.length > 0) {
    const publicDnsName = extractPublicDns(Reservations);
    console.log('An EC2 instance has already been configured and it\'s running! Ensuring the following commands have been run:');
    return setup(publicDnsName);
  }
  return createInstance()
    .then(() => findPublicDns()
      .then(setup));
})
.catch(console.error);
