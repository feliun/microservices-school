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

    const broker = {
      publish,
      subscribe: rabbitmq.broker.subscribe,
      nuke: pify(rabbitmq.broker.nuke),
      purge: pify(rabbitmq.broker.purge),
    };
    return cb(null, broker);
  };

  return { start };
};
