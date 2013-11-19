// Karma configuration
// Generated on Tue Nov 19 2013 10:02:06 GMT-0700 (MST)

module.exports = function(config) {
  config.set({
    basePath: '.',
    frameworks: ['nodeunit'],
    files: [
      'test/carvoyant-test.js'
    ],
    reporters: ['dots'],
    colors: true,
    logLevel: config.LOG_DEBUG,
    autoWatch: false,
    browsers: ['Chrome'],
    singleRun: true
  });
};
