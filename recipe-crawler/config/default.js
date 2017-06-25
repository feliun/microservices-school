module.exports = {
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  routes: {
    proxy: {
      routes: {
        '/api/1.0/other': 'http://other.example.com'
      }
    }
  },
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
  crawler: { // once an hour
    frequency: 3600000
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
          'internal'
        ],
        publications: {
          conclusions: {
            exchange: 'internal'
          }
        }
      }
    }
  }
};
