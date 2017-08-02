const R = require('ramda');
const AWS = require('aws-sdk');
const pify = require('pify');

const region = 'eu-west-1';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region
});

const pifyProtoFns = (obj, ...fns) => R.mergeAll(fns.map(fn => {
  const result = {};
  result[fn] = pify(obj[fn].bind(obj));
  return result
}));

const ec2 = pifyProtoFns(new AWS.EC2(), 'describeInstances', 'runInstances');
const ecs = pifyProtoFns(new AWS.ECS(), 
            'createCluster', 
            'describeClusters', 
            'registerTaskDefinition', 
            'listTaskDefinitions',
            'listServices',
            'createService');

module.exports = { ec2, ecs };