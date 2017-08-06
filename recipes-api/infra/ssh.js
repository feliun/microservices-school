const R = require('ramda');
const { join } = require('path');
const nodeSSH = require('node-ssh');

const EC2_USER = 'ec2-user';
const ENV_VARS = ['MONGO_URL', 'RABBIT_PWD', 'SERVICE', 'F2F_KEY'];

const replaceServiceContainer = (publicDns, pemKeyPath, environment) => {

  const applyEnv = () => {
    const usefulVars = R.intersection(R.keys(environment), ENV_VARS);
    return R.reduce((acc, key) => `${acc} ${key}=${environment[key]}`, '', usefulVars);
  };

  const copyRunScripts = () =>
    ssh.putFiles([{ local: join(__dirname, 'deploy.sh'), remote: './deploy.sh' }])
      .then(() => ssh.execCommand('chmod +x deploy.sh', { cwd:'.' }));

  const { SERVICE } = environment;

  const ssh = new nodeSSH();
  return ssh.connect({
    host: publicDns,
    username: EC2_USER,
    privateKey: pemKeyPath
  })
  .then(() =>
    ssh.execCommand(`docker stop ${SERVICE} && docker rm ${SERVICE}`, { cwd:'.' })
    .then(() => copyRunScripts())
    .then(() => ssh.execCommand(`${applyEnv()} ./deploy.sh`, { cwd:'.' }))
    .then(() => ssh.execCommand('docker ps', { cwd:'.' }))
    .then(({ stdout }) => console.log(stdout))
    // TODO curl up to retries - curl http://localhost:3000/__/manifest
  );
};

module.exports = {
  replaceServiceContainer
}
