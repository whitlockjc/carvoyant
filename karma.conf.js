/* Karma configuration */

'use strict';

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
