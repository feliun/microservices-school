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

    const broker = { publish };
    return cb(null, broker);
  };

  return { start };
};
