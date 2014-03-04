/**
 * [Carvoyant](http://www.carvoyant.com/) API Client as defined in the
 * [Carvoyent API Reference](http://confluence.carvoyant.com/display/PUBDEV/Carvoyant+API).
 *
 * @module carvoyant
 */

'use strict';

var client = require('./client');

module.exports = {
  Client: client.Client,
  createClient: client.createClient,
  Utilities: require('./utils'),
  VERSION: '0.0.1'
};
