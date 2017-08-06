const nodeSSH = require('node-ssh');

const EC2_USER = 'ec2-user';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DELAY = 5000;

const runInstallation = (publicDns, pemKeyPath) => {
  const ssh = new nodeSSH();
  return ssh.connect({
    host: publicDns,
    username: EC2_USER,
    privateKey: pemKeyPath
  })
  .then(() =>
    ssh.execCommand('sudo yum update -y', { cwd:'.' })
    .then(() => ssh.execCommand('sudo yum install -y docker', { cwd:'.' }))
    .then(() => ssh.execCommand('sudo service docker start', { cwd:'.' }))
    .then(() => ssh.execCommand('sudo usermod -a -G docker ec2-user', { cwd:'.' }))
    .then(() => ssh.execCommand('docker ps', { cwd:'.' }))
  )
  .catch((e) => {
    if (e.code !== 'ECONNREFUSED') throw e;
    console.log('Instance not ready yet, retrying...');
    return wait(DELAY).then(() => runInstallation(publicDns, pemKeyPath));
  });
};

module.exports = {
  runInstallation
}
