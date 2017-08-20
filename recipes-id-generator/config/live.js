module.exports = {
  logger: {
    transport: 'sumo'
  },
  generator: {
    options: {
      url: process.env.MONGO_URL || 'mongodb://mongo:27017/ysojkvfe'
    }
  }
}
