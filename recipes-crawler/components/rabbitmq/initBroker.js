const pify = require('pify');

module.exports = () => {

  const start = ({ rabbitmq }, cb) => {

    const publish = (...args) => new Promise((resolve, reject) => {
        rabbitmq.broker.publish(...args, (err, publication) => {
            if (err) return reject(err);
            publication
            .on('success', () => resolve())
            .on('error', reject);
        });
    });

    const subscribe = (...args) => new Promise((resolve, reject) => {
        rabbitmq.broker.subscribe(...args, (err, subscription) => {
            if (err) return reject(err);
            const cancel = new Promise(subscription.cancel);
            subscription
            .on('message', (message, content, ackOrNack) => resolve({ message, content, ackOrNack, cancel }))
            .on('error', reject);
        });
    });

    const broker = {
      publish,
      subscribe,
      nuke: pify(rabbitmq.broker.nuke),
      purge: pify(rabbitmq.broker.purge),
    };
    return cb(null, broker);
  };

  return { start };
};
