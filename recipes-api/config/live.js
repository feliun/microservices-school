module.exports = {
  mongo: {
    url: process.env.MONGO_URL || 'mongodb://mongo:27017/recipes'
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
