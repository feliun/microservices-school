module.exports = {
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  mongo: {
    url: 'mongodb://127.0.0.1/recipes'
  },
  store: 'mongo',
  logger: {
    transport: 'bunyan',
    include: [
      'tracer',
      'timestamp',
      'level',
      'message',
      'error.message',
      'error.code',
      'error.stack',
      'request.url',
      'request.headers',
      'request.params',
      'request.method',
      'response.statusCode',
      'response.headers',
      'response.time',
      'process',
      'system',
      'package.name',
      'service'
    ],
    exclude: [
      'password',
      'secret',
      'token',
      'request.headers.cookie',
      'dependencies',
      'devDependencies'
    ]
  },
  rabbitmq: {
    defaults: {},
    vhosts: {
      '/': {
        connection: {
          hostname: '127.0.0.1',
          user: 'rabbitmq',
          password: 'rabbitmq'
        },
        exchanges: [
          'internal',
          'delay',
          'retry',
          'dead_letters'
        ],
        queues: {},
        bindings: {},
        subscriptions: {},
        publications: {
          conclusions: {
            exchange: 'internal'
          }
        }
      }
    }
  }
};
