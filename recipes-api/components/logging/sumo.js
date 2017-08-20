const Sumologic = require('logs-to-sumologic');

let logger;

module.exports = () => {

  const onMessage = (event) => {
    logger.log(event, (err) => {
      if (err) console.log(`Error posting to sumo! ${err.message}`);
    });
  };

  const start = (cb) => {
    const url = process.env.SUMO_URL;
    if (!url) return cb(new Error('A SUMO_URL env variable needs to be injected!'));
    logger = Sumologic.createClient({ url, name: "RecipesCollector" });
    return cb(null, onMessage);
  };

  return { start };
};
