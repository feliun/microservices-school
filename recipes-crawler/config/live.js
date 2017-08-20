module.exports = {
  logger: {
    transport: 'sumo'
  },
  rabbitmq: {
    defaults: {},
    vhosts: {
      ysojkvfe: {
        connection: {
          hostname: 'swan.rmq.cloudamqp.com',
          user: 'ysojkvfe',
          password: process.env.RABBIT_PWD || 'N/A'
        }
      }
    }
  }
}
