module.exports = {
  server: {
    host: '0.0.0.0',
    port: 3002
  },
  generator: {
    strategy: 'block',
    options: {
      size: 1,
      url: 'mongodb://127.0.0.1/recipes',
      block: {
        prime: false,
        size: 1,
        retry: {
          limit: 100,
          interval: 100
        },
        sequence: {
          name: "recipes",
          value: 0,
          metadata: {
            environment: process.env.SERVICE_ENV
          }
        },
        template: "{{=sequence.name}}-{{=id}}-{{=sequence.metadata.environment}}"
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
      'app',
      'env'
    ],
    exclude: [
      'password',
      'secret',
      'token',
      'request.headers.cookie',
      'dependencies',
      'devDependencies'
    ]
  }
};
