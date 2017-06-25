module.exports = {
  logger: {
    transport: null
  },
  crawler: {
    baseUrl: 'http://localhost:6000',
    searchSuffix: '/api/search',
    recipeSuffix: '/api/get',
    autostart: true,
    key: 'some_key',
    page: 10
  }
};
