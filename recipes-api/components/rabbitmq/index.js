const System = require('systemic');
const rabbitmq = require('systemic-rabbitmq');
const initBroker = require('./initBroker');
const initSubscriptions = require('./initSubscriptions');

module.exports = new System({ name: 'rabbit' })
  .add('rabbitmq', rabbitmq()).dependsOn('config', 'logger')
  .add('broker', initBroker()).dependsOn('rabbitmq')
  .add('subscriptions', initSubscriptions()).dependsOn('broker', 'store', 'logger');
