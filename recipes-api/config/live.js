module.exports = {
  mongo: {
    url: 'mongodb://mongo:27017/recipes'
  },
  rabbitmq: {
    defaults: {},
    vhosts: {
      recipes: {
        connection: {
          hostname: 'rabbitmq'
        }
      }
    }
  }
}
