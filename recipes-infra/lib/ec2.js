// your role should contain
// - AmazonEC2FullAccess
// - AmazonS3FullAccess

const R = require('ramda');
const { ec2 } = require('../lib/aws');
const ec2Config = require('../config/ec2.json');

const INSTANCE_NAME = 'recipes-ec2-instance';

const DELAY = 5000;

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

const retry = (fn, ...args) => new Promise((resolve) => {
  setTimeout(() => fn(args).then(resolve), DELAY);
});

const findPublicDns = () => 
  checkInstances()
  .then(({ Reservations }) => {
    const publicDns = extractPublicDns(Reservations);
    return publicDns ? publicDns : retry(findPublicDns);
  });

module.exports = {
  checkInstances,
  createInstance,
  extractPublicDns,
  findPublicDns
};