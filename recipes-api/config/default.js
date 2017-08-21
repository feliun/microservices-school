module.exports = {
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  mongo: {
    url: 'mongodb://127.0.0.1/recipes'
  },
  store: {
    strategy: 'mongo'
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
      'env',
      'app'
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
      ysojkvfe: {
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
        queues: {
          'recipes_api:recipe:received': {
            'options': {
              'arguments': {
                'x-dead-letter-exchange': 'dead_letters',
                'x-dead-letter-routing-key': 'recipes_api.dead_letter'
              }
            }
          },
          'dead_letter:recipes_api': {}
        },
        bindings: {
          'internal[recipes_crawler.v1.notifications.recipe.crawled] -> recipes_api:recipe:received': {},
          'retry[recipes_api:recipe:received.#] -> recipes_api:recipe:received': {},
          'dead_letters[recipes_api.dead_letter] -> dead_letter:recipes_api': {},
        },
        subscriptions: {
          recipes_api: {
            queue: 'recipes_api:recipe:received',
            prefetch: 5,
            contentType: 'application/json'
          }
        },
        publications: {
          conclusions: {
            exchange: 'internal'
          },
          'retry_in_5m': {
            exchange: 'delay',
            options: {
              CC: [
                'delay.5m'
              ]
            }
          }
        }
      }
    },
    recovery: {
      'deferred_retry': [
        {
          strategy: 'forward',
          attempts: 10,
          publication: 'retry_in_5m',
          xDeathFix: true
        },
        {
          strategy: 'nack'
        }
      ],
      'dead_letter': [
        {
          strategy: 'republish',
          immediateNack: true
        }
      ]
    }
  }
};
