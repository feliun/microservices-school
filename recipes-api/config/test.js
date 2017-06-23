module.exports = {
  logger: {
    transport: null
  },
  rabbitmq: {
    defaults: {
      vhosts: {
        namespace: true,
        queues: {
          options: {
            durable: false
          }
        },
        exchanges: {
          options: {
            durable: false
          }
        }
      }
    }
  }
};
