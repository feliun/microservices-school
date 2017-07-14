module.exports = {
  logger: {
    transport: null
  },
  crawler: {
    frequency: 7200000,
    autostart: false
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
    },
    vhosts: {
      recipes: {
        connection: {
          hostname: 'rabbitmq'
        },
        queues: {
          'dead_letters:snoop': {},
          'retry:snoop': {},
          'delay:1ms': {
            options: {
              arguments: {
                'x-message-ttl': 1,
                'x-dead-letter-exchange': 'retry'
              }
            }
          },
          'recipes_crawler:snoop': {}
        },
        bindings: {
          'delay[delay.#] -> delay:1ms': {},
          'retry -> retry:snoop': {},
          'dead_letters -> dead_letters:snoop': {},
          'internal[recipes_crawler.v1.notifications.#.#] -> recipes_crawler:snoop': {}
        },
        subscriptions: {
          dead_letters: {
            queue: 'dead_letters:snoop'
          },
          retries: {
            queue: 'retry:snoop'
          },
          recipes_crawler: {
            queue: 'recipes_crawler:snoop',
            contentType: 'application/json'
          }
        },
      }
    }
  }
};
