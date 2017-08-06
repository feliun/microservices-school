const R = require('ramda');
const { join } = require('path');
const nodeSSH = require('node-ssh');

const EC2_USER = 'ec2-user';
const MAX_ATTEMPTS = 3;
const MIN_STARTUP_TIME = 5000;
const ENV_VARS = ['MONGO_URL', 'RABBIT_PWD', 'SERVICE', 'F2F_KEY', 'SERVICE_PORT'];

const replaceServiceContainer = (publicDns, pemKeyPath, environment) => {

  const { SERVICE } = environment;

  const applyEnv = () => {
    const usefulVars = R.intersection(R.keys(environment), ENV_VARS);
    return R.reduce((acc, key) => `${acc} ${key}=${environment[key]}`, '', usefulVars);
  };

  const copyRunScripts = () =>
    ssh.putFiles([{ local: join(__dirname, 'deploy.sh'), remote: './deploy.sh' }])
      .then(() => ssh.execCommand('chmod +x deploy.sh', { cwd:'.' }));

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const checkStability = (attempts = 0) => {
    return wait(MIN_STARTUP_TIME)
      .then(() => ssh.execCommand(`curl http://localhost:${environment.SERVICE_PORT}/__/manifest`, { cwd:'.' }))
      .then((res) => {
        if (!res.stdout) throw new Error(`Service ${SERVICE} not available yet`);
        const response = JSON.parse(res.stdout);
        if (response.name !== SERVICE) throw new Error(`Expected ${SERVICE} but got ${response.name}`);
      })
      .catch((err) => {
        if (attempts >= MAX_ATTEMPTS) throw new Error(`Something went wrong deploying service ${SERVICE}`);
        console.log(`Error on attempt ${attempts}: ${err.message}`);
        return checkStability(attempts++);
      })
  };

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
    .then(({ stdout }) => console.log(stdout))
    .then(() => checkStability())
  );
};

module.exports = {
  replaceServiceContainer
}
