// your role should contain
// - AmazonEC2ContainerServiceFullAccess
// - AmazonEC2FullAccess

const R = require('ramda');
const { ec2 } = require('./aws');
const ec2Config = require('./config/ec2.json');

const INSTANCE_NAME = 'recipes-ec2-instance';
const DELAY = 5000;

const printInstructions = (publicDnsName) => {
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
};

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

const extractPublicDns = (Reservations) => Reservations[0].Instances[0].PublicDnsName;

const delay = (fn, ...args) => new Promise((resolve) => {
  setTimeout(() => {
    fn(args)
    .then(() => resolve())
  }, DELAY);
});

const findPublicDns = () => 
  checkInstances()
  .then(({ Reservations }) => (Reservations.length === 0 ? delay(findPublicDns) : Promise.resolve(extractPublicDns(Reservations))));

checkInstances()
.then(({ Reservations }) => {
  if (Reservations.length > 0) {
    const publicDnsName = extractPublicDns(Reservations);
    console.log('An EC2 instance has already been configured and it\'s running! Ensuring the following commands have been run:');
    return printInstructions(publicDnsName);
  }
  return createInstance()
  .then(() => 
    findPublicDns()
    .then(printInstructions)
  );
});