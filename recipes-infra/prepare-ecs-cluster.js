// your role should contain
// - AmazonEC2ContainerServiceFullAccess
// - AmazonEC2FullAccess

const R = require('ramda');
const { ecs } = require('./aws');
const { readdirSync } = require('fs')

const sequential = R.reduce((acc, promise) => acc.then(() => promise), Promise.resolve());

const registerTask = (task) => {
  const TASKS_DIR = './config/tasks';
  const load = (task) => require(`${TASKS_DIR}/${task}`);
  return ecs.registerTaskDefinition(load(task));
};

const createService = (name, task) => {
  const params = {
    desiredCount: 1, 
    serviceName: name,
    taskDefinition: task
  };
  return ecs.createService(params);
};

const prepareService = (name) =>
  registerTask(name)
  .then(({ taskDefinition }) => {
    const taskName = `${taskDefinition.family}:${taskDefinition.revision}`;
    return createService(name, taskName)
    .then((data) => console.log(data));
  });


const services = [ 'recipes-api', 'recipes-crawler' ];

const prepareStatements = R.map(prepareService, services);

// sequential(prepareStatements)
// .then(() => ecs.listTaskDefinitions({}))
// .then((tasks) => console.log(`Defined tasks: ${tasks}`))
// .then(() => ecs.listServices({}))
// .then((services) => console.log(`Defined services: ${services}`))
// .then(() => console.log('DONE'))
// .catch(console.error);

// TODO try to create EC2 instance AFTER the cluster gets created
// TODO add EC2 instance to cluster because services can't run otherwise
// http://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_container_instance.html
// TODO cleanup - remove cluster, tasks and services before starting this up (AND ec2)


ecs.createCluster({})
.then(({ cluster }) => {
  const { 
    clusterName, 
    status, 
    registeredContainerInstancesCount, 
    runningTasksCount, 
    pendingTasksCount, 
    activeServicesCount 
  } = cluster;
  console.log(`The status of cluster ${clusterName} is ${status}`);
  // if this doesn´t do anything, try RegisterContainerInstance
})