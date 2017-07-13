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
    },
    vhosts: {
      recipes: {
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
          'recipes_api:snoop': {}
        },
        bindings: {
          'delay[delay.#] -> delay:1ms': {},
          'retry -> retry:snoop': {},
          'dead_letters -> dead_letters:snoop': {},
          'internal[recipes_api.v1.notifications.#.#] -> recipes_api:snoop': {}
        },
        subscriptions: {
          dead_letters: {
            queue: 'dead_letters:snoop'
          },
          retries: {
            queue: 'retry:snoop'
          },
          recipes_snoop: {
            queue: 'recipes_api:snoop',
            contentType: 'application/json'
          }
        }
      }
    }
  }
};
