/**
 * This is a shim for running Nodeunit tests in the browser via Karma.
 */
nodeunit.run({
  client: require('./client_test'),
  utils: require('./utils_test')
});
