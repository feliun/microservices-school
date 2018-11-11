const R = require('ramda');
const { join } = require('path');
const nodeSSH = require('node-ssh');
const { wait } = require('./utils');

const EC2_USER = 'ec2-user';
const MAX_ATTEMPTS = 3;
const MIN_STARTUP_TIME = 5000;
const ENV_VARS = ['MONGO_URL', 'RABBIT_PWD', 'SERVICE', 'F2F_KEY', 'SERVICE_PORT', 'SUMO_URL'];

const runInstallation = (publicDns, pemKeyPath) => {
	const ssh = new nodeSSH();
	return ssh
		.connect({
			host: publicDns,
			username: EC2_USER,
			privateKey: pemKeyPath,
		})
		.then(() =>
			ssh
				.execCommand('sudo yum update -y', { cwd: '.' })
				.then(() => ssh.execCommand('sudo yum install -y docker', { cwd: '.' }))
				.then(() => ssh.execCommand('sudo service docker start', { cwd: '.' }))
				.then(() => ssh.execCommand('sudo usermod -a -G docker ec2-user', { cwd: '.' }))
				.then(() => ssh.execCommand('sudo docker network create local', { cwd: '.' }))
				.then(({ stdout }) => console.log(stdout))
				.then(() => ssh.execCommand('sudo docker network inspect local', { cwd: '.' }))
				.then(({ stdout }) => console.log(stdout))
				.then(() => ssh.execCommand('sudo docker ps', { cwd: '.' }))
				.then(({ stdout }) => console.log(stdout)),
		)
		.catch(e => {
			if (e.code !== 'ECONNREFUSED') throw e;
			console.log('Instance not ready yet, retrying...');
			return wait(MIN_STARTUP_TIME).then(() => runInstallation(publicDns, pemKeyPath));
		});
};

const replaceServiceContainer = (publicDns, pemKeyPath, environment) => {
	const { SERVICE } = environment;

	const applyEnv = () => {
		const usefulVars = R.intersection(R.keys(environment), ENV_VARS);
		return R.reduce((acc, key) => `${acc} ${key}=${environment[key]}`, '', usefulVars);
	};

	const copyRunScripts = () =>
		ssh
			.putFiles([{ local: join(__dirname, '..', 'deploy.sh'), remote: './deploy.sh' }])
			.then(() => ssh.execCommand('chmod +x deploy.sh', { cwd: '.' }));

	const checkStability = (attempts = 0) => {
		return wait(MIN_STARTUP_TIME)
			.then(() => {
				const checkUrl = `curl http://localhost:${environment.SERVICE_PORT}/__/manifest`;
				console.log(`Checking url: ${checkUrl}...`);
				return ssh.execCommand(checkUrl, { cwd: '.' });
			})
			.then(res => {
				if (!res.stdout) throw new Error(`Service ${SERVICE} not available yet`);
				const response = JSON.parse(res.stdout);
				if (response.name !== SERVICE) throw new Error(`Expected ${SERVICE} but got ${response.name}`);
			})
			.catch(err => {
				if (attempts >= MAX_ATTEMPTS) throw new Error(`Something went wrong deploying service ${SERVICE}`);
				console.log(`Error on attempt ${attempts}: ${err.message}`);
				return checkStability(attempts++);
			});
	};

	const ssh = new nodeSSH();
	console.log(`Connecting to ${publicDns} with ${EC2_USER} and pem file in ${pemKeyPath}...`);
	return ssh
		.connect({
			host: publicDns,
			username: EC2_USER,
			privateKey: pemKeyPath,
			readyTimeout: 99999,
		})
		.then(() =>
			ssh
				.execCommand(`docker stop ${SERVICE} && docker rm ${SERVICE}`, { cwd: '.' })
				.then(() => {
					console.log('Coyping run scripts...');
					return copyRunScripts();
				})
				.then(() => {
					console.log('Deploying service...');
					return ssh.execCommand(`${applyEnv()} ./deploy.sh`, { cwd: '.' });
				})
				.then(({ stdout }) => console.log(stdout))
				.then(() => checkStability()),
		);
};

module.exports = {
	runInstallation,
	replaceServiceContainer,
};
