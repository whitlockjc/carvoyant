!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.carvoyant=e():"undefined"!=typeof global?global.carvoyant=e():"undefined"!=typeof self&&(self.carvoyant=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * [Carvoyant](http://www.carvoyant.com/) API Client as defined in the
 * [Carvoyent API Reference](http://confluence.carvoyant.com/display/PUBDEV/Carvoyant+API).
 *
 * @module carvoyant
 */

'use strict';

var client = require('./client')
  , pkg = require('../package.json');

module.exports = {
  Client: client.Client,
  createClient: client.createClient,
  Utilities: require('./utils'),
  VERSION: pkg.version
};

},{"../package.json":140,"./client":2,"./utils":3}],2:[function(require,module,exports){
/** @module carvoyant/client */

'use strict';

// Module Requirements
var _ = {
    contains: require('lodash.contains'),
    each: require('lodash.foreach'),
    extend: require('lodash.assign'),
    isBoolean: require('lodash.isboolean'),
    isDate: require('lodash.isdate'),
    isFunction: require('lodash.isfunction'),
    isNull: require('lodash.isnull'),
    isNumber: require('lodash.isnumber'),
    isUndefined: require('lodash.isundefined')
  }
  , request = require('superagent')
  , utils = require('./utils');

/**
 * The Carvoyant API URL.
 *
 * @constant
 * @type {string}
 * @default
 */
var DEFAULT_API_URL = 'https://dash.carvoyant.com/api';

/**
 * Callback for handling API responses.
 *
 * @param {object} res - The [Superagent](http://visionmedia.github.io/superagent/#response-properties) response object
 *
 * @callback module:carvoyant/client~responseCallback
 */

/**
 * Represents a Carvoyant Client.
 *
 * @param {object} options - The client options
 *
 * @constructor Client
 */
function Client (options) {

  var requiredOptions = [
    'apiKey',
    'securityToken'
  ];

  // Default options to an empty object
  if (!options) {
    options = {};
  }

  // Set defaults
  if (!options.apiUrl) {
    options.apiUrl = DEFAULT_API_URL;
  }

  // Validate the required fields
  _.each(requiredOptions, function (requiredOption) {

    if (!options[requiredOption]) {
      throw new Error('options.' + requiredOption + ' is a required Client option.');
    }

  });

  // Add the options to the Client
  _.extend(this, options);

}

/**
 * Factory for creating a new {@link Client}.
 *
 * @param {object} options - The client options
 *
 * @method createClient
 * @memberof module:carvoyant/client
 * @static
 */
function createClient (options) {

  return new Client(options);

}

/**
 * Return account details for the account id specified account.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/Account}
 *
 * @param {string} accountId - The account id
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 *
 * @function Client#accountDetails
 */
Client.prototype.accountDetails = function (accountId, cb) {

  if (_.isUndefined(accountId)) {
    throw new TypeError('accountId must be defined.');
  }

  this.makeRequest('/account/' + accountId, 'get', cb);

};

/**
 * Return all visible accounts.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/Account}
 *
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 *
 * @function Client#accounts
 */
Client.prototype.accounts = function (cb) {

  this.makeRequest('/account/', 'get', cb);

};

/**
 * Returns a list of constraints for the specified vehicle.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/Constraint}
 *
 * @param {string} vehicleId - The vehicle id
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 * @param {object} [queryParams] - The query parameters for the request (API, search, sort and/or pagination params)
 *                                 Since this API supports pagination and sorting, please see the
 *                                 {@link Client#makeRequest} documentation for more details.
 * @param {boolean} [queryParams.activeOnly] - Used to filter constraints based on whether or not Carvoyant is enforcing
 *                                             the constraint or not.
 * @param {string} [queryParams.type] - Used for filtering the constraints by their type.
 *
 * @function Client#constraintDetails
 */
Client.prototype.constraintDetails = function (vehicleId, constraintId, cb) {

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  if (_.isUndefined(constraintId)) {
    throw new TypeError('constraintId must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleId + '/constraint/' + constraintId, 'get', cb);

};

/**
 * Creates an account.  (Only partner application keys can call this API.)
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/Account}
 *
 * @param {object} accountData - The account's data attributes
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 *
 * @function Client#createAccount
 */
Client.prototype.createAccount = function (accountData, cb) {

  if (_.isUndefined(accountData)) {
    throw new TypeError('accountData must be defined.');
  }

  this.makeRequest('/account/', 'post', cb, accountData);

};

/**
 * Creates an event subscription.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/EventSubscription}
 *
 * @param {string} vehicleId - The vehicle id
 * @param {string} eventSubscriptionType - The event subscription type
 * @param {object} eventSubscription - The event subscription
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 *
 * @function Client#createEventSubscription
 */
Client.prototype.createEventSubscription = function (vehicleId, eventSubscriptionType, eventSubscription, cb) {

  // We do not validate the event subscription type to avoid the API breaking when upstream types are added/deleted

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  if (_.isUndefined(eventSubscriptionType)) {
    throw new TypeError('eventSubscriptionType must be defined.');
  }

  if (_.isUndefined(eventSubscription)) {
    throw new TypeError('eventSubscription must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleId + '/eventSubscription' +
                      (eventSubscriptionType ? '/' + eventSubscriptionType : ''),
                   'post', cb, eventSubscription);

};

/**
 * Create a new vehicle.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/Vehicle}
 *
 * @param {object} vehicleData - The vehicle's data attributes
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 *
 * @function Client#createVehicle
 */
Client.prototype.createVehicle = function (vehicleData, cb) {

  if (_.isUndefined(vehicleData)) {
    throw new TypeError('vehicleData must be defined.');
  }

  this.makeRequest('/vehicle/', 'post', cb, vehicleData);

};

/**
 * Deletes an account.  (Only partner application keys can call this API.)
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/Account}
 *
 * @param {object} accountId - The account id
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 *
 * @function Client#deleteAccount
 */
Client.prototype.deleteAccount = function (accountId, cb) {

  if (_.isUndefined(accountId)) {
    throw new TypeError('accountId must be defined.');
  }

  this.makeRequest('/account/' + accountId, 'delete', cb);

};

/**
 * Deletes an event subscription.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/EventSubscription}
 *
 * @param {string} vehicleId - The vehicle id
 * @param {string} eventSubscriptionId - The event subscription id
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 * @param {string} [eventSubscriptionType] - The event subscription type
 *
 * @function Client#deleteEventSubscription
 */
Client.prototype.deleteEventSubscription = function (vehicleId, eventSubscriptionId, cb, eventSubscriptionType) {

  // We do not validate the event subscription type to avoid the API breaking when upstream types are added/deleted

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  if (_.isUndefined(eventSubscriptionId)) {
    throw new TypeError('eventSubscriptionId must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleId + '/eventSubscription' +
                       (eventSubscriptionType ? '/' + eventSubscriptionType : '') + '/' + eventSubscriptionId,
                   'delete', cb);

};

/**
 * Returns the event subscription details.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/EventSubscription}
 *
 * @param {string} vehicleId - The vehicle id
 * @param {string} eventSubscriptionId - The event subscription id
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 * @param {string} [eventSubscriptionType] - The event subscription type
 *
 * @function Client#eventSubscriptionDetails
 */
Client.prototype.eventSubscriptionDetails = function (vehicleId, eventSubscriptionId, cb, eventSubscriptionType) {

  // We do not validate the event subscription type to avoid the API breaking when upstream types are added/deleted

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  if (_.isUndefined(eventSubscriptionId)) {
    throw new TypeError('eventSubscriptionId must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleId + '/eventSubscription' +
                       (eventSubscriptionType ? '/' + eventSubscriptionType : '') + '/' + eventSubscriptionId,
                   'get', cb);

};

/**
 * Returns the event subscriptions.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/EventSubscription}
 *
 * @param {string} vehicleId - The vehicle id
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 * @param {string} [eventSubscriptionType] - If provided, return only event subscriptions of the given type
 *
 * @function Client#eventSubscriptions
 */
Client.prototype.eventSubscriptions = function (vehicleId, cb, eventSubscriptionType) {

  // We do not validate the event subscription type to avoid the API breaking when upstream types are added/deleted

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleId + '/eventSubscription' +
                       (eventSubscriptionType ? '/' + eventSubscriptionType : ''), 'get', cb);

};

/**
 * Returns the details for the specified trip.  The calling account must have access to the vehicle data.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/Trip}
 *
 * @param {string} vehicleId - The vehicle id
 * @param {string} tripId - The trip id
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 *
 * @function Client#tripDetails
 */
Client.prototype.tripDetails = function (vehicleId, tripId, cb) {

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  if (_.isUndefined(tripId)) {
    throw new TypeError('tripId must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleId + '/trip/' + tripId, 'get', cb);

};

/**
 * Updates an existing account.  (Only partner application keys can call this API.)
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/Account}
 *
 * @param {object} accountData - The account's data attributes
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 *
 * @function Client#updateAccount
 */
Client.prototype.updateAccount = function (accountData, cb) {

  if (_.isUndefined(accountData)) {
    throw new TypeError('accountData must be defined.');
  }

  if (_.isUndefined(accountData.id)) {
    throw new TypeError('accountData.id must be defined.');
  }

  this.makeRequest('/account/' + accountData.id, 'post', cb, accountData);

};

/**
 * Updates an event subscription.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/EventSubscription}
 *
 * @param {string} vehicleId - The vehicle id
 * @param {object} eventSubscription - The event subscription
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 *
 * @function Client#eventSubscriptionDetails
 */
Client.prototype.updateEventSubscription = function (vehicleId, eventSubscription, cb) {

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  if (_.isUndefined(eventSubscription)) {
    throw new TypeError('eventSubscription must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleId + '/eventSubscription/' +
                       utils.externalizeEventSubscriptionType(eventSubscription._type) + '/' + eventSubscription.id,
                   'post', cb, eventSubscription);

};

/**
 * Updates an existing vehicle.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/Vehicle}
 *
 * @param {string} vehicleId - The vehicle id
 * @param {object} vehicleData - The vehicle's data attribute to update
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 *
 * @function Client#updateVehicle
 */
Client.prototype.updateVehicle = function (vehicleData, cb) {

  if (_.isUndefined(vehicleData)) {
    throw new TypeError('vehicleData must be defined.');
  }

  if (_.isUndefined(vehicleData.vehicleId)) {
    throw new TypeError('vehicleData.vehicleId must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleData.vehicleId, 'post', cb, vehicleData);

};


/**
 * Retrieve a vehicle by its id.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/Vehicle}
 *
 * @param {string} vehicleId - The vehicle id
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 *
 * @function Client#vehicle
 */
Client.prototype.vehicle = function (vehicleId, cb) {

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleId, 'get', cb);

};

/**
 * Returns a list of constraints for the specified vehicle.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/Constraint}
 *
 * @param {string} vehicleId - The vehicle id
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 * @param {object} [queryParams] - The query parameters for the request (API, search, sort and/or pagination params)
 *                                 Since this API supports pagination and sorting, please see the
 *                                 {@link Client#makeRequest} documentation for more details.
 * @param {boolean} [queryParams.activeOnly] - Used to filter constraints based on whether or not Carvoyant is enforcing
 *                                             the constraint or not.
 * @param {string} [queryParams.type] - Used for filtering the constraints by their type.
 *
 * @function Client#vehicleConstraints
 */
Client.prototype.vehicleConstraints = function (vehicleId, cb, queryParams) {

  var realQueryParams = {};

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  // We do not validate the constraint type to avoid the API breaking when upstream types are added/deleted

  _.each(queryParams, function (value, key) {

    if (key === 'activeOnly') {
      if (!_.isBoolean(value)) {
        throw new TypeError('activeOnly must be a Boolean.');
      }

      // Convert the value to a string
      realQueryParams[key] = JSON.stringify(value);
    } else {
      realQueryParams[key] = value;
    }

  });

  this.makeRequest('/vehicle/' + vehicleId + '/constraint', 'get', cb, realQueryParams);

};

/**
 * Returns raw vehicle data for the specified vehicle.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/DataPoint}
 *
 * @param {string} vehicleId - The vehicle id
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 * @param {object} [queryParams] - The query parameters for the request (API, search, sort and/or pagination params)
 *                                 Since this API supports pagination and sorting, please see the
 *                                 {@link Client#makeRequest} documentation for more details.
 * @param {string} [queryParams.key] - The data type to be returned.  Allowable values can be found in the link above.
 * @param {boolean} [queryParams.mostRecentOnly] - If this parameter is specified, the most recent data point collected
 *                                                 for every key type will be returned.  Please note that the data
 *                                                 points returned may not have been collected at the same time.
 *                                                 Additionally, pagination and sorting is not supported when
 *                                                 mostRecentOnly is specified.
 *
 * @function Client#vehicleData
 */
Client.prototype.vehicleData = function (vehicleId, cb, queryParams) {

  var realQueryParams = {};

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  _.each(queryParams, function (value, key) {

    if (key === 'mostRecentOnly') {
      if (!_.isBoolean(value)) {
        throw new TypeError('mostRecentOnly must be a Boolean.');
      }

      // Do not include the parameter if its value is false
      if (value) {
        realQueryParams[key] = true;
      }
    } else {
      realQueryParams[key] = value;
    }

  });

  this.makeRequest('/vehicle/' + vehicleId + '/data', 'get', cb, realQueryParams);

};

/**
 * Returns a collection of raw, related vehicle data for the specified vehicle.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/DataSet}
 *
 * @param {string} vehicleId - The vehicle id
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 * @param {object} [queryParams] - The query parameters for the request (API, search, sort and/or pagination params)
 *                                 Since this API supports pagination and sorting, please see the
 *                                 {@link Client#makeRequest} documentation for more details.
 *
 * @function Client#vehicleDataSet
 */
Client.prototype.vehicleDataSet = function (vehicleId, cb, queryParams) {

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleId + '/dataSet', 'get', cb, queryParams);

};

/**
 * Retrieve a list of vehicles.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/Vehicle}
 *
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 *
 * @function Client#vehicles
 */
Client.prototype.vehicles = function (cb) {

  this.makeRequest('/vehicle', 'get', cb);

};

/**
 * Returns a paged list of trips for the specified vehicle.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/Trip}
 *
 * @param {string} vehicleId - The vehicle id
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 * @param {object} [queryParams] - The query parameters for the request (API, search, sort and/or pagination params)
 *                                 Since this API supports pagination and sorting, please see the
 *                                 {@link Client#makeRequest} documentation for more details.
 * @param {boolean} [queryParams.includeData] - If true, then the results will include all of the data points
 *                                              collected during that trip.
 * @param {date} [queryParams.startTime] - Used for filtering the results.  Only trips that started after this time
 *                                         are returned.
 * @param {date} [queryParams.endTime] - Used for filtering the results.  Only trips that started before this time
 *                                       are returned.
 *
 * @function Client#vehicleTrips
 */
Client.prototype.vehicleTrips = function (vehicleId, cb, queryParams) {

  var realQueryParams = {};

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  _.each(queryParams, function (value, key) {

    if (key === 'includeData') {
      if (!_.isBoolean(value)) {
        throw new TypeError('includeData must be a Boolean.');
      }

      // Convert the value to a string
      realQueryParams[key] = JSON.stringify(value);
    } else if ((key === 'startTime' || key === 'endTime') && !_.isDate(value)) {
      // Convert the value to a timestamp string
      try {
        realQueryParams[key] = utils.dateToTimestamp(value);
      } catch (err) {
        // Use our more specific error message
        if (err instanceof TypeError && err.message.indexOf('must be a Date.') > -1) {
          throw new TypeError(key + ' must be a Date.');
        } else {
          throw err;
        }
      }
    } else {
      realQueryParams[key] = value;
    }

  });

  this.makeRequest('/vehicle/' + vehicleId + '/trip', 'get', cb, realQueryParams);

};

/**
 * Makes an API request and calls the callback with the response object.
 *
 * @param {string} apiPath - The url path for the request
 * @param {string} method - The http method
 * @param {module:carvoyant/client~responseCallback} cb - The callback
 * @param {object} [data] - The data to be submitted to the API.  (API specific parameters, pagination parameters and
 *                          sorting parameters.  Since a few different functions support the pagination and/or sorting
 *                          query parameters, they are documented here.)
 * @param {number} [data.searchLimit] - Specify how many results are included in the response
 * @param {number} [data.searchOffset] - Specify the offset from the beginning of the data set that is returned
 * @param {string} [data.sortOrder] - Specify the sort order (Either `asc` or `desc` to sort the response items
 *                                    ascending or descending respectively.)
 *
 * @function Client#makeRequest
 */
Client.prototype.makeRequest = function (apiPath, method, cb, data) {

  var r = request[method !== 'delete' ? method : 'del'](this.apiUrl + apiPath).auth(this.apiKey, this.securityToken)
    , sortOrders = ['asc', 'desc'];

  if (!_.isUndefined(cb) && !_.isNull(cb) && !_.isFunction(cb)) {
    throw new TypeError('cb must be a Function.');
  }

  // Default to an empty options
  data = data || {};

  _.each(data, function (value, key) {

    var dataItem = {};

    // Do not throw undefined items into the dataItem paramters
    if (_.isUndefined(value)) {
      return;
    }

    if (key === 'sortOrder' && !_.contains(sortOrders, value)) {
      throw new TypeError(key + ' must be one of the following: ' + sortOrders.join(', '));
    } else if ((key === 'searchLimit' || key === 'searchOffset') && !_.isNumber(value)) {
      throw new TypeError(key + ' must be a Number.');
    }

    dataItem[key] = value;

    // TODO: Should we use query for GET and send for everything else?
    if(method.toUpperCase() === 'POST') {
      r.send(dataItem);
    } else {
      r.query(dataItem);
    }

  });

  r.end(function (res) {
    if (cb) {
      cb(res);
    }
  });

};

/**
 * Makes an API request based on an action in the passed in response object and calls the callback with the response
 * object.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/JSON+Success+Response+Format}
 *
 * @param {object} res - The [Superagent](http://visionmedia.github.io/superagent/#response-properties) response object
 * @param {string} action - The action in the passed in response to invoke
 * @param {module:carvoyant/client~responseCallback} cb - The callback
 *
 * @function Client#makeActionRequest
 */
Client.prototype.makeActionRequest = function (res, action, cb) {

  // Superagent appears to use different variables for the path/url based on the JavaScript environment:
  //   browser: res.req.url (The full URL of the request)
  //   Node.js: res.req.path (The path portion of the request)
  var path = _.isUndefined(res.req.path) ?
    res.req.url.replace(this.apiUrl, '') :
    res.req.path;

  this.makeRequest(path.replace('/api', '').split('?')[0], res.req.method.toLowerCase(), cb,
                   utils.actionQueryParams(res, action));

};


/**
 * Make a subsequent request based on the response passed in for the next page of results.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/Sorting+and+Paging}
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/JSON+Success+Response+Format}
 *
 * @param {object} res - The [Superagent](http://visionmedia.github.io/superagent/#response-properties) response object
 * @param {module:carvoyant/client~responseCallback} cb - The callback
 */
Client.prototype.nextPage = function (res, cb) {

  this.makeActionRequest(res, 'next', cb);

};

/**
 * Make a subsequent request based on the response passed in for the previous page of results.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/Sorting+and+Paging}
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/JSON+Success+Response+Format}
 *
 * @param {object} res - The [Superagent](http://visionmedia.github.io/superagent/#response-properties) response object
 * @param {module:carvoyant/client~responseCallback} cb - The callback
 */
Client.prototype.prevPage = function (res, cb) {

  this.makeActionRequest(res, 'previous', cb);

};

exports.Client = Client;
exports.createClient = createClient;

},{"./utils":3,"lodash.assign":4,"lodash.contains":26,"lodash.foreach":103,"lodash.isboolean":128,"lodash.isdate":129,"lodash.isfunction":130,"lodash.isnull":131,"lodash.isnumber":132,"lodash.isundefined":136,"superagent":137}],3:[function(require,module,exports){
/** @module carvoyant/utils */

'use strict';

var _ = {
    contains: require('lodash.contains'),
    each: require('lodash.foreach'),
    find: require('lodash.find'),
    isDate: require('lodash.isdate'),
    isFunction: require('lodash.isfunction'),
    isObject: require('lodash.isobject'),
    isString: require('lodash.isstring'),
    isUndefined: require('lodash.isundefined')
  }
  , eventSubscriptionTypeMap = {
    GEOFENCE: 'geoFence',
    LOWBATTERY: 'lowBattery',
    NUMERICDATAKEY: 'numericDataKey',
    TIMEOFDAY: 'timeOfDay',
    TROUBLECODE: 'troubleCode'
  };

/**
 * Returns the required query parameters to make a follow-up request for a given action.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/JSON+Success+Response+Format}
 *
 * @param {object} res - The [Superagent](http://visionmedia.github.io/superagent/#response-properties) response object
 * @param {string} actionName - The action to retrieve the details for
 */
exports.actionQueryParams = function (res, actionName) {

  var queryParamsToConvert = {
      booleans: [
        'includeData'
      ],
      timestamps: [
        'endTime',
        'startTime'
      ],
      numbers: [
        'searchLimit',
        'searchOffset'
      ]
    }
    , queryParams = {}
    , action;

  if (_.isUndefined(actionName)) {
    throw new TypeError('actionName must be defined.');
  } else if (!_.isString(actionName)) {
    throw new TypeError('actionName must be a String.');
  }

  if (_.isUndefined(res)) {
    throw new TypeError('res must be defined.');
  } else if (!_.isObject(res)) {
    throw new TypeError('res must be an Object.');
  }

  action = _.find(res.body.actions, function (actionObj) {
    return actionObj.name === actionName;
  });

  if (_.isUndefined(action)) {
    throw new TypeError('No action found for name: ' + actionName);
  }

  _.each((action.uri.indexOf('?') > -1 ? action.uri.split('?')[1] : '').split('#')[0].split('&'), function (param) {
    var paramParts = param.split('=')
      , key = decodeURIComponent(paramParts[0].replace(/\+/g, ' '))
      , value = paramParts.length === 2 ? decodeURIComponent(paramParts[1].replace(/\+/g, ' ')) : undefined;

    if (_.contains(queryParamsToConvert.booleans, key)) {
      if (value === 'true') {
        queryParams[key] = true;
      } else {
        queryParams[key] = false;
      }
    } else if (_.contains(queryParamsToConvert.timestamps, key)) {
      // For some reason, returned timestamps are real ISO 8601 strings
      queryParams[key] = exports.dateToTimestamp(new Date(value));
    } else if (_.contains(queryParamsToConvert.numbers, key)) {
      queryParams[key] = parseInt(value, 10);
    }
  });

  // Do type conversion

  return queryParams;

};

/**
 * Returns a {@external Date} based on the timestamp string passed in.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/DateTime}
 *
 * @param {string} timestamp - The timestamp string (Format: yyyyMMddTHHmmssZ)
 */
exports.timestampToDate = function (timestamp) {

  if (_.isUndefined(timestamp)) {
    throw new TypeError('timestamp must be defined.');
  } else if (!_.isString(timestamp)) {
    throw new TypeError('timestamp must be a String.');
  }

  var match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})([+-])(\d{4})/.exec(timestamp);

  if (!match) {
    throw new TypeError('timestamp did not match expected format (yyyyMMddTHHmmssZ).');
  }

  return new Date(match[1] + '-' + match[2] + '-' + match[3] + 'T' + match[4] + ':' + match[5] + ':' + match[6] +
                  match[7] + match[8]);

};

/**
 * Returns a formatted timestamp {@external String}.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/DateTime}
 *
 * @param {date} date - The date object to convert to a timestamp string
 */
exports.dateToTimestamp = function (date) {

  if (_.isUndefined(date)) {
    throw new TypeError('date must be defined.');
  } else if (!_.isDate(date)) {
    throw new TypeError('date must be a Date.');
  }

  var lPad = function (num) {
      return num < 10 ? '0' + num : num.toString();
    }
    , tzHours = date.getTimezoneOffset() / 60
    , tzMins = date.getTimezoneOffset() % 60;

  return [
    date.getFullYear(),
    lPad(date.getMonth() + 1),
    lPad(date.getDate()),
    'T',
    lPad(date.getHours()),
    lPad(date.getMinutes()),
    lPad(date.getSeconds()),
    date.getTimezoneOffset() > 0 ? '-' : '+',
    lPad(tzHours) + lPad(tzMins)
  ].join('');

};

/**
 * Externalize event subscription type.  (If unable to externalize, return the passed in value.)
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/EventSubscription}
 *
 * Note: The internal representation of the event subscription type is not the same value that is used in the URLs.
 *       we have to convert these.
 *
 * @param {string} eventSubscriptionType - The event subscription type
 */
exports.externalizeEventSubscriptionType = function (eventSubscriptionType) {

  var externalType = eventSubscriptionTypeMap[eventSubscriptionType];

  return externalType ? externalType : externalType;

};

},{"lodash.contains":26,"lodash.find":50,"lodash.foreach":103,"lodash.isdate":129,"lodash.isfunction":130,"lodash.isobject":133,"lodash.isstring":135,"lodash.isundefined":136}],4:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    keys = require('lodash.keys'),
    objectTypes = require('lodash._objecttypes');

/**
 * Assigns own enumerable properties of source object(s) to the destination
 * object. Subsequent sources will overwrite property assignments of previous
 * sources. If a callback is provided it will be executed to produce the
 * assigned values. The callback is bound to `thisArg` and invoked with two
 * arguments; (objectValue, sourceValue).
 *
 * @static
 * @memberOf _
 * @type Function
 * @alias extend
 * @category Objects
 * @param {Object} object The destination object.
 * @param {...Object} [source] The source objects.
 * @param {Function} [callback] The function to customize assigning values.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Object} Returns the destination object.
 * @example
 *
 * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
 * // => { 'name': 'fred', 'employer': 'slate' }
 *
 * var defaults = _.partialRight(_.assign, function(a, b) {
 *   return typeof a == 'undefined' ? b : a;
 * });
 *
 * var object = { 'name': 'barney' };
 * defaults(object, { 'name': 'fred', 'employer': 'slate' });
 * // => { 'name': 'barney', 'employer': 'slate' }
 */
var assign = function(object, source, guard) {
  var index, iterable = object, result = iterable;
  if (!iterable) return result;
  var args = arguments,
      argsIndex = 0,
      argsLength = typeof guard == 'number' ? 2 : args.length;
  if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
    var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
  } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
    callback = args[--argsLength];
  }
  while (++argsIndex < argsLength) {
    iterable = args[argsIndex];
    if (iterable && objectTypes[typeof iterable]) {
    var ownIndex = -1,
        ownProps = objectTypes[typeof iterable] && keys(iterable),
        length = ownProps ? ownProps.length : 0;

    while (++ownIndex < length) {
      index = ownProps[ownIndex];
      result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
    }
    }
  }
  return result
};

module.exports = assign;

},{"lodash._basecreatecallback":5,"lodash._objecttypes":22,"lodash.keys":23}],5:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var bind = require('lodash.bind'),
    identity = require('lodash.identity'),
    setBindData = require('lodash._setbinddata'),
    support = require('lodash.support');

/** Used to detected named functions */
var reFuncName = /^\s*function[ \n\r\t]+\w/;

/** Used to detect functions containing a `this` reference */
var reThis = /\bthis\b/;

/** Native method shortcuts */
var fnToString = Function.prototype.toString;

/**
 * The base implementation of `_.createCallback` without support for creating
 * "_.pluck" or "_.where" style callbacks.
 *
 * @private
 * @param {*} [func=identity] The value to convert to a callback.
 * @param {*} [thisArg] The `this` binding of the created callback.
 * @param {number} [argCount] The number of arguments the callback accepts.
 * @returns {Function} Returns a callback function.
 */
function baseCreateCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  // exit early for no `thisArg` or already bound by `Function#bind`
  if (typeof thisArg == 'undefined' || !('prototype' in func)) {
    return func;
  }
  var bindData = func.__bindData__;
  if (typeof bindData == 'undefined') {
    if (support.funcNames) {
      bindData = !func.name;
    }
    bindData = bindData || !support.funcDecomp;
    if (!bindData) {
      var source = fnToString.call(func);
      if (!support.funcNames) {
        bindData = !reFuncName.test(source);
      }
      if (!bindData) {
        // checks if `func` references the `this` keyword and stores the result
        bindData = reThis.test(source);
        setBindData(func, bindData);
      }
    }
  }
  // exit early if there are no `this` references or `func` is bound
  if (bindData === false || (bindData !== true && bindData[1] & 1)) {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 2: return function(a, b) {
      return func.call(thisArg, a, b);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
  }
  return bind(func, thisArg);
}

module.exports = baseCreateCallback;

},{"lodash._setbinddata":6,"lodash.bind":9,"lodash.identity":19,"lodash.support":20}],6:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var noop = require('lodash.noop'),
    reNative = require('lodash._renative');

/** Used as the property descriptor for `__bindData__` */
var descriptor = {
  'configurable': false,
  'enumerable': false,
  'value': null,
  'writable': false
};

/** Used to set meta data on functions */
var defineProperty = (function() {
  // IE 8 only accepts DOM elements
  try {
    var o = {},
        func = reNative.test(func = Object.defineProperty) && func,
        result = func(o, o, o) && func;
  } catch(e) { }
  return result;
}());

/**
 * Sets `this` binding data on a given function.
 *
 * @private
 * @param {Function} func The function to set data on.
 * @param {Array} value The data array to set.
 */
var setBindData = !defineProperty ? noop : function(func, value) {
  descriptor.value = value;
  defineProperty(func, '__bindData__', descriptor);
};

module.exports = setBindData;

},{"lodash._renative":7,"lodash.noop":8}],7:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/** Used to detect if a method is native */
var reNative = RegExp('^' +
  String(toString)
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/toString| for [^\]]+/g, '.*?') + '$'
);

module.exports = reNative;

},{}],8:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * A no-operation function.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @example
 *
 * var object = { 'name': 'fred' };
 * _.noop(object) === undefined;
 * // => true
 */
function noop() {
  // no operation performed
}

module.exports = noop;

},{}],9:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var createWrapper = require('lodash._createwrapper'),
    reNative = require('lodash._renative'),
    slice = require('lodash._slice');

/**
 * Creates a function that, when called, invokes `func` with the `this`
 * binding of `thisArg` and prepends any additional `bind` arguments to those
 * provided to the bound function.
 *
 * @static
 * @memberOf _
 * @category Functions
 * @param {Function} func The function to bind.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {...*} [arg] Arguments to be partially applied.
 * @returns {Function} Returns the new bound function.
 * @example
 *
 * var func = function(greeting) {
 *   return greeting + ' ' + this.name;
 * };
 *
 * func = _.bind(func, { 'name': 'fred' }, 'hi');
 * func();
 * // => 'hi fred'
 */
function bind(func, thisArg) {
  return arguments.length > 2
    ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
    : createWrapper(func, 1, null, null, thisArg);
}

module.exports = bind;

},{"lodash._createwrapper":10,"lodash._renative":17,"lodash._slice":18}],10:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseBind = require('lodash._basebind'),
    baseCreateWrapper = require('lodash._basecreatewrapper'),
    isFunction = require('lodash.isfunction');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push;

/**
 * Creates a function that, when called, either curries or invokes `func`
 * with an optional `this` binding and partially applied arguments.
 *
 * @private
 * @param {Function|string} func The function or method name to reference.
 * @param {number} bitmask The bitmask of method flags to compose.
 *  The bitmask may be composed of the following flags:
 *  1 - `_.bind`
 *  2 - `_.bindKey`
 *  4 - `_.curry`
 *  8 - `_.curry` (bound)
 *  16 - `_.partial`
 *  32 - `_.partialRight`
 * @param {Array} [partialArgs] An array of arguments to prepend to those
 *  provided to the new function.
 * @param {Array} [partialRightArgs] An array of arguments to append to those
 *  provided to the new function.
 * @param {*} [thisArg] The `this` binding of `func`.
 * @param {number} [arity] The arity of `func`.
 * @returns {Function} Returns the new function.
 */
function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
  var isBind = bitmask & 1,
      isBindKey = bitmask & 2,
      isCurry = bitmask & 4,
      isCurryBound = bitmask & 8,
      isPartial = bitmask & 16,
      isPartialRight = bitmask & 32;

  if (!isBindKey && !isFunction(func)) {
    throw new TypeError;
  }
  if (isPartial && !partialArgs.length) {
    bitmask &= ~16;
    isPartial = partialArgs = false;
  }
  if (isPartialRight && !partialRightArgs.length) {
    bitmask &= ~32;
    isPartialRight = partialRightArgs = false;
  }
  var bindData = func && func.__bindData__;
  if (bindData && bindData !== true) {
    bindData = bindData.slice();

    // set `thisBinding` is not previously bound
    if (isBind && !(bindData[1] & 1)) {
      bindData[4] = thisArg;
    }
    // set if previously bound but not currently (subsequent curried functions)
    if (!isBind && bindData[1] & 1) {
      bitmask |= 8;
    }
    // set curried arity if not yet set
    if (isCurry && !(bindData[1] & 4)) {
      bindData[5] = arity;
    }
    // append partial left arguments
    if (isPartial) {
      push.apply(bindData[2] || (bindData[2] = []), partialArgs);
    }
    // append partial right arguments
    if (isPartialRight) {
      push.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
    }
    // merge flags
    bindData[1] |= bitmask;
    return createWrapper.apply(null, bindData);
  }
  // fast path for `_.bind`
  var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
  return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
}

module.exports = createWrapper;

},{"lodash._basebind":11,"lodash._basecreatewrapper":14,"lodash.isfunction":130}],11:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreate = require('lodash._basecreate'),
    isObject = require('lodash.isobject'),
    setBindData = require('lodash._setbinddata');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push;

/**
 * The base implementation of `_.bind` that creates the bound function and
 * sets its meta data.
 *
 * @private
 * @param {Array} bindData The bind data array.
 * @returns {Function} Returns the new bound function.
 */
function baseBind(bindData) {
  var func = bindData[0],
      partialArgs = bindData[2],
      thisArg = bindData[4];

  function bound() {
    // `Function#bind` spec
    // http://es5.github.io/#x15.3.4.5
    if (partialArgs) {
      var args = partialArgs.slice();
      push.apply(args, arguments);
    }
    // mimic the constructor's `return` behavior
    // http://es5.github.io/#x13.2.2
    if (this instanceof bound) {
      // ensure `new bound` is an instance of `func`
      var thisBinding = baseCreate(func.prototype),
          result = func.apply(thisBinding, args || arguments);
      return isObject(result) ? result : thisBinding;
    }
    return func.apply(thisArg, args || arguments);
  }
  setBindData(bound, bindData);
  return bound;
}

module.exports = baseBind;

},{"lodash._basecreate":12,"lodash._setbinddata":6,"lodash.isobject":133}],12:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isObject = require('lodash.isobject'),
    noop = require('lodash.noop'),
    reNative = require('lodash._renative');

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeCreate = reNative.test(nativeCreate = Object.create) && nativeCreate;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} prototype The object to inherit from.
 * @returns {Object} Returns the new object.
 */
function baseCreate(prototype, properties) {
  return isObject(prototype) ? nativeCreate(prototype) : {};
}
// fallback for browsers without `Object.create`
if (!nativeCreate) {
  baseCreate = (function() {
    function Object() {}
    return function(prototype) {
      if (isObject(prototype)) {
        Object.prototype = prototype;
        var result = new Object;
        Object.prototype = null;
      }
      return result || global.Object();
    };
  }());
}

module.exports = baseCreate;

},{"lodash._renative":17,"lodash.isobject":133,"lodash.noop":13}],13:[function(require,module,exports){
module.exports=require(8)
},{}],14:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreate = require('lodash._basecreate'),
    isObject = require('lodash.isobject'),
    setBindData = require('lodash._setbinddata'),
    slice = require('lodash._slice');

/**
 * Used for `Array` method references.
 *
 * Normally `Array.prototype` would suffice, however, using an array literal
 * avoids issues in Narwhal.
 */
var arrayRef = [];

/** Native method shortcuts */
var push = arrayRef.push;

/**
 * The base implementation of `createWrapper` that creates the wrapper and
 * sets its meta data.
 *
 * @private
 * @param {Array} bindData The bind data array.
 * @returns {Function} Returns the new function.
 */
function baseCreateWrapper(bindData) {
  var func = bindData[0],
      bitmask = bindData[1],
      partialArgs = bindData[2],
      partialRightArgs = bindData[3],
      thisArg = bindData[4],
      arity = bindData[5];

  var isBind = bitmask & 1,
      isBindKey = bitmask & 2,
      isCurry = bitmask & 4,
      isCurryBound = bitmask & 8,
      key = func;

  function bound() {
    var thisBinding = isBind ? thisArg : this;
    if (partialArgs) {
      var args = partialArgs.slice();
      push.apply(args, arguments);
    }
    if (partialRightArgs || isCurry) {
      args || (args = slice(arguments));
      if (partialRightArgs) {
        push.apply(args, partialRightArgs);
      }
      if (isCurry && args.length < arity) {
        bitmask |= 16 & ~32;
        return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
      }
    }
    args || (args = arguments);
    if (isBindKey) {
      func = thisBinding[key];
    }
    if (this instanceof bound) {
      thisBinding = baseCreate(func.prototype);
      var result = func.apply(thisBinding, args);
      return isObject(result) ? result : thisBinding;
    }
    return func.apply(thisBinding, args);
  }
  setBindData(bound, bindData);
  return bound;
}

module.exports = baseCreateWrapper;

},{"lodash._basecreate":15,"lodash._setbinddata":6,"lodash._slice":18,"lodash.isobject":133}],15:[function(require,module,exports){
module.exports=require(12)
},{"lodash._renative":17,"lodash.isobject":133,"lodash.noop":16}],16:[function(require,module,exports){
module.exports=require(8)
},{}],17:[function(require,module,exports){
module.exports=require(7)
},{}],18:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Slices the `collection` from the `start` index up to, but not including,
 * the `end` index.
 *
 * Note: This function is used instead of `Array#slice` to support node lists
 * in IE < 9 and to ensure dense arrays are returned.
 *
 * @private
 * @param {Array|Object|string} collection The collection to slice.
 * @param {number} start The start index.
 * @param {number} end The end index.
 * @returns {Array} Returns the new array.
 */
function slice(array, start, end) {
  start || (start = 0);
  if (typeof end == 'undefined') {
    end = array ? array.length : 0;
  }
  var index = -1,
      length = end - start || 0,
      result = Array(length < 0 ? 0 : length);

  while (++index < length) {
    result[index] = array[start + index];
  }
  return result;
}

module.exports = slice;

},{}],19:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'name': 'fred' };
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = identity;

},{}],20:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var reNative = require('lodash._renative');

/** Used to detect functions containing a `this` reference */
var reThis = /\bthis\b/;

/**
 * An object used to flag environments features.
 *
 * @static
 * @memberOf _
 * @type Object
 */
var support = {};

/**
 * Detect if functions can be decompiled by `Function#toString`
 * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
 *
 * @memberOf _.support
 * @type boolean
 */
support.funcDecomp = !reNative.test(global.WinRTError) && reThis.test(function() { return this; });

/**
 * Detect if `Function#name` is supported (all but IE).
 *
 * @memberOf _.support
 * @type boolean
 */
support.funcNames = typeof Function.name == 'string';

module.exports = support;

},{"lodash._renative":21}],21:[function(require,module,exports){
module.exports=require(7)
},{}],22:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to determine if values are of the language type Object */
var objectTypes = {
  'boolean': false,
  'function': true,
  'object': true,
  'number': false,
  'string': false,
  'undefined': false
};

module.exports = objectTypes;

},{}],23:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var isObject = require('lodash.isobject'),
    reNative = require('lodash._renative'),
    shimKeys = require('lodash._shimkeys');

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeKeys = reNative.test(nativeKeys = Object.keys) && nativeKeys;

/**
 * Creates an array composed of the own enumerable property names of an object.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property names.
 * @example
 *
 * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
 * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  if (!isObject(object)) {
    return [];
  }
  return nativeKeys(object);
};

module.exports = keys;

},{"lodash._renative":24,"lodash._shimkeys":25,"lodash.isobject":133}],24:[function(require,module,exports){
module.exports=require(7)
},{}],25:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = require('lodash._objecttypes');

/** Used for native method references */
var objectProto = Object.prototype;

/** Native method shortcuts */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A fallback implementation of `Object.keys` which produces an array of the
 * given object's own enumerable property names.
 *
 * @private
 * @type Function
 * @param {Object} object The object to inspect.
 * @returns {Array} Returns an array of property names.
 */
var shimKeys = function(object) {
  var index, iterable = object, result = [];
  if (!iterable) return result;
  if (!(objectTypes[typeof object])) return result;
    for (index in iterable) {
      if (hasOwnProperty.call(iterable, index)) {
        result.push(index);
      }
    }
  return result
};

module.exports = shimKeys;

},{"lodash._objecttypes":22}],26:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseIndexOf = require('lodash._baseindexof'),
    forOwn = require('lodash.forown'),
    isArray = require('lodash.isarray'),
    isString = require('lodash.isstring');

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeMax = Math.max;

/**
 * Checks if a given value is present in a collection using strict equality
 * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
 * offset from the end of the collection.
 *
 * @static
 * @memberOf _
 * @alias include
 * @category Collections
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {*} target The value to check for.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
 * @example
 *
 * _.contains([1, 2, 3], 1);
 * // => true
 *
 * _.contains([1, 2, 3], 1, 2);
 * // => false
 *
 * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
 * // => true
 *
 * _.contains('pebbles', 'eb');
 * // => true
 */
function contains(collection, target, fromIndex) {
  var index = -1,
      indexOf = baseIndexOf,
      length = collection ? collection.length : 0,
      result = false;

  fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
  if (isArray(collection)) {
    result = indexOf(collection, target, fromIndex) > -1;
  } else if (typeof length == 'number') {
    result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
  } else {
    forOwn(collection, function(value) {
      if (++index >= fromIndex) {
        return !(result = value === target);
      }
    });
  }
  return result;
}

module.exports = contains;

},{"lodash._baseindexof":27,"lodash.forown":28,"lodash.isarray":126,"lodash.isstring":135}],27:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * The base implementation of `_.indexOf` without support for binary searches
 * or `fromIndex` constraints.
 *
 * @private
 * @param {Array} array The array to search.
 * @param {*} value The value to search for.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {number} Returns the index of the matched value or `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  var index = (fromIndex || 0) - 1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

module.exports = baseIndexOf;

},{}],28:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    keys = require('lodash.keys'),
    objectTypes = require('lodash._objecttypes');

/**
 * Iterates over own enumerable properties of an object, executing the callback
 * for each property. The callback is bound to `thisArg` and invoked with three
 * arguments; (value, key, object). Callbacks may exit iteration early by
 * explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Objects
 * @param {Object} object The object to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
 *   console.log(key);
 * });
 * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
 */
var forOwn = function(collection, callback, thisArg) {
  var index, iterable = collection, result = iterable;
  if (!iterable) return result;
  if (!objectTypes[typeof iterable]) return result;
  callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
    var ownIndex = -1,
        ownProps = objectTypes[typeof iterable] && keys(iterable),
        length = ownProps ? ownProps.length : 0;

    while (++ownIndex < length) {
      index = ownProps[ownIndex];
      if (callback(iterable[index], index, collection) === false) return result;
    }
  return result
};

module.exports = forOwn;

},{"lodash._basecreatecallback":29,"lodash._objecttypes":46,"lodash.keys":47}],29:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"lodash._setbinddata":30,"lodash.bind":33,"lodash.identity":43,"lodash.support":44}],30:[function(require,module,exports){
module.exports=require(6)
},{"lodash._renative":31,"lodash.noop":32}],31:[function(require,module,exports){
module.exports=require(7)
},{}],32:[function(require,module,exports){
module.exports=require(8)
},{}],33:[function(require,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"lodash._createwrapper":34,"lodash._renative":41,"lodash._slice":42}],34:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"lodash._basebind":35,"lodash._basecreatewrapper":38,"lodash.isfunction":130}],35:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"lodash._basecreate":36,"lodash._setbinddata":30,"lodash.isobject":133}],36:[function(require,module,exports){
module.exports=require(12)
},{"lodash._renative":41,"lodash.isobject":133,"lodash.noop":37}],37:[function(require,module,exports){
module.exports=require(8)
},{}],38:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"lodash._basecreate":39,"lodash._setbinddata":30,"lodash._slice":42,"lodash.isobject":133}],39:[function(require,module,exports){
module.exports=require(12)
},{"lodash._renative":41,"lodash.isobject":133,"lodash.noop":40}],40:[function(require,module,exports){
module.exports=require(8)
},{}],41:[function(require,module,exports){
module.exports=require(7)
},{}],42:[function(require,module,exports){
module.exports=require(18)
},{}],43:[function(require,module,exports){
module.exports=require(19)
},{}],44:[function(require,module,exports){
module.exports=require(20)
},{"lodash._renative":45}],45:[function(require,module,exports){
module.exports=require(7)
},{}],46:[function(require,module,exports){
module.exports=require(22)
},{}],47:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"lodash._renative":48,"lodash._shimkeys":49,"lodash.isobject":133}],48:[function(require,module,exports){
module.exports=require(7)
},{}],49:[function(require,module,exports){
module.exports=require(25)
},{"lodash._objecttypes":46}],50:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var createCallback = require('lodash.createcallback'),
    forOwn = require('lodash.forown');

/**
 * Iterates over elements of a collection, returning the first element that
 * the callback returns truey for. The callback is bound to `thisArg` and
 * invoked with three arguments; (value, index|key, collection).
 *
 * If a property name is provided for `callback` the created "_.pluck" style
 * callback will return the property value of the given element.
 *
 * If an object is provided for `callback` the created "_.where" style callback
 * will return `true` for elements that have the properties of the given object,
 * else `false`.
 *
 * @static
 * @memberOf _
 * @alias detect, findWhere
 * @category Collections
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function|Object|string} [callback=identity] The function called
 *  per iteration. If a property name or object is provided it will be used
 *  to create a "_.pluck" or "_.where" style callback, respectively.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {*} Returns the found element, else `undefined`.
 * @example
 *
 * var characters = [
 *   { 'name': 'barney',  'age': 36, 'blocked': false },
 *   { 'name': 'fred',    'age': 40, 'blocked': true },
 *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
 * ];
 *
 * _.find(characters, function(chr) {
 *   return chr.age < 40;
 * });
 * // => { 'name': 'barney', 'age': 36, 'blocked': false }
 *
 * // using "_.where" callback shorthand
 * _.find(characters, { 'age': 1 });
 * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
 *
 * // using "_.pluck" callback shorthand
 * _.find(characters, 'blocked');
 * // => { 'name': 'fred', 'age': 40, 'blocked': true }
 */
function find(collection, callback, thisArg) {
  callback = createCallback(callback, thisArg, 3);

  var index = -1,
      length = collection ? collection.length : 0;

  if (typeof length == 'number') {
    while (++index < length) {
      var value = collection[index];
      if (callback(value, index, collection)) {
        return value;
      }
    }
  } else {
    var result;
    forOwn(collection, function(value, index, collection) {
      if (callback(value, index, collection)) {
        result = value;
        return false;
      }
    });
    return result;
  }
}

module.exports = find;

},{"lodash.createcallback":51,"lodash.forown":81}],51:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    baseIsEqual = require('lodash._baseisequal'),
    isObject = require('lodash.isobject'),
    keys = require('lodash.keys');

/**
 * Produces a callback bound to an optional `thisArg`. If `func` is a property
 * name the created callback will return the property value for a given element.
 * If `func` is an object the created callback will return `true` for elements
 * that contain the equivalent object properties, otherwise it will return `false`.
 *
 * @static
 * @memberOf _
 * @category Functions
 * @param {*} [func=identity] The value to convert to a callback.
 * @param {*} [thisArg] The `this` binding of the created callback.
 * @param {number} [argCount] The number of arguments the callback accepts.
 * @returns {Function} Returns a callback function.
 * @example
 *
 * var characters = [
 *   { 'name': 'barney', 'age': 36 },
 *   { 'name': 'fred',   'age': 40 }
 * ];
 *
 * // wrap to create custom callback shorthands
 * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
 *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
 *   return !match ? func(callback, thisArg) : function(object) {
 *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
 *   };
 * });
 *
 * _.filter(characters, 'age__gt38');
 * // => [{ 'name': 'fred', 'age': 40 }]
 */
function createCallback(func, thisArg, argCount) {
  var type = typeof func;
  if (func == null || type == 'function') {
    return baseCreateCallback(func, thisArg, argCount);
  }
  // handle "_.pluck" style callback shorthands
  if (type != 'object') {
    return function(object) {
      return object[func];
    };
  }
  var props = keys(func),
      key = props[0],
      a = func[key];

  // handle "_.where" style callback shorthands
  if (props.length == 1 && a === a && !isObject(a)) {
    // fast path the common case of providing an object with a single
    // property containing a primitive value
    return function(object) {
      var b = object[key];
      return a === b && (a !== 0 || (1 / a == 1 / b));
    };
  }
  return function(object) {
    var length = props.length,
        result = false;

    while (length--) {
      if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
        break;
      }
    }
    return result;
  };
}

module.exports = createCallback;

},{"lodash._basecreatecallback":52,"lodash._baseisequal":69,"lodash.isobject":133,"lodash.keys":77}],52:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"lodash._setbinddata":53,"lodash.bind":56,"lodash.identity":66,"lodash.support":67}],53:[function(require,module,exports){
module.exports=require(6)
},{"lodash._renative":54,"lodash.noop":55}],54:[function(require,module,exports){
module.exports=require(7)
},{}],55:[function(require,module,exports){
module.exports=require(8)
},{}],56:[function(require,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"lodash._createwrapper":57,"lodash._renative":64,"lodash._slice":65}],57:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"lodash._basebind":58,"lodash._basecreatewrapper":61,"lodash.isfunction":130}],58:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"lodash._basecreate":59,"lodash._setbinddata":53,"lodash.isobject":133}],59:[function(require,module,exports){
module.exports=require(12)
},{"lodash._renative":64,"lodash.isobject":133,"lodash.noop":60}],60:[function(require,module,exports){
module.exports=require(8)
},{}],61:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"lodash._basecreate":62,"lodash._setbinddata":53,"lodash._slice":65,"lodash.isobject":133}],62:[function(require,module,exports){
module.exports=require(12)
},{"lodash._renative":64,"lodash.isobject":133,"lodash.noop":63}],63:[function(require,module,exports){
module.exports=require(8)
},{}],64:[function(require,module,exports){
module.exports=require(7)
},{}],65:[function(require,module,exports){
module.exports=require(18)
},{}],66:[function(require,module,exports){
module.exports=require(19)
},{}],67:[function(require,module,exports){
module.exports=require(20)
},{"lodash._renative":68}],68:[function(require,module,exports){
module.exports=require(7)
},{}],69:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var forIn = require('lodash.forin'),
    getArray = require('lodash._getarray'),
    isFunction = require('lodash.isfunction'),
    objectTypes = require('lodash._objecttypes'),
    releaseArray = require('lodash._releasearray');

/** `Object#toString` result shortcuts */
var argsClass = '[object Arguments]',
    arrayClass = '[object Array]',
    boolClass = '[object Boolean]',
    dateClass = '[object Date]',
    numberClass = '[object Number]',
    objectClass = '[object Object]',
    regexpClass = '[object RegExp]',
    stringClass = '[object String]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/** Native method shortcuts */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.isEqual`, without support for `thisArg` binding,
 * that allows partial "_.where" style comparisons.
 *
 * @private
 * @param {*} a The value to compare.
 * @param {*} b The other value to compare.
 * @param {Function} [callback] The function to customize comparing values.
 * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
 * @param {Array} [stackA=[]] Tracks traversed `a` objects.
 * @param {Array} [stackB=[]] Tracks traversed `b` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
  // used to indicate that when comparing objects, `a` has at least the properties of `b`
  if (callback) {
    var result = callback(a, b);
    if (typeof result != 'undefined') {
      return !!result;
    }
  }
  // exit early for identical values
  if (a === b) {
    // treat `+0` vs. `-0` as not equal
    return a !== 0 || (1 / a == 1 / b);
  }
  var type = typeof a,
      otherType = typeof b;

  // exit early for unlike primitive values
  if (a === a &&
      !(a && objectTypes[type]) &&
      !(b && objectTypes[otherType])) {
    return false;
  }
  // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
  // http://es5.github.io/#x15.3.4.4
  if (a == null || b == null) {
    return a === b;
  }
  // compare [[Class]] names
  var className = toString.call(a),
      otherClass = toString.call(b);

  if (className == argsClass) {
    className = objectClass;
  }
  if (otherClass == argsClass) {
    otherClass = objectClass;
  }
  if (className != otherClass) {
    return false;
  }
  switch (className) {
    case boolClass:
    case dateClass:
      // coerce dates and booleans to numbers, dates to milliseconds and booleans
      // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
      return +a == +b;

    case numberClass:
      // treat `NaN` vs. `NaN` as equal
      return (a != +a)
        ? b != +b
        // but treat `+0` vs. `-0` as not equal
        : (a == 0 ? (1 / a == 1 / b) : a == +b);

    case regexpClass:
    case stringClass:
      // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
      // treat string primitives and their corresponding object instances as equal
      return a == String(b);
  }
  var isArr = className == arrayClass;
  if (!isArr) {
    // unwrap any `lodash` wrapped values
    var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
        bWrapped = hasOwnProperty.call(b, '__wrapped__');

    if (aWrapped || bWrapped) {
      return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
    }
    // exit for functions and DOM nodes
    if (className != objectClass) {
      return false;
    }
    // in older versions of Opera, `arguments` objects have `Array` constructors
    var ctorA = a.constructor,
        ctorB = b.constructor;

    // non `Object` object instances with different constructors are not equal
    if (ctorA != ctorB &&
          !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
          ('constructor' in a && 'constructor' in b)
        ) {
      return false;
    }
  }
  // assume cyclic structures are equal
  // the algorithm for detecting cyclic structures is adapted from ES 5.1
  // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
  var initedStack = !stackA;
  stackA || (stackA = getArray());
  stackB || (stackB = getArray());

  var length = stackA.length;
  while (length--) {
    if (stackA[length] == a) {
      return stackB[length] == b;
    }
  }
  var size = 0;
  result = true;

  // add `a` and `b` to the stack of traversed objects
  stackA.push(a);
  stackB.push(b);

  // recursively compare objects and arrays (susceptible to call stack limits)
  if (isArr) {
    length = a.length;
    size = b.length;

    // compare lengths to determine if a deep comparison is necessary
    result = size == a.length;
    if (!result && !isWhere) {
      return result;
    }
    // deep compare the contents, ignoring non-numeric properties
    while (size--) {
      var index = length,
          value = b[size];

      if (isWhere) {
        while (index--) {
          if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
            break;
          }
        }
      } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
        break;
      }
    }
    return result;
  }
  // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
  // which, in this case, is more costly
  forIn(b, function(value, key, b) {
    if (hasOwnProperty.call(b, key)) {
      // count the number of properties.
      size++;
      // deep compare each property value.
      return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
    }
  });

  if (result && !isWhere) {
    // ensure both objects have the same number of properties
    forIn(a, function(value, key, a) {
      if (hasOwnProperty.call(a, key)) {
        // `size` will be `-1` if `a` has more properties than `b`
        return (result = --size > -1);
      }
    });
  }
  if (initedStack) {
    releaseArray(stackA);
    releaseArray(stackB);
  }
  return result;
}

module.exports = baseIsEqual;

},{"lodash._getarray":70,"lodash._objecttypes":72,"lodash._releasearray":73,"lodash.forin":76,"lodash.isfunction":130}],70:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var arrayPool = require('lodash._arraypool');

/**
 * Gets an array from the array pool or creates a new one if the pool is empty.
 *
 * @private
 * @returns {Array} The array from the pool.
 */
function getArray() {
  return arrayPool.pop() || [];
}

module.exports = getArray;

},{"lodash._arraypool":71}],71:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to pool arrays and objects used internally */
var arrayPool = [];

module.exports = arrayPool;

},{}],72:[function(require,module,exports){
module.exports=require(22)
},{}],73:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var arrayPool = require('lodash._arraypool'),
    maxPoolSize = require('lodash._maxpoolsize');

/**
 * Releases the given array back to the array pool.
 *
 * @private
 * @param {Array} [array] The array to release.
 */
function releaseArray(array) {
  array.length = 0;
  if (arrayPool.length < maxPoolSize) {
    arrayPool.push(array);
  }
}

module.exports = releaseArray;

},{"lodash._arraypool":74,"lodash._maxpoolsize":75}],74:[function(require,module,exports){
module.exports=require(71)
},{}],75:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used as the max size of the `arrayPool` and `objectPool` */
var maxPoolSize = 40;

module.exports = maxPoolSize;

},{}],76:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    objectTypes = require('lodash._objecttypes');

/**
 * Iterates over own and inherited enumerable properties of an object,
 * executing the callback for each property. The callback is bound to `thisArg`
 * and invoked with three arguments; (value, key, object). Callbacks may exit
 * iteration early by explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Objects
 * @param {Object} object The object to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Object} Returns `object`.
 * @example
 *
 * function Shape() {
 *   this.x = 0;
 *   this.y = 0;
 * }
 *
 * Shape.prototype.move = function(x, y) {
 *   this.x += x;
 *   this.y += y;
 * };
 *
 * _.forIn(new Shape, function(value, key) {
 *   console.log(key);
 * });
 * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
 */
var forIn = function(collection, callback, thisArg) {
  var index, iterable = collection, result = iterable;
  if (!iterable) return result;
  if (!objectTypes[typeof iterable]) return result;
  callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
    for (index in iterable) {
      if (callback(iterable[index], index, collection) === false) return result;
    }
  return result
};

module.exports = forIn;

},{"lodash._basecreatecallback":52,"lodash._objecttypes":72}],77:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"lodash._renative":78,"lodash._shimkeys":79,"lodash.isobject":133}],78:[function(require,module,exports){
module.exports=require(7)
},{}],79:[function(require,module,exports){
module.exports=require(25)
},{"lodash._objecttypes":80}],80:[function(require,module,exports){
module.exports=require(22)
},{}],81:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"lodash._basecreatecallback":82,"lodash._objecttypes":99,"lodash.keys":100}],82:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"lodash._setbinddata":83,"lodash.bind":86,"lodash.identity":96,"lodash.support":97}],83:[function(require,module,exports){
module.exports=require(6)
},{"lodash._renative":84,"lodash.noop":85}],84:[function(require,module,exports){
module.exports=require(7)
},{}],85:[function(require,module,exports){
module.exports=require(8)
},{}],86:[function(require,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"lodash._createwrapper":87,"lodash._renative":94,"lodash._slice":95}],87:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"lodash._basebind":88,"lodash._basecreatewrapper":91,"lodash.isfunction":130}],88:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"lodash._basecreate":89,"lodash._setbinddata":83,"lodash.isobject":133}],89:[function(require,module,exports){
module.exports=require(12)
},{"lodash._renative":94,"lodash.isobject":133,"lodash.noop":90}],90:[function(require,module,exports){
module.exports=require(8)
},{}],91:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"lodash._basecreate":92,"lodash._setbinddata":83,"lodash._slice":95,"lodash.isobject":133}],92:[function(require,module,exports){
module.exports=require(12)
},{"lodash._renative":94,"lodash.isobject":133,"lodash.noop":93}],93:[function(require,module,exports){
module.exports=require(8)
},{}],94:[function(require,module,exports){
module.exports=require(7)
},{}],95:[function(require,module,exports){
module.exports=require(18)
},{}],96:[function(require,module,exports){
module.exports=require(19)
},{}],97:[function(require,module,exports){
module.exports=require(20)
},{"lodash._renative":98}],98:[function(require,module,exports){
module.exports=require(7)
},{}],99:[function(require,module,exports){
module.exports=require(22)
},{}],100:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"lodash._renative":101,"lodash._shimkeys":102,"lodash.isobject":133}],101:[function(require,module,exports){
module.exports=require(7)
},{}],102:[function(require,module,exports){
module.exports=require(25)
},{"lodash._objecttypes":99}],103:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var baseCreateCallback = require('lodash._basecreatecallback'),
    forOwn = require('lodash.forown');

/**
 * Iterates over elements of a collection, executing the callback for each
 * element. The callback is bound to `thisArg` and invoked with three arguments;
 * (value, index|key, collection). Callbacks may exit iteration early by
 * explicitly returning `false`.
 *
 * Note: As with other "Collections" methods, objects with a `length` property
 * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
 * may be used for object iteration.
 *
 * @static
 * @memberOf _
 * @alias each
 * @category Collections
 * @param {Array|Object|string} collection The collection to iterate over.
 * @param {Function} [callback=identity] The function called per iteration.
 * @param {*} [thisArg] The `this` binding of `callback`.
 * @returns {Array|Object|string} Returns `collection`.
 * @example
 *
 * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
 * // => logs each number and returns '1,2,3'
 *
 * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
 * // => logs each number and returns the object (property order is not guaranteed across environments)
 */
function forEach(collection, callback, thisArg) {
  var index = -1,
      length = collection ? collection.length : 0;

  callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
  if (typeof length == 'number') {
    while (++index < length) {
      if (callback(collection[index], index, collection) === false) {
        break;
      }
    }
  } else {
    forOwn(collection, callback);
  }
  return collection;
}

module.exports = forEach;

},{"lodash._basecreatecallback":104,"lodash.forown":121}],104:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"lodash._setbinddata":105,"lodash.bind":108,"lodash.identity":118,"lodash.support":119}],105:[function(require,module,exports){
module.exports=require(6)
},{"lodash._renative":106,"lodash.noop":107}],106:[function(require,module,exports){
module.exports=require(7)
},{}],107:[function(require,module,exports){
module.exports=require(8)
},{}],108:[function(require,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"lodash._createwrapper":109,"lodash._renative":116,"lodash._slice":117}],109:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"lodash._basebind":110,"lodash._basecreatewrapper":113,"lodash.isfunction":130}],110:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"lodash._basecreate":111,"lodash._setbinddata":105,"lodash.isobject":133}],111:[function(require,module,exports){
module.exports=require(12)
},{"lodash._renative":116,"lodash.isobject":133,"lodash.noop":112}],112:[function(require,module,exports){
module.exports=require(8)
},{}],113:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"lodash._basecreate":114,"lodash._setbinddata":105,"lodash._slice":117,"lodash.isobject":133}],114:[function(require,module,exports){
module.exports=require(12)
},{"lodash._renative":116,"lodash.isobject":133,"lodash.noop":115}],115:[function(require,module,exports){
module.exports=require(8)
},{}],116:[function(require,module,exports){
module.exports=require(7)
},{}],117:[function(require,module,exports){
module.exports=require(18)
},{}],118:[function(require,module,exports){
module.exports=require(19)
},{}],119:[function(require,module,exports){
module.exports=require(20)
},{"lodash._renative":120}],120:[function(require,module,exports){
module.exports=require(7)
},{}],121:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"lodash._basecreatecallback":104,"lodash._objecttypes":122,"lodash.keys":123}],122:[function(require,module,exports){
module.exports=require(22)
},{}],123:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"lodash._renative":124,"lodash._shimkeys":125,"lodash.isobject":133}],124:[function(require,module,exports){
module.exports=require(7)
},{}],125:[function(require,module,exports){
module.exports=require(25)
},{"lodash._objecttypes":122}],126:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var reNative = require('lodash._renative');

/** `Object#toString` result shortcuts */
var arrayClass = '[object Array]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeIsArray = reNative.test(nativeIsArray = Array.isArray) && nativeIsArray;

/**
 * Checks if `value` is an array.
 *
 * @static
 * @memberOf _
 * @type Function
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
 * @example
 *
 * (function() { return _.isArray(arguments); })();
 * // => false
 *
 * _.isArray([1, 2, 3]);
 * // => true
 */
var isArray = nativeIsArray || function(value) {
  return value && typeof value == 'object' && typeof value.length == 'number' &&
    toString.call(value) == arrayClass || false;
};

module.exports = isArray;

},{"lodash._renative":127}],127:[function(require,module,exports){
module.exports=require(7)
},{}],128:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** `Object#toString` result shortcuts */
var boolClass = '[object Boolean]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/**
 * Checks if `value` is a boolean value.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
 * @example
 *
 * _.isBoolean(null);
 * // => false
 */
function isBoolean(value) {
  return value === true || value === false ||
    value && typeof value == 'object' && toString.call(value) == boolClass || false;
}

module.exports = isBoolean;

},{}],129:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** `Object#toString` result shortcuts */
var dateClass = '[object Date]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/**
 * Checks if `value` is a date.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
 * @example
 *
 * _.isDate(new Date);
 * // => true
 */
function isDate(value) {
  return value && typeof value == 'object' && toString.call(value) == dateClass || false;
}

module.exports = isDate;

},{}],130:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Checks if `value` is a function.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 */
function isFunction(value) {
  return typeof value == 'function';
}

module.exports = isFunction;

},{}],131:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Checks if `value` is `null`.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
 * @example
 *
 * _.isNull(null);
 * // => true
 *
 * _.isNull(undefined);
 * // => false
 */
function isNull(value) {
  return value === null;
}

module.exports = isNull;

},{}],132:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** `Object#toString` result shortcuts */
var numberClass = '[object Number]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/**
 * Checks if `value` is a number.
 *
 * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
 * @example
 *
 * _.isNumber(8.4 * 5);
 * // => true
 */
function isNumber(value) {
  return typeof value == 'number' ||
    value && typeof value == 'object' && toString.call(value) == numberClass || false;
}

module.exports = isNumber;

},{}],133:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
var objectTypes = require('lodash._objecttypes');

/**
 * Checks if `value` is the language type of Object.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // check if the value is the ECMAScript language type of Object
  // http://es5.github.io/#x8
  // and avoid a V8 bug
  // http://code.google.com/p/v8/issues/detail?id=2291
  return !!(value && objectTypes[typeof value]);
}

module.exports = isObject;

},{"lodash._objecttypes":134}],134:[function(require,module,exports){
module.exports=require(22)
},{}],135:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** `Object#toString` result shortcuts */
var stringClass = '[object String]';

/** Used for native method references */
var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/**
 * Checks if `value` is a string.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
 * @example
 *
 * _.isString('fred');
 * // => true
 */
function isString(value) {
  return typeof value == 'string' ||
    value && typeof value == 'object' && toString.call(value) == stringClass || false;
}

module.exports = isString;

},{}],136:[function(require,module,exports){
/**
 * Lo-Dash 2.3.0 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="npm" -o ./npm/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Checks if `value` is `undefined`.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
 * @example
 *
 * _.isUndefined(void 0);
 * // => true
 */
function isUndefined(value) {
  return typeof value == 'undefined';
}

module.exports = isUndefined;

},{}],137:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  this.text = this.xhr.responseText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var path = req.path;

  var msg = 'cannot ' + method + ' ' + path + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.path = path;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var res = new Response(self);
    if ('HEAD' == method) res.text = null;
    self.callback(null, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":138,"reduce":139}],138:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = callbacks.indexOf(fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],139:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],140:[function(require,module,exports){
module.exports={
  "name": "carvoyant",
  "description": "The Carvoyant API client library.",
  "version": "0.0.3",
  "author": {
    "name": "Jeremy Whitlock",
    "email": "jwhitlock@apache.org"
  },
  "bugs": "https://github.com/whitlockjc/carvoyant/issues",
  "homepage": "https://github.com/whitlockjc/carvoyant",
  "licenses": [
    {
      "type": "Apache-2.0",
      "url": "http://www.apache.org/licenses/LICENSE-2.0"
    }
  ],
  "repository": {
    "type": "git",
    "url": "git://github.com/whitlockjc/carvoyant.git"
  },
  "scripts": {
    "test": "grunt nodeunit karma"
  },
  "keywords": [
    "carvoyant"
  ],
  "dependencies": {
    "lodash.assign": "~2.3.0",
    "lodash.contains": "~2.3.0",
    "lodash.find": "~2.3.0",
    "lodash.foreach": "~2.3.0",
    "lodash.isboolean": "~2.3.0",
    "lodash.isdate": "~2.3.0",
    "lodash.isfunction": "~2.3.0",
    "lodash.isnull": "~2.3.0",
    "lodash.isnumber": "~2.3.0",
    "lodash.isobject": "~2.3.0",
    "lodash.isstring": "~2.3.0",
    "lodash.isundefined": "~2.3.0",
    "superagent": "~0.16.0"
  },
  "devDependencies": {
    "browserify": "~2.35.4",
    "grunt": "~0.4.1",
    "grunt-browserify": "~1.2.11",
    "grunt-contrib-clean": "~0.5.0",
    "grunt-contrib-jshint": "~0.6.4",
    "grunt-contrib-nodeunit": "~0.2.0",
    "grunt-contrib-uglify": "~0.2.7",
    "grunt-jsdoc": "~0.4.2",
    "grunt-karma": "~0.6.2",
    "grunt-release": "~0.6.0",
    "karma": "~0.10.4",
    "karma-chrome-launcher": "~0.1.0",
    "karma-coffee-preprocessor": "~0.1.0",
    "karma-firefox-launcher": "~0.1.0",
    "karma-html2js-preprocessor": "~0.1.0",
    "karma-jasmine": "~0.1.3",
    "karma-nodeunit": "~0.1.1",
    "karma-phantomjs-launcher": "~0.1.0",
    "karma-requirejs": "~0.1.0",
    "karma-script-launcher": "~0.1.0",
    "lodash.isarray": "~2.3.0",
    "lodash.map": "~2.3.0"
  },
  "main": "lib/carvoyant",
  "engines": {
    "node": ">= 0.8.0"
  }
}

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvandoaXRsb2NrL3dvcmtzcGFjZXMvcGVyc29uYWwvY2Fydm95YW50L2xpYi9jYXJ2b3lhbnQuanMiLCIvVXNlcnMvandoaXRsb2NrL3dvcmtzcGFjZXMvcGVyc29uYWwvY2Fydm95YW50L2xpYi9jbGllbnQuanMiLCIvVXNlcnMvandoaXRsb2NrL3dvcmtzcGFjZXMvcGVyc29uYWwvY2Fydm95YW50L2xpYi91dGlscy5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5hc3NpZ24vaW5kZXguanMiLCIvVXNlcnMvandoaXRsb2NrL3dvcmtzcGFjZXMvcGVyc29uYWwvY2Fydm95YW50L25vZGVfbW9kdWxlcy9sb2Rhc2guYXNzaWduL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5hc3NpZ24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guX3NldGJpbmRkYXRhL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmFzc2lnbi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5fc2V0YmluZGRhdGEvbm9kZV9tb2R1bGVzL2xvZGFzaC5fcmVuYXRpdmUvaW5kZXguanMiLCIvVXNlcnMvandoaXRsb2NrL3dvcmtzcGFjZXMvcGVyc29uYWwvY2Fydm95YW50L25vZGVfbW9kdWxlcy9sb2Rhc2guYXNzaWduL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLl9zZXRiaW5kZGF0YS9ub2RlX21vZHVsZXMvbG9kYXNoLm5vb3AvaW5kZXguanMiLCIvVXNlcnMvandoaXRsb2NrL3dvcmtzcGFjZXMvcGVyc29uYWwvY2Fydm95YW50L25vZGVfbW9kdWxlcy9sb2Rhc2guYXNzaWduL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvaW5kZXguanMiLCIvVXNlcnMvandoaXRsb2NrL3dvcmtzcGFjZXMvcGVyc29uYWwvY2Fydm95YW50L25vZGVfbW9kdWxlcy9sb2Rhc2guYXNzaWduL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fY3JlYXRld3JhcHBlci9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5hc3NpZ24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guYmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLl9jcmVhdGV3cmFwcGVyL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2ViaW5kL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmFzc2lnbi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5iaW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guX2NyZWF0ZXdyYXBwZXIvbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZS9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5hc3NpZ24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guYmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLl9jcmVhdGV3cmFwcGVyL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGV3cmFwcGVyL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmFzc2lnbi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5iaW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guX3NsaWNlL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmFzc2lnbi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5pZGVudGl0eS9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5hc3NpZ24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guc3VwcG9ydC9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5hc3NpZ24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fb2JqZWN0dHlwZXMvaW5kZXguanMiLCIvVXNlcnMvandoaXRsb2NrL3dvcmtzcGFjZXMvcGVyc29uYWwvY2Fydm95YW50L25vZGVfbW9kdWxlcy9sb2Rhc2guYXNzaWduL25vZGVfbW9kdWxlcy9sb2Rhc2gua2V5cy9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5hc3NpZ24vbm9kZV9tb2R1bGVzL2xvZGFzaC5rZXlzL25vZGVfbW9kdWxlcy9sb2Rhc2guX3NoaW1rZXlzL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmNvbnRhaW5zL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmNvbnRhaW5zL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VpbmRleG9mL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmNvbnRhaW5zL25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmNvbnRhaW5zL25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5jb250YWlucy9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5iaW5kL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmNvbnRhaW5zL25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fY3JlYXRld3JhcHBlci9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5jb250YWlucy9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcm93bi9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5iaW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guX2NyZWF0ZXdyYXBwZXIvbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWJpbmQvaW5kZXguanMiLCIvVXNlcnMvandoaXRsb2NrL3dvcmtzcGFjZXMvcGVyc29uYWwvY2Fydm95YW50L25vZGVfbW9kdWxlcy9sb2Rhc2guY29udGFpbnMvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guYmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLl9jcmVhdGV3cmFwcGVyL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGV3cmFwcGVyL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmNvbnRhaW5zL25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2gua2V5cy9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5maW5kL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmZpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5jcmVhdGVjYWxsYmFjay9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5maW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmZpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5jcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5iaW5kL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmZpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5jcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5iaW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guX2NyZWF0ZXdyYXBwZXIvaW5kZXguanMiLCIvVXNlcnMvandoaXRsb2NrL3dvcmtzcGFjZXMvcGVyc29uYWwvY2Fydm95YW50L25vZGVfbW9kdWxlcy9sb2Rhc2guZmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLmNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fY3JlYXRld3JhcHBlci9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlYmluZC9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5maW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guYmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLl9jcmVhdGV3cmFwcGVyL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGV3cmFwcGVyL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmZpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5jcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlaXNlcXVhbC9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5maW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWlzZXF1YWwvbm9kZV9tb2R1bGVzL2xvZGFzaC5fZ2V0YXJyYXkvaW5kZXguanMiLCIvVXNlcnMvandoaXRsb2NrL3dvcmtzcGFjZXMvcGVyc29uYWwvY2Fydm95YW50L25vZGVfbW9kdWxlcy9sb2Rhc2guZmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLmNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2Vpc2VxdWFsL25vZGVfbW9kdWxlcy9sb2Rhc2guX2dldGFycmF5L25vZGVfbW9kdWxlcy9sb2Rhc2guX2FycmF5cG9vbC9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5maW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guY3JlYXRlY2FsbGJhY2svbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWlzZXF1YWwvbm9kZV9tb2R1bGVzL2xvZGFzaC5fcmVsZWFzZWFycmF5L2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmZpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5jcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlaXNlcXVhbC9ub2RlX21vZHVsZXMvbG9kYXNoLl9yZWxlYXNlYXJyYXkvbm9kZV9tb2R1bGVzL2xvZGFzaC5fbWF4cG9vbHNpemUvaW5kZXguanMiLCIvVXNlcnMvandoaXRsb2NrL3dvcmtzcGFjZXMvcGVyc29uYWwvY2Fydm95YW50L25vZGVfbW9kdWxlcy9sb2Rhc2guZmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLmNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2Vpc2VxdWFsL25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yaW4vaW5kZXguanMiLCIvVXNlcnMvandoaXRsb2NrL3dvcmtzcGFjZXMvcGVyc29uYWwvY2Fydm95YW50L25vZGVfbW9kdWxlcy9sb2Rhc2guZmluZC9ub2RlX21vZHVsZXMvbG9kYXNoLmNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2gua2V5cy9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5maW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmZpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmZpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guYmluZC9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5maW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fY3JlYXRld3JhcHBlci9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5maW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fY3JlYXRld3JhcHBlci9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlYmluZC9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5maW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fY3JlYXRld3JhcHBlci9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRld3JhcHBlci9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5maW5kL25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL25vZGVfbW9kdWxlcy9sb2Rhc2gua2V5cy9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3JlYWNoL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcmVhY2gvbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcmVhY2gvbm9kZV9tb2R1bGVzL2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrL25vZGVfbW9kdWxlcy9sb2Rhc2guYmluZC9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3JlYWNoL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fY3JlYXRld3JhcHBlci9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3JlYWNoL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fY3JlYXRld3JhcHBlci9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlYmluZC9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3JlYWNoL25vZGVfbW9kdWxlcy9sb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjay9ub2RlX21vZHVsZXMvbG9kYXNoLmJpbmQvbm9kZV9tb2R1bGVzL2xvZGFzaC5fY3JlYXRld3JhcHBlci9ub2RlX21vZHVsZXMvbG9kYXNoLl9iYXNlY3JlYXRld3JhcHBlci9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3JlYWNoL25vZGVfbW9kdWxlcy9sb2Rhc2guZm9yb3duL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmZvcmVhY2gvbm9kZV9tb2R1bGVzL2xvZGFzaC5mb3Jvd24vbm9kZV9tb2R1bGVzL2xvZGFzaC5rZXlzL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmlzYXJyYXkvaW5kZXguanMiLCIvVXNlcnMvandoaXRsb2NrL3dvcmtzcGFjZXMvcGVyc29uYWwvY2Fydm95YW50L25vZGVfbW9kdWxlcy9sb2Rhc2guaXNib29sZWFuL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmlzZGF0ZS9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5pc2Z1bmN0aW9uL2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvbG9kYXNoLmlzbnVsbC9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5pc251bWJlci9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5pc29iamVjdC9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5pc3N0cmluZy9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL2xvZGFzaC5pc3VuZGVmaW5lZC9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbGliL2NsaWVudC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvbm9kZV9tb2R1bGVzL3N1cGVyYWdlbnQvbm9kZV9tb2R1bGVzL2VtaXR0ZXItY29tcG9uZW50L2luZGV4LmpzIiwiL1VzZXJzL2p3aGl0bG9jay93b3Jrc3BhY2VzL3BlcnNvbmFsL2NhcnZveWFudC9ub2RlX21vZHVsZXMvc3VwZXJhZ2VudC9ub2RlX21vZHVsZXMvcmVkdWNlLWNvbXBvbmVudC9pbmRleC5qcyIsIi9Vc2Vycy9qd2hpdGxvY2svd29ya3NwYWNlcy9wZXJzb25hbC9jYXJ2b3lhbnQvcGFja2FnZS5qc29uIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzV2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTs7Ozs7Ozs7QUNBQTs7QUNBQTs7QUNBQTs7Ozs7O0FDQUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0FBOzs7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBOzs7Ozs7OztBQ0FBOztBQ0FBOztBQ0FBOzs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7Ozs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBOzs7Ozs7OztBQ0FBOztBQ0FBOzs7Ozs7OztBQ0FBOztBQ0FBOztBQ0FBOzs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDQUE7Ozs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBOzs7Ozs7OztBQ0FBOztBQ0FBOztBQ0FBOzs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7Ozs7OztBQ0FBOzs7O0FDQUE7Ozs7OztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsK0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFtDYXJ2b3lhbnRdKGh0dHA6Ly93d3cuY2Fydm95YW50LmNvbS8pIEFQSSBDbGllbnQgYXMgZGVmaW5lZCBpbiB0aGVcbiAqIFtDYXJ2b3llbnQgQVBJIFJlZmVyZW5jZV0oaHR0cDovL2NvbmZsdWVuY2UuY2Fydm95YW50LmNvbS9kaXNwbGF5L1BVQkRFVi9DYXJ2b3lhbnQrQVBJKS5cbiAqXG4gKiBAbW9kdWxlIGNhcnZveWFudFxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGNsaWVudCA9IHJlcXVpcmUoJy4vY2xpZW50JylcbiAgLCBwa2cgPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIENsaWVudDogY2xpZW50LkNsaWVudCxcbiAgY3JlYXRlQ2xpZW50OiBjbGllbnQuY3JlYXRlQ2xpZW50LFxuICBVdGlsaXRpZXM6IHJlcXVpcmUoJy4vdXRpbHMnKSxcbiAgVkVSU0lPTjogcGtnLnZlcnNpb25cbn07XG4iLCIvKiogQG1vZHVsZSBjYXJ2b3lhbnQvY2xpZW50ICovXG5cbid1c2Ugc3RyaWN0JztcblxuLy8gTW9kdWxlIFJlcXVpcmVtZW50c1xudmFyIF8gPSB7XG4gICAgY29udGFpbnM6IHJlcXVpcmUoJ2xvZGFzaC5jb250YWlucycpLFxuICAgIGVhY2g6IHJlcXVpcmUoJ2xvZGFzaC5mb3JlYWNoJyksXG4gICAgZXh0ZW5kOiByZXF1aXJlKCdsb2Rhc2guYXNzaWduJyksXG4gICAgaXNCb29sZWFuOiByZXF1aXJlKCdsb2Rhc2guaXNib29sZWFuJyksXG4gICAgaXNEYXRlOiByZXF1aXJlKCdsb2Rhc2guaXNkYXRlJyksXG4gICAgaXNGdW5jdGlvbjogcmVxdWlyZSgnbG9kYXNoLmlzZnVuY3Rpb24nKSxcbiAgICBpc051bGw6IHJlcXVpcmUoJ2xvZGFzaC5pc251bGwnKSxcbiAgICBpc051bWJlcjogcmVxdWlyZSgnbG9kYXNoLmlzbnVtYmVyJyksXG4gICAgaXNVbmRlZmluZWQ6IHJlcXVpcmUoJ2xvZGFzaC5pc3VuZGVmaW5lZCcpXG4gIH1cbiAgLCByZXF1ZXN0ID0gcmVxdWlyZSgnc3VwZXJhZ2VudCcpXG4gICwgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbi8qKlxuICogVGhlIENhcnZveWFudCBBUEkgVVJMLlxuICpcbiAqIEBjb25zdGFudFxuICogQHR5cGUge3N0cmluZ31cbiAqIEBkZWZhdWx0XG4gKi9cbnZhciBERUZBVUxUX0FQSV9VUkwgPSAnaHR0cHM6Ly9kYXNoLmNhcnZveWFudC5jb20vYXBpJztcblxuLyoqXG4gKiBDYWxsYmFjayBmb3IgaGFuZGxpbmcgQVBJIHJlc3BvbnNlcy5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzIC0gVGhlIFtTdXBlcmFnZW50XShodHRwOi8vdmlzaW9ubWVkaWEuZ2l0aHViLmlvL3N1cGVyYWdlbnQvI3Jlc3BvbnNlLXByb3BlcnRpZXMpIHJlc3BvbnNlIG9iamVjdFxuICpcbiAqIEBjYWxsYmFjayBtb2R1bGU6Y2Fydm95YW50L2NsaWVudH5yZXNwb25zZUNhbGxiYWNrXG4gKi9cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgQ2Fydm95YW50IENsaWVudC5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyAtIFRoZSBjbGllbnQgb3B0aW9uc1xuICpcbiAqIEBjb25zdHJ1Y3RvciBDbGllbnRcbiAqL1xuZnVuY3Rpb24gQ2xpZW50IChvcHRpb25zKSB7XG5cbiAgdmFyIHJlcXVpcmVkT3B0aW9ucyA9IFtcbiAgICAnYXBpS2V5JyxcbiAgICAnc2VjdXJpdHlUb2tlbidcbiAgXTtcblxuICAvLyBEZWZhdWx0IG9wdGlvbnMgdG8gYW4gZW1wdHkgb2JqZWN0XG4gIGlmICghb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7fTtcbiAgfVxuXG4gIC8vIFNldCBkZWZhdWx0c1xuICBpZiAoIW9wdGlvbnMuYXBpVXJsKSB7XG4gICAgb3B0aW9ucy5hcGlVcmwgPSBERUZBVUxUX0FQSV9VUkw7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSB0aGUgcmVxdWlyZWQgZmllbGRzXG4gIF8uZWFjaChyZXF1aXJlZE9wdGlvbnMsIGZ1bmN0aW9uIChyZXF1aXJlZE9wdGlvbikge1xuXG4gICAgaWYgKCFvcHRpb25zW3JlcXVpcmVkT3B0aW9uXSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdvcHRpb25zLicgKyByZXF1aXJlZE9wdGlvbiArICcgaXMgYSByZXF1aXJlZCBDbGllbnQgb3B0aW9uLicpO1xuICAgIH1cblxuICB9KTtcblxuICAvLyBBZGQgdGhlIG9wdGlvbnMgdG8gdGhlIENsaWVudFxuICBfLmV4dGVuZCh0aGlzLCBvcHRpb25zKTtcblxufVxuXG4vKipcbiAqIEZhY3RvcnkgZm9yIGNyZWF0aW5nIGEgbmV3IHtAbGluayBDbGllbnR9LlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIC0gVGhlIGNsaWVudCBvcHRpb25zXG4gKlxuICogQG1ldGhvZCBjcmVhdGVDbGllbnRcbiAqIEBtZW1iZXJvZiBtb2R1bGU6Y2Fydm95YW50L2NsaWVudFxuICogQHN0YXRpY1xuICovXG5mdW5jdGlvbiBjcmVhdGVDbGllbnQgKG9wdGlvbnMpIHtcblxuICByZXR1cm4gbmV3IENsaWVudChvcHRpb25zKTtcblxufVxuXG4vKipcbiAqIFJldHVybiBhY2NvdW50IGRldGFpbHMgZm9yIHRoZSBhY2NvdW50IGlkIHNwZWNpZmllZCBhY2NvdW50LlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHA6Ly9jb25mbHVlbmNlLmNhcnZveWFudC5jb20vZGlzcGxheS9QVUJERVYvQWNjb3VudH1cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYWNjb3VudElkIC0gVGhlIGFjY291bnQgaWRcbiAqIEBwYXJhbSB7bW9kdWxlOmNhcnZveWFudC9jbGllbnR+cmVzcG9uc2VDYWxsYmFja30gY2IgLSBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIHVwb24gcmVzcG9uc2UgcmVjZWl2ZWRcbiAqXG4gKiBAZnVuY3Rpb24gQ2xpZW50I2FjY291bnREZXRhaWxzXG4gKi9cbkNsaWVudC5wcm90b3R5cGUuYWNjb3VudERldGFpbHMgPSBmdW5jdGlvbiAoYWNjb3VudElkLCBjYikge1xuXG4gIGlmIChfLmlzVW5kZWZpbmVkKGFjY291bnRJZCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdhY2NvdW50SWQgbXVzdCBiZSBkZWZpbmVkLicpO1xuICB9XG5cbiAgdGhpcy5tYWtlUmVxdWVzdCgnL2FjY291bnQvJyArIGFjY291bnRJZCwgJ2dldCcsIGNiKTtcblxufTtcblxuLyoqXG4gKiBSZXR1cm4gYWxsIHZpc2libGUgYWNjb3VudHMuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cDovL2NvbmZsdWVuY2UuY2Fydm95YW50LmNvbS9kaXNwbGF5L1BVQkRFVi9BY2NvdW50fVxuICpcbiAqIEBwYXJhbSB7bW9kdWxlOmNhcnZveWFudC9jbGllbnR+cmVzcG9uc2VDYWxsYmFja30gY2IgLSBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIHVwb24gcmVzcG9uc2UgcmVjZWl2ZWRcbiAqXG4gKiBAZnVuY3Rpb24gQ2xpZW50I2FjY291bnRzXG4gKi9cbkNsaWVudC5wcm90b3R5cGUuYWNjb3VudHMgPSBmdW5jdGlvbiAoY2IpIHtcblxuICB0aGlzLm1ha2VSZXF1ZXN0KCcvYWNjb3VudC8nLCAnZ2V0JywgY2IpO1xuXG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBsaXN0IG9mIGNvbnN0cmFpbnRzIGZvciB0aGUgc3BlY2lmaWVkIHZlaGljbGUuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cDovL2NvbmZsdWVuY2UuY2Fydm95YW50LmNvbS9kaXNwbGF5L1BVQkRFVi9Db25zdHJhaW50fVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB2ZWhpY2xlSWQgLSBUaGUgdmVoaWNsZSBpZFxuICogQHBhcmFtIHttb2R1bGU6Y2Fydm95YW50L2NsaWVudH5yZXNwb25zZUNhbGxiYWNrfSBjYiAtIFRoZSBjYWxsYmFjayB0byBpbnZva2UgdXBvbiByZXNwb25zZSByZWNlaXZlZFxuICogQHBhcmFtIHtvYmplY3R9IFtxdWVyeVBhcmFtc10gLSBUaGUgcXVlcnkgcGFyYW1ldGVycyBmb3IgdGhlIHJlcXVlc3QgKEFQSSwgc2VhcmNoLCBzb3J0IGFuZC9vciBwYWdpbmF0aW9uIHBhcmFtcylcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2luY2UgdGhpcyBBUEkgc3VwcG9ydHMgcGFnaW5hdGlvbiBhbmQgc29ydGluZywgcGxlYXNlIHNlZSB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge0BsaW5rIENsaWVudCNtYWtlUmVxdWVzdH0gZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBkZXRhaWxzLlxuICogQHBhcmFtIHtib29sZWFufSBbcXVlcnlQYXJhbXMuYWN0aXZlT25seV0gLSBVc2VkIHRvIGZpbHRlciBjb25zdHJhaW50cyBiYXNlZCBvbiB3aGV0aGVyIG9yIG5vdCBDYXJ2b3lhbnQgaXMgZW5mb3JjaW5nXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBjb25zdHJhaW50IG9yIG5vdC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbcXVlcnlQYXJhbXMudHlwZV0gLSBVc2VkIGZvciBmaWx0ZXJpbmcgdGhlIGNvbnN0cmFpbnRzIGJ5IHRoZWlyIHR5cGUuXG4gKlxuICogQGZ1bmN0aW9uIENsaWVudCNjb25zdHJhaW50RGV0YWlsc1xuICovXG5DbGllbnQucHJvdG90eXBlLmNvbnN0cmFpbnREZXRhaWxzID0gZnVuY3Rpb24gKHZlaGljbGVJZCwgY29uc3RyYWludElkLCBjYikge1xuXG4gIGlmIChfLmlzVW5kZWZpbmVkKHZlaGljbGVJZCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2ZWhpY2xlSWQgbXVzdCBiZSBkZWZpbmVkLicpO1xuICB9XG5cbiAgaWYgKF8uaXNVbmRlZmluZWQoY29uc3RyYWludElkKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2NvbnN0cmFpbnRJZCBtdXN0IGJlIGRlZmluZWQuJyk7XG4gIH1cblxuICB0aGlzLm1ha2VSZXF1ZXN0KCcvdmVoaWNsZS8nICsgdmVoaWNsZUlkICsgJy9jb25zdHJhaW50LycgKyBjb25zdHJhaW50SWQsICdnZXQnLCBjYik7XG5cbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhY2NvdW50LiAgKE9ubHkgcGFydG5lciBhcHBsaWNhdGlvbiBrZXlzIGNhbiBjYWxsIHRoaXMgQVBJLilcbiAqXG4gKiBAc2VlIHtAbGluayBodHRwOi8vY29uZmx1ZW5jZS5jYXJ2b3lhbnQuY29tL2Rpc3BsYXkvUFVCREVWL0FjY291bnR9XG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGFjY291bnREYXRhIC0gVGhlIGFjY291bnQncyBkYXRhIGF0dHJpYnV0ZXNcbiAqIEBwYXJhbSB7bW9kdWxlOmNhcnZveWFudC9jbGllbnR+cmVzcG9uc2VDYWxsYmFja30gY2IgLSBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIHVwb24gcmVzcG9uc2UgcmVjZWl2ZWRcbiAqXG4gKiBAZnVuY3Rpb24gQ2xpZW50I2NyZWF0ZUFjY291bnRcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS5jcmVhdGVBY2NvdW50ID0gZnVuY3Rpb24gKGFjY291bnREYXRhLCBjYikge1xuXG4gIGlmIChfLmlzVW5kZWZpbmVkKGFjY291bnREYXRhKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2FjY291bnREYXRhIG11c3QgYmUgZGVmaW5lZC4nKTtcbiAgfVxuXG4gIHRoaXMubWFrZVJlcXVlc3QoJy9hY2NvdW50LycsICdwb3N0JywgY2IsIGFjY291bnREYXRhKTtcblxufTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGV2ZW50IHN1YnNjcmlwdGlvbi5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwOi8vY29uZmx1ZW5jZS5jYXJ2b3lhbnQuY29tL2Rpc3BsYXkvUFVCREVWL0V2ZW50U3Vic2NyaXB0aW9ufVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB2ZWhpY2xlSWQgLSBUaGUgdmVoaWNsZSBpZFxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50U3Vic2NyaXB0aW9uVHlwZSAtIFRoZSBldmVudCBzdWJzY3JpcHRpb24gdHlwZVxuICogQHBhcmFtIHtvYmplY3R9IGV2ZW50U3Vic2NyaXB0aW9uIC0gVGhlIGV2ZW50IHN1YnNjcmlwdGlvblxuICogQHBhcmFtIHttb2R1bGU6Y2Fydm95YW50L2NsaWVudH5yZXNwb25zZUNhbGxiYWNrfSBjYiAtIFRoZSBjYWxsYmFjayB0byBpbnZva2UgdXBvbiByZXNwb25zZSByZWNlaXZlZFxuICpcbiAqIEBmdW5jdGlvbiBDbGllbnQjY3JlYXRlRXZlbnRTdWJzY3JpcHRpb25cbiAqL1xuQ2xpZW50LnByb3RvdHlwZS5jcmVhdGVFdmVudFN1YnNjcmlwdGlvbiA9IGZ1bmN0aW9uICh2ZWhpY2xlSWQsIGV2ZW50U3Vic2NyaXB0aW9uVHlwZSwgZXZlbnRTdWJzY3JpcHRpb24sIGNiKSB7XG5cbiAgLy8gV2UgZG8gbm90IHZhbGlkYXRlIHRoZSBldmVudCBzdWJzY3JpcHRpb24gdHlwZSB0byBhdm9pZCB0aGUgQVBJIGJyZWFraW5nIHdoZW4gdXBzdHJlYW0gdHlwZXMgYXJlIGFkZGVkL2RlbGV0ZWRcblxuICBpZiAoXy5pc1VuZGVmaW5lZCh2ZWhpY2xlSWQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmVoaWNsZUlkIG11c3QgYmUgZGVmaW5lZC4nKTtcbiAgfVxuXG4gIGlmIChfLmlzVW5kZWZpbmVkKGV2ZW50U3Vic2NyaXB0aW9uVHlwZSkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdldmVudFN1YnNjcmlwdGlvblR5cGUgbXVzdCBiZSBkZWZpbmVkLicpO1xuICB9XG5cbiAgaWYgKF8uaXNVbmRlZmluZWQoZXZlbnRTdWJzY3JpcHRpb24pKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZXZlbnRTdWJzY3JpcHRpb24gbXVzdCBiZSBkZWZpbmVkLicpO1xuICB9XG5cbiAgdGhpcy5tYWtlUmVxdWVzdCgnL3ZlaGljbGUvJyArIHZlaGljbGVJZCArICcvZXZlbnRTdWJzY3JpcHRpb24nICtcbiAgICAgICAgICAgICAgICAgICAgICAoZXZlbnRTdWJzY3JpcHRpb25UeXBlID8gJy8nICsgZXZlbnRTdWJzY3JpcHRpb25UeXBlIDogJycpLFxuICAgICAgICAgICAgICAgICAgICdwb3N0JywgY2IsIGV2ZW50U3Vic2NyaXB0aW9uKTtcblxufTtcblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgdmVoaWNsZS5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwOi8vY29uZmx1ZW5jZS5jYXJ2b3lhbnQuY29tL2Rpc3BsYXkvUFVCREVWL1ZlaGljbGV9XG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHZlaGljbGVEYXRhIC0gVGhlIHZlaGljbGUncyBkYXRhIGF0dHJpYnV0ZXNcbiAqIEBwYXJhbSB7bW9kdWxlOmNhcnZveWFudC9jbGllbnR+cmVzcG9uc2VDYWxsYmFja30gY2IgLSBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIHVwb24gcmVzcG9uc2UgcmVjZWl2ZWRcbiAqXG4gKiBAZnVuY3Rpb24gQ2xpZW50I2NyZWF0ZVZlaGljbGVcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS5jcmVhdGVWZWhpY2xlID0gZnVuY3Rpb24gKHZlaGljbGVEYXRhLCBjYikge1xuXG4gIGlmIChfLmlzVW5kZWZpbmVkKHZlaGljbGVEYXRhKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZlaGljbGVEYXRhIG11c3QgYmUgZGVmaW5lZC4nKTtcbiAgfVxuXG4gIHRoaXMubWFrZVJlcXVlc3QoJy92ZWhpY2xlLycsICdwb3N0JywgY2IsIHZlaGljbGVEYXRhKTtcblxufTtcblxuLyoqXG4gKiBEZWxldGVzIGFuIGFjY291bnQuICAoT25seSBwYXJ0bmVyIGFwcGxpY2F0aW9uIGtleXMgY2FuIGNhbGwgdGhpcyBBUEkuKVxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHA6Ly9jb25mbHVlbmNlLmNhcnZveWFudC5jb20vZGlzcGxheS9QVUJERVYvQWNjb3VudH1cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gYWNjb3VudElkIC0gVGhlIGFjY291bnQgaWRcbiAqIEBwYXJhbSB7bW9kdWxlOmNhcnZveWFudC9jbGllbnR+cmVzcG9uc2VDYWxsYmFja30gY2IgLSBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIHVwb24gcmVzcG9uc2UgcmVjZWl2ZWRcbiAqXG4gKiBAZnVuY3Rpb24gQ2xpZW50I2RlbGV0ZUFjY291bnRcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS5kZWxldGVBY2NvdW50ID0gZnVuY3Rpb24gKGFjY291bnRJZCwgY2IpIHtcblxuICBpZiAoXy5pc1VuZGVmaW5lZChhY2NvdW50SWQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYWNjb3VudElkIG11c3QgYmUgZGVmaW5lZC4nKTtcbiAgfVxuXG4gIHRoaXMubWFrZVJlcXVlc3QoJy9hY2NvdW50LycgKyBhY2NvdW50SWQsICdkZWxldGUnLCBjYik7XG5cbn07XG5cbi8qKlxuICogRGVsZXRlcyBhbiBldmVudCBzdWJzY3JpcHRpb24uXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cDovL2NvbmZsdWVuY2UuY2Fydm95YW50LmNvbS9kaXNwbGF5L1BVQkRFVi9FdmVudFN1YnNjcmlwdGlvbn1cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdmVoaWNsZUlkIC0gVGhlIHZlaGljbGUgaWRcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFN1YnNjcmlwdGlvbklkIC0gVGhlIGV2ZW50IHN1YnNjcmlwdGlvbiBpZFxuICogQHBhcmFtIHttb2R1bGU6Y2Fydm95YW50L2NsaWVudH5yZXNwb25zZUNhbGxiYWNrfSBjYiAtIFRoZSBjYWxsYmFjayB0byBpbnZva2UgdXBvbiByZXNwb25zZSByZWNlaXZlZFxuICogQHBhcmFtIHtzdHJpbmd9IFtldmVudFN1YnNjcmlwdGlvblR5cGVdIC0gVGhlIGV2ZW50IHN1YnNjcmlwdGlvbiB0eXBlXG4gKlxuICogQGZ1bmN0aW9uIENsaWVudCNkZWxldGVFdmVudFN1YnNjcmlwdGlvblxuICovXG5DbGllbnQucHJvdG90eXBlLmRlbGV0ZUV2ZW50U3Vic2NyaXB0aW9uID0gZnVuY3Rpb24gKHZlaGljbGVJZCwgZXZlbnRTdWJzY3JpcHRpb25JZCwgY2IsIGV2ZW50U3Vic2NyaXB0aW9uVHlwZSkge1xuXG4gIC8vIFdlIGRvIG5vdCB2YWxpZGF0ZSB0aGUgZXZlbnQgc3Vic2NyaXB0aW9uIHR5cGUgdG8gYXZvaWQgdGhlIEFQSSBicmVha2luZyB3aGVuIHVwc3RyZWFtIHR5cGVzIGFyZSBhZGRlZC9kZWxldGVkXG5cbiAgaWYgKF8uaXNVbmRlZmluZWQodmVoaWNsZUlkKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZlaGljbGVJZCBtdXN0IGJlIGRlZmluZWQuJyk7XG4gIH1cblxuICBpZiAoXy5pc1VuZGVmaW5lZChldmVudFN1YnNjcmlwdGlvbklkKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2V2ZW50U3Vic2NyaXB0aW9uSWQgbXVzdCBiZSBkZWZpbmVkLicpO1xuICB9XG5cbiAgdGhpcy5tYWtlUmVxdWVzdCgnL3ZlaGljbGUvJyArIHZlaGljbGVJZCArICcvZXZlbnRTdWJzY3JpcHRpb24nICtcbiAgICAgICAgICAgICAgICAgICAgICAgKGV2ZW50U3Vic2NyaXB0aW9uVHlwZSA/ICcvJyArIGV2ZW50U3Vic2NyaXB0aW9uVHlwZSA6ICcnKSArICcvJyArIGV2ZW50U3Vic2NyaXB0aW9uSWQsXG4gICAgICAgICAgICAgICAgICAgJ2RlbGV0ZScsIGNiKTtcblxufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBldmVudCBzdWJzY3JpcHRpb24gZGV0YWlscy5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwOi8vY29uZmx1ZW5jZS5jYXJ2b3lhbnQuY29tL2Rpc3BsYXkvUFVCREVWL0V2ZW50U3Vic2NyaXB0aW9ufVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB2ZWhpY2xlSWQgLSBUaGUgdmVoaWNsZSBpZFxuICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50U3Vic2NyaXB0aW9uSWQgLSBUaGUgZXZlbnQgc3Vic2NyaXB0aW9uIGlkXG4gKiBAcGFyYW0ge21vZHVsZTpjYXJ2b3lhbnQvY2xpZW50fnJlc3BvbnNlQ2FsbGJhY2t9IGNiIC0gVGhlIGNhbGxiYWNrIHRvIGludm9rZSB1cG9uIHJlc3BvbnNlIHJlY2VpdmVkXG4gKiBAcGFyYW0ge3N0cmluZ30gW2V2ZW50U3Vic2NyaXB0aW9uVHlwZV0gLSBUaGUgZXZlbnQgc3Vic2NyaXB0aW9uIHR5cGVcbiAqXG4gKiBAZnVuY3Rpb24gQ2xpZW50I2V2ZW50U3Vic2NyaXB0aW9uRGV0YWlsc1xuICovXG5DbGllbnQucHJvdG90eXBlLmV2ZW50U3Vic2NyaXB0aW9uRGV0YWlscyA9IGZ1bmN0aW9uICh2ZWhpY2xlSWQsIGV2ZW50U3Vic2NyaXB0aW9uSWQsIGNiLCBldmVudFN1YnNjcmlwdGlvblR5cGUpIHtcblxuICAvLyBXZSBkbyBub3QgdmFsaWRhdGUgdGhlIGV2ZW50IHN1YnNjcmlwdGlvbiB0eXBlIHRvIGF2b2lkIHRoZSBBUEkgYnJlYWtpbmcgd2hlbiB1cHN0cmVhbSB0eXBlcyBhcmUgYWRkZWQvZGVsZXRlZFxuXG4gIGlmIChfLmlzVW5kZWZpbmVkKHZlaGljbGVJZCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2ZWhpY2xlSWQgbXVzdCBiZSBkZWZpbmVkLicpO1xuICB9XG5cbiAgaWYgKF8uaXNVbmRlZmluZWQoZXZlbnRTdWJzY3JpcHRpb25JZCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdldmVudFN1YnNjcmlwdGlvbklkIG11c3QgYmUgZGVmaW5lZC4nKTtcbiAgfVxuXG4gIHRoaXMubWFrZVJlcXVlc3QoJy92ZWhpY2xlLycgKyB2ZWhpY2xlSWQgKyAnL2V2ZW50U3Vic2NyaXB0aW9uJyArXG4gICAgICAgICAgICAgICAgICAgICAgIChldmVudFN1YnNjcmlwdGlvblR5cGUgPyAnLycgKyBldmVudFN1YnNjcmlwdGlvblR5cGUgOiAnJykgKyAnLycgKyBldmVudFN1YnNjcmlwdGlvbklkLFxuICAgICAgICAgICAgICAgICAgICdnZXQnLCBjYik7XG5cbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgZXZlbnQgc3Vic2NyaXB0aW9ucy5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwOi8vY29uZmx1ZW5jZS5jYXJ2b3lhbnQuY29tL2Rpc3BsYXkvUFVCREVWL0V2ZW50U3Vic2NyaXB0aW9ufVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB2ZWhpY2xlSWQgLSBUaGUgdmVoaWNsZSBpZFxuICogQHBhcmFtIHttb2R1bGU6Y2Fydm95YW50L2NsaWVudH5yZXNwb25zZUNhbGxiYWNrfSBjYiAtIFRoZSBjYWxsYmFjayB0byBpbnZva2UgdXBvbiByZXNwb25zZSByZWNlaXZlZFxuICogQHBhcmFtIHtzdHJpbmd9IFtldmVudFN1YnNjcmlwdGlvblR5cGVdIC0gSWYgcHJvdmlkZWQsIHJldHVybiBvbmx5IGV2ZW50IHN1YnNjcmlwdGlvbnMgb2YgdGhlIGdpdmVuIHR5cGVcbiAqXG4gKiBAZnVuY3Rpb24gQ2xpZW50I2V2ZW50U3Vic2NyaXB0aW9uc1xuICovXG5DbGllbnQucHJvdG90eXBlLmV2ZW50U3Vic2NyaXB0aW9ucyA9IGZ1bmN0aW9uICh2ZWhpY2xlSWQsIGNiLCBldmVudFN1YnNjcmlwdGlvblR5cGUpIHtcblxuICAvLyBXZSBkbyBub3QgdmFsaWRhdGUgdGhlIGV2ZW50IHN1YnNjcmlwdGlvbiB0eXBlIHRvIGF2b2lkIHRoZSBBUEkgYnJlYWtpbmcgd2hlbiB1cHN0cmVhbSB0eXBlcyBhcmUgYWRkZWQvZGVsZXRlZFxuXG4gIGlmIChfLmlzVW5kZWZpbmVkKHZlaGljbGVJZCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2ZWhpY2xlSWQgbXVzdCBiZSBkZWZpbmVkLicpO1xuICB9XG5cbiAgdGhpcy5tYWtlUmVxdWVzdCgnL3ZlaGljbGUvJyArIHZlaGljbGVJZCArICcvZXZlbnRTdWJzY3JpcHRpb24nICtcbiAgICAgICAgICAgICAgICAgICAgICAgKGV2ZW50U3Vic2NyaXB0aW9uVHlwZSA/ICcvJyArIGV2ZW50U3Vic2NyaXB0aW9uVHlwZSA6ICcnKSwgJ2dldCcsIGNiKTtcblxufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBkZXRhaWxzIGZvciB0aGUgc3BlY2lmaWVkIHRyaXAuICBUaGUgY2FsbGluZyBhY2NvdW50IG11c3QgaGF2ZSBhY2Nlc3MgdG8gdGhlIHZlaGljbGUgZGF0YS5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwOi8vY29uZmx1ZW5jZS5jYXJ2b3lhbnQuY29tL2Rpc3BsYXkvUFVCREVWL1RyaXB9XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHZlaGljbGVJZCAtIFRoZSB2ZWhpY2xlIGlkXG4gKiBAcGFyYW0ge3N0cmluZ30gdHJpcElkIC0gVGhlIHRyaXAgaWRcbiAqIEBwYXJhbSB7bW9kdWxlOmNhcnZveWFudC9jbGllbnR+cmVzcG9uc2VDYWxsYmFja30gY2IgLSBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIHVwb24gcmVzcG9uc2UgcmVjZWl2ZWRcbiAqXG4gKiBAZnVuY3Rpb24gQ2xpZW50I3RyaXBEZXRhaWxzXG4gKi9cbkNsaWVudC5wcm90b3R5cGUudHJpcERldGFpbHMgPSBmdW5jdGlvbiAodmVoaWNsZUlkLCB0cmlwSWQsIGNiKSB7XG5cbiAgaWYgKF8uaXNVbmRlZmluZWQodmVoaWNsZUlkKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZlaGljbGVJZCBtdXN0IGJlIGRlZmluZWQuJyk7XG4gIH1cblxuICBpZiAoXy5pc1VuZGVmaW5lZCh0cmlwSWQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndHJpcElkIG11c3QgYmUgZGVmaW5lZC4nKTtcbiAgfVxuXG4gIHRoaXMubWFrZVJlcXVlc3QoJy92ZWhpY2xlLycgKyB2ZWhpY2xlSWQgKyAnL3RyaXAvJyArIHRyaXBJZCwgJ2dldCcsIGNiKTtcblxufTtcblxuLyoqXG4gKiBVcGRhdGVzIGFuIGV4aXN0aW5nIGFjY291bnQuICAoT25seSBwYXJ0bmVyIGFwcGxpY2F0aW9uIGtleXMgY2FuIGNhbGwgdGhpcyBBUEkuKVxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHA6Ly9jb25mbHVlbmNlLmNhcnZveWFudC5jb20vZGlzcGxheS9QVUJERVYvQWNjb3VudH1cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gYWNjb3VudERhdGEgLSBUaGUgYWNjb3VudCdzIGRhdGEgYXR0cmlidXRlc1xuICogQHBhcmFtIHttb2R1bGU6Y2Fydm95YW50L2NsaWVudH5yZXNwb25zZUNhbGxiYWNrfSBjYiAtIFRoZSBjYWxsYmFjayB0byBpbnZva2UgdXBvbiByZXNwb25zZSByZWNlaXZlZFxuICpcbiAqIEBmdW5jdGlvbiBDbGllbnQjdXBkYXRlQWNjb3VudFxuICovXG5DbGllbnQucHJvdG90eXBlLnVwZGF0ZUFjY291bnQgPSBmdW5jdGlvbiAoYWNjb3VudERhdGEsIGNiKSB7XG5cbiAgaWYgKF8uaXNVbmRlZmluZWQoYWNjb3VudERhdGEpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYWNjb3VudERhdGEgbXVzdCBiZSBkZWZpbmVkLicpO1xuICB9XG5cbiAgaWYgKF8uaXNVbmRlZmluZWQoYWNjb3VudERhdGEuaWQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYWNjb3VudERhdGEuaWQgbXVzdCBiZSBkZWZpbmVkLicpO1xuICB9XG5cbiAgdGhpcy5tYWtlUmVxdWVzdCgnL2FjY291bnQvJyArIGFjY291bnREYXRhLmlkLCAncG9zdCcsIGNiLCBhY2NvdW50RGF0YSk7XG5cbn07XG5cbi8qKlxuICogVXBkYXRlcyBhbiBldmVudCBzdWJzY3JpcHRpb24uXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cDovL2NvbmZsdWVuY2UuY2Fydm95YW50LmNvbS9kaXNwbGF5L1BVQkRFVi9FdmVudFN1YnNjcmlwdGlvbn1cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdmVoaWNsZUlkIC0gVGhlIHZlaGljbGUgaWRcbiAqIEBwYXJhbSB7b2JqZWN0fSBldmVudFN1YnNjcmlwdGlvbiAtIFRoZSBldmVudCBzdWJzY3JpcHRpb25cbiAqIEBwYXJhbSB7bW9kdWxlOmNhcnZveWFudC9jbGllbnR+cmVzcG9uc2VDYWxsYmFja30gY2IgLSBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIHVwb24gcmVzcG9uc2UgcmVjZWl2ZWRcbiAqXG4gKiBAZnVuY3Rpb24gQ2xpZW50I2V2ZW50U3Vic2NyaXB0aW9uRGV0YWlsc1xuICovXG5DbGllbnQucHJvdG90eXBlLnVwZGF0ZUV2ZW50U3Vic2NyaXB0aW9uID0gZnVuY3Rpb24gKHZlaGljbGVJZCwgZXZlbnRTdWJzY3JpcHRpb24sIGNiKSB7XG5cbiAgaWYgKF8uaXNVbmRlZmluZWQodmVoaWNsZUlkKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZlaGljbGVJZCBtdXN0IGJlIGRlZmluZWQuJyk7XG4gIH1cblxuICBpZiAoXy5pc1VuZGVmaW5lZChldmVudFN1YnNjcmlwdGlvbikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdldmVudFN1YnNjcmlwdGlvbiBtdXN0IGJlIGRlZmluZWQuJyk7XG4gIH1cblxuICB0aGlzLm1ha2VSZXF1ZXN0KCcvdmVoaWNsZS8nICsgdmVoaWNsZUlkICsgJy9ldmVudFN1YnNjcmlwdGlvbi8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgdXRpbHMuZXh0ZXJuYWxpemVFdmVudFN1YnNjcmlwdGlvblR5cGUoZXZlbnRTdWJzY3JpcHRpb24uX3R5cGUpICsgJy8nICsgZXZlbnRTdWJzY3JpcHRpb24uaWQsXG4gICAgICAgICAgICAgICAgICAgJ3Bvc3QnLCBjYiwgZXZlbnRTdWJzY3JpcHRpb24pO1xuXG59O1xuXG4vKipcbiAqIFVwZGF0ZXMgYW4gZXhpc3RpbmcgdmVoaWNsZS5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwOi8vY29uZmx1ZW5jZS5jYXJ2b3lhbnQuY29tL2Rpc3BsYXkvUFVCREVWL1ZlaGljbGV9XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHZlaGljbGVJZCAtIFRoZSB2ZWhpY2xlIGlkXG4gKiBAcGFyYW0ge29iamVjdH0gdmVoaWNsZURhdGEgLSBUaGUgdmVoaWNsZSdzIGRhdGEgYXR0cmlidXRlIHRvIHVwZGF0ZVxuICogQHBhcmFtIHttb2R1bGU6Y2Fydm95YW50L2NsaWVudH5yZXNwb25zZUNhbGxiYWNrfSBjYiAtIFRoZSBjYWxsYmFjayB0byBpbnZva2UgdXBvbiByZXNwb25zZSByZWNlaXZlZFxuICpcbiAqIEBmdW5jdGlvbiBDbGllbnQjdXBkYXRlVmVoaWNsZVxuICovXG5DbGllbnQucHJvdG90eXBlLnVwZGF0ZVZlaGljbGUgPSBmdW5jdGlvbiAodmVoaWNsZURhdGEsIGNiKSB7XG5cbiAgaWYgKF8uaXNVbmRlZmluZWQodmVoaWNsZURhdGEpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmVoaWNsZURhdGEgbXVzdCBiZSBkZWZpbmVkLicpO1xuICB9XG5cbiAgaWYgKF8uaXNVbmRlZmluZWQodmVoaWNsZURhdGEudmVoaWNsZUlkKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZlaGljbGVEYXRhLnZlaGljbGVJZCBtdXN0IGJlIGRlZmluZWQuJyk7XG4gIH1cblxuICB0aGlzLm1ha2VSZXF1ZXN0KCcvdmVoaWNsZS8nICsgdmVoaWNsZURhdGEudmVoaWNsZUlkLCAncG9zdCcsIGNiLCB2ZWhpY2xlRGF0YSk7XG5cbn07XG5cblxuLyoqXG4gKiBSZXRyaWV2ZSBhIHZlaGljbGUgYnkgaXRzIGlkLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHA6Ly9jb25mbHVlbmNlLmNhcnZveWFudC5jb20vZGlzcGxheS9QVUJERVYvVmVoaWNsZX1cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdmVoaWNsZUlkIC0gVGhlIHZlaGljbGUgaWRcbiAqIEBwYXJhbSB7bW9kdWxlOmNhcnZveWFudC9jbGllbnR+cmVzcG9uc2VDYWxsYmFja30gY2IgLSBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIHVwb24gcmVzcG9uc2UgcmVjZWl2ZWRcbiAqXG4gKiBAZnVuY3Rpb24gQ2xpZW50I3ZlaGljbGVcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS52ZWhpY2xlID0gZnVuY3Rpb24gKHZlaGljbGVJZCwgY2IpIHtcblxuICBpZiAoXy5pc1VuZGVmaW5lZCh2ZWhpY2xlSWQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmVoaWNsZUlkIG11c3QgYmUgZGVmaW5lZC4nKTtcbiAgfVxuXG4gIHRoaXMubWFrZVJlcXVlc3QoJy92ZWhpY2xlLycgKyB2ZWhpY2xlSWQsICdnZXQnLCBjYik7XG5cbn07XG5cbi8qKlxuICogUmV0dXJucyBhIGxpc3Qgb2YgY29uc3RyYWludHMgZm9yIHRoZSBzcGVjaWZpZWQgdmVoaWNsZS5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwOi8vY29uZmx1ZW5jZS5jYXJ2b3lhbnQuY29tL2Rpc3BsYXkvUFVCREVWL0NvbnN0cmFpbnR9XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHZlaGljbGVJZCAtIFRoZSB2ZWhpY2xlIGlkXG4gKiBAcGFyYW0ge21vZHVsZTpjYXJ2b3lhbnQvY2xpZW50fnJlc3BvbnNlQ2FsbGJhY2t9IGNiIC0gVGhlIGNhbGxiYWNrIHRvIGludm9rZSB1cG9uIHJlc3BvbnNlIHJlY2VpdmVkXG4gKiBAcGFyYW0ge29iamVjdH0gW3F1ZXJ5UGFyYW1zXSAtIFRoZSBxdWVyeSBwYXJhbWV0ZXJzIGZvciB0aGUgcmVxdWVzdCAoQVBJLCBzZWFyY2gsIHNvcnQgYW5kL29yIHBhZ2luYXRpb24gcGFyYW1zKVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaW5jZSB0aGlzIEFQSSBzdXBwb3J0cyBwYWdpbmF0aW9uIGFuZCBzb3J0aW5nLCBwbGVhc2Ugc2VlIHRoZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7QGxpbmsgQ2xpZW50I21ha2VSZXF1ZXN0fSBkb2N1bWVudGF0aW9uIGZvciBtb3JlIGRldGFpbHMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtxdWVyeVBhcmFtcy5hY3RpdmVPbmx5XSAtIFVzZWQgdG8gZmlsdGVyIGNvbnN0cmFpbnRzIGJhc2VkIG9uIHdoZXRoZXIgb3Igbm90IENhcnZveWFudCBpcyBlbmZvcmNpbmdcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIGNvbnN0cmFpbnQgb3Igbm90LlxuICogQHBhcmFtIHtzdHJpbmd9IFtxdWVyeVBhcmFtcy50eXBlXSAtIFVzZWQgZm9yIGZpbHRlcmluZyB0aGUgY29uc3RyYWludHMgYnkgdGhlaXIgdHlwZS5cbiAqXG4gKiBAZnVuY3Rpb24gQ2xpZW50I3ZlaGljbGVDb25zdHJhaW50c1xuICovXG5DbGllbnQucHJvdG90eXBlLnZlaGljbGVDb25zdHJhaW50cyA9IGZ1bmN0aW9uICh2ZWhpY2xlSWQsIGNiLCBxdWVyeVBhcmFtcykge1xuXG4gIHZhciByZWFsUXVlcnlQYXJhbXMgPSB7fTtcblxuICBpZiAoXy5pc1VuZGVmaW5lZCh2ZWhpY2xlSWQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmVoaWNsZUlkIG11c3QgYmUgZGVmaW5lZC4nKTtcbiAgfVxuXG4gIC8vIFdlIGRvIG5vdCB2YWxpZGF0ZSB0aGUgY29uc3RyYWludCB0eXBlIHRvIGF2b2lkIHRoZSBBUEkgYnJlYWtpbmcgd2hlbiB1cHN0cmVhbSB0eXBlcyBhcmUgYWRkZWQvZGVsZXRlZFxuXG4gIF8uZWFjaChxdWVyeVBhcmFtcywgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcblxuICAgIGlmIChrZXkgPT09ICdhY3RpdmVPbmx5Jykge1xuICAgICAgaWYgKCFfLmlzQm9vbGVhbih2YWx1ZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYWN0aXZlT25seSBtdXN0IGJlIGEgQm9vbGVhbi4nKTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29udmVydCB0aGUgdmFsdWUgdG8gYSBzdHJpbmdcbiAgICAgIHJlYWxRdWVyeVBhcmFtc1trZXldID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZWFsUXVlcnlQYXJhbXNba2V5XSA9IHZhbHVlO1xuICAgIH1cblxuICB9KTtcblxuICB0aGlzLm1ha2VSZXF1ZXN0KCcvdmVoaWNsZS8nICsgdmVoaWNsZUlkICsgJy9jb25zdHJhaW50JywgJ2dldCcsIGNiLCByZWFsUXVlcnlQYXJhbXMpO1xuXG59O1xuXG4vKipcbiAqIFJldHVybnMgcmF3IHZlaGljbGUgZGF0YSBmb3IgdGhlIHNwZWNpZmllZCB2ZWhpY2xlLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHA6Ly9jb25mbHVlbmNlLmNhcnZveWFudC5jb20vZGlzcGxheS9QVUJERVYvRGF0YVBvaW50fVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB2ZWhpY2xlSWQgLSBUaGUgdmVoaWNsZSBpZFxuICogQHBhcmFtIHttb2R1bGU6Y2Fydm95YW50L2NsaWVudH5yZXNwb25zZUNhbGxiYWNrfSBjYiAtIFRoZSBjYWxsYmFjayB0byBpbnZva2UgdXBvbiByZXNwb25zZSByZWNlaXZlZFxuICogQHBhcmFtIHtvYmplY3R9IFtxdWVyeVBhcmFtc10gLSBUaGUgcXVlcnkgcGFyYW1ldGVycyBmb3IgdGhlIHJlcXVlc3QgKEFQSSwgc2VhcmNoLCBzb3J0IGFuZC9vciBwYWdpbmF0aW9uIHBhcmFtcylcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2luY2UgdGhpcyBBUEkgc3VwcG9ydHMgcGFnaW5hdGlvbiBhbmQgc29ydGluZywgcGxlYXNlIHNlZSB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge0BsaW5rIENsaWVudCNtYWtlUmVxdWVzdH0gZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBkZXRhaWxzLlxuICogQHBhcmFtIHtzdHJpbmd9IFtxdWVyeVBhcmFtcy5rZXldIC0gVGhlIGRhdGEgdHlwZSB0byBiZSByZXR1cm5lZC4gIEFsbG93YWJsZSB2YWx1ZXMgY2FuIGJlIGZvdW5kIGluIHRoZSBsaW5rIGFib3ZlLlxuICogQHBhcmFtIHtib29sZWFufSBbcXVlcnlQYXJhbXMubW9zdFJlY2VudE9ubHldIC0gSWYgdGhpcyBwYXJhbWV0ZXIgaXMgc3BlY2lmaWVkLCB0aGUgbW9zdCByZWNlbnQgZGF0YSBwb2ludCBjb2xsZWN0ZWRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBldmVyeSBrZXkgdHlwZSB3aWxsIGJlIHJldHVybmVkLiAgUGxlYXNlIG5vdGUgdGhhdCB0aGUgZGF0YVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRzIHJldHVybmVkIG1heSBub3QgaGF2ZSBiZWVuIGNvbGxlY3RlZCBhdCB0aGUgc2FtZSB0aW1lLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWRkaXRpb25hbGx5LCBwYWdpbmF0aW9uIGFuZCBzb3J0aW5nIGlzIG5vdCBzdXBwb3J0ZWQgd2hlblxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9zdFJlY2VudE9ubHkgaXMgc3BlY2lmaWVkLlxuICpcbiAqIEBmdW5jdGlvbiBDbGllbnQjdmVoaWNsZURhdGFcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS52ZWhpY2xlRGF0YSA9IGZ1bmN0aW9uICh2ZWhpY2xlSWQsIGNiLCBxdWVyeVBhcmFtcykge1xuXG4gIHZhciByZWFsUXVlcnlQYXJhbXMgPSB7fTtcblxuICBpZiAoXy5pc1VuZGVmaW5lZCh2ZWhpY2xlSWQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmVoaWNsZUlkIG11c3QgYmUgZGVmaW5lZC4nKTtcbiAgfVxuXG4gIF8uZWFjaChxdWVyeVBhcmFtcywgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcblxuICAgIGlmIChrZXkgPT09ICdtb3N0UmVjZW50T25seScpIHtcbiAgICAgIGlmICghXy5pc0Jvb2xlYW4odmFsdWUpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ21vc3RSZWNlbnRPbmx5IG11c3QgYmUgYSBCb29sZWFuLicpO1xuICAgICAgfVxuXG4gICAgICAvLyBEbyBub3QgaW5jbHVkZSB0aGUgcGFyYW1ldGVyIGlmIGl0cyB2YWx1ZSBpcyBmYWxzZVxuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIHJlYWxRdWVyeVBhcmFtc1trZXldID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmVhbFF1ZXJ5UGFyYW1zW2tleV0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgfSk7XG5cbiAgdGhpcy5tYWtlUmVxdWVzdCgnL3ZlaGljbGUvJyArIHZlaGljbGVJZCArICcvZGF0YScsICdnZXQnLCBjYiwgcmVhbFF1ZXJ5UGFyYW1zKTtcblxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgY29sbGVjdGlvbiBvZiByYXcsIHJlbGF0ZWQgdmVoaWNsZSBkYXRhIGZvciB0aGUgc3BlY2lmaWVkIHZlaGljbGUuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cDovL2NvbmZsdWVuY2UuY2Fydm95YW50LmNvbS9kaXNwbGF5L1BVQkRFVi9EYXRhU2V0fVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB2ZWhpY2xlSWQgLSBUaGUgdmVoaWNsZSBpZFxuICogQHBhcmFtIHttb2R1bGU6Y2Fydm95YW50L2NsaWVudH5yZXNwb25zZUNhbGxiYWNrfSBjYiAtIFRoZSBjYWxsYmFjayB0byBpbnZva2UgdXBvbiByZXNwb25zZSByZWNlaXZlZFxuICogQHBhcmFtIHtvYmplY3R9IFtxdWVyeVBhcmFtc10gLSBUaGUgcXVlcnkgcGFyYW1ldGVycyBmb3IgdGhlIHJlcXVlc3QgKEFQSSwgc2VhcmNoLCBzb3J0IGFuZC9vciBwYWdpbmF0aW9uIHBhcmFtcylcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2luY2UgdGhpcyBBUEkgc3VwcG9ydHMgcGFnaW5hdGlvbiBhbmQgc29ydGluZywgcGxlYXNlIHNlZSB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge0BsaW5rIENsaWVudCNtYWtlUmVxdWVzdH0gZG9jdW1lbnRhdGlvbiBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIEBmdW5jdGlvbiBDbGllbnQjdmVoaWNsZURhdGFTZXRcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS52ZWhpY2xlRGF0YVNldCA9IGZ1bmN0aW9uICh2ZWhpY2xlSWQsIGNiLCBxdWVyeVBhcmFtcykge1xuXG4gIGlmIChfLmlzVW5kZWZpbmVkKHZlaGljbGVJZCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2ZWhpY2xlSWQgbXVzdCBiZSBkZWZpbmVkLicpO1xuICB9XG5cbiAgdGhpcy5tYWtlUmVxdWVzdCgnL3ZlaGljbGUvJyArIHZlaGljbGVJZCArICcvZGF0YVNldCcsICdnZXQnLCBjYiwgcXVlcnlQYXJhbXMpO1xuXG59O1xuXG4vKipcbiAqIFJldHJpZXZlIGEgbGlzdCBvZiB2ZWhpY2xlcy5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwOi8vY29uZmx1ZW5jZS5jYXJ2b3lhbnQuY29tL2Rpc3BsYXkvUFVCREVWL1ZlaGljbGV9XG4gKlxuICogQHBhcmFtIHttb2R1bGU6Y2Fydm95YW50L2NsaWVudH5yZXNwb25zZUNhbGxiYWNrfSBjYiAtIFRoZSBjYWxsYmFjayB0byBpbnZva2UgdXBvbiByZXNwb25zZSByZWNlaXZlZFxuICpcbiAqIEBmdW5jdGlvbiBDbGllbnQjdmVoaWNsZXNcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS52ZWhpY2xlcyA9IGZ1bmN0aW9uIChjYikge1xuXG4gIHRoaXMubWFrZVJlcXVlc3QoJy92ZWhpY2xlJywgJ2dldCcsIGNiKTtcblxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgcGFnZWQgbGlzdCBvZiB0cmlwcyBmb3IgdGhlIHNwZWNpZmllZCB2ZWhpY2xlLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHA6Ly9jb25mbHVlbmNlLmNhcnZveWFudC5jb20vZGlzcGxheS9QVUJERVYvVHJpcH1cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdmVoaWNsZUlkIC0gVGhlIHZlaGljbGUgaWRcbiAqIEBwYXJhbSB7bW9kdWxlOmNhcnZveWFudC9jbGllbnR+cmVzcG9uc2VDYWxsYmFja30gY2IgLSBUaGUgY2FsbGJhY2sgdG8gaW52b2tlIHVwb24gcmVzcG9uc2UgcmVjZWl2ZWRcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcXVlcnlQYXJhbXNdIC0gVGhlIHF1ZXJ5IHBhcmFtZXRlcnMgZm9yIHRoZSByZXF1ZXN0IChBUEksIHNlYXJjaCwgc29ydCBhbmQvb3IgcGFnaW5hdGlvbiBwYXJhbXMpXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNpbmNlIHRoaXMgQVBJIHN1cHBvcnRzIHBhZ2luYXRpb24gYW5kIHNvcnRpbmcsIHBsZWFzZSBzZWUgdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtAbGluayBDbGllbnQjbWFrZVJlcXVlc3R9IGRvY3VtZW50YXRpb24gZm9yIG1vcmUgZGV0YWlscy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW3F1ZXJ5UGFyYW1zLmluY2x1ZGVEYXRhXSAtIElmIHRydWUsIHRoZW4gdGhlIHJlc3VsdHMgd2lsbCBpbmNsdWRlIGFsbCBvZiB0aGUgZGF0YSBwb2ludHNcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3RlZCBkdXJpbmcgdGhhdCB0cmlwLlxuICogQHBhcmFtIHtkYXRlfSBbcXVlcnlQYXJhbXMuc3RhcnRUaW1lXSAtIFVzZWQgZm9yIGZpbHRlcmluZyB0aGUgcmVzdWx0cy4gIE9ubHkgdHJpcHMgdGhhdCBzdGFydGVkIGFmdGVyIHRoaXMgdGltZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyZSByZXR1cm5lZC5cbiAqIEBwYXJhbSB7ZGF0ZX0gW3F1ZXJ5UGFyYW1zLmVuZFRpbWVdIC0gVXNlZCBmb3IgZmlsdGVyaW5nIHRoZSByZXN1bHRzLiAgT25seSB0cmlwcyB0aGF0IHN0YXJ0ZWQgYmVmb3JlIHRoaXMgdGltZVxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmUgcmV0dXJuZWQuXG4gKlxuICogQGZ1bmN0aW9uIENsaWVudCN2ZWhpY2xlVHJpcHNcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS52ZWhpY2xlVHJpcHMgPSBmdW5jdGlvbiAodmVoaWNsZUlkLCBjYiwgcXVlcnlQYXJhbXMpIHtcblxuICB2YXIgcmVhbFF1ZXJ5UGFyYW1zID0ge307XG5cbiAgaWYgKF8uaXNVbmRlZmluZWQodmVoaWNsZUlkKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZlaGljbGVJZCBtdXN0IGJlIGRlZmluZWQuJyk7XG4gIH1cblxuICBfLmVhY2gocXVlcnlQYXJhbXMsIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG5cbiAgICBpZiAoa2V5ID09PSAnaW5jbHVkZURhdGEnKSB7XG4gICAgICBpZiAoIV8uaXNCb29sZWFuKHZhbHVlKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdpbmNsdWRlRGF0YSBtdXN0IGJlIGEgQm9vbGVhbi4nKTtcbiAgICAgIH1cblxuICAgICAgLy8gQ29udmVydCB0aGUgdmFsdWUgdG8gYSBzdHJpbmdcbiAgICAgIHJlYWxRdWVyeVBhcmFtc1trZXldID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoKGtleSA9PT0gJ3N0YXJ0VGltZScgfHwga2V5ID09PSAnZW5kVGltZScpICYmICFfLmlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIC8vIENvbnZlcnQgdGhlIHZhbHVlIHRvIGEgdGltZXN0YW1wIHN0cmluZ1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVhbFF1ZXJ5UGFyYW1zW2tleV0gPSB1dGlscy5kYXRlVG9UaW1lc3RhbXAodmFsdWUpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIC8vIFVzZSBvdXIgbW9yZSBzcGVjaWZpYyBlcnJvciBtZXNzYWdlXG4gICAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBUeXBlRXJyb3IgJiYgZXJyLm1lc3NhZ2UuaW5kZXhPZignbXVzdCBiZSBhIERhdGUuJykgPiAtMSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3Ioa2V5ICsgJyBtdXN0IGJlIGEgRGF0ZS4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmVhbFF1ZXJ5UGFyYW1zW2tleV0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgfSk7XG5cbiAgdGhpcy5tYWtlUmVxdWVzdCgnL3ZlaGljbGUvJyArIHZlaGljbGVJZCArICcvdHJpcCcsICdnZXQnLCBjYiwgcmVhbFF1ZXJ5UGFyYW1zKTtcblxufTtcblxuLyoqXG4gKiBNYWtlcyBhbiBBUEkgcmVxdWVzdCBhbmQgY2FsbHMgdGhlIGNhbGxiYWNrIHdpdGggdGhlIHJlc3BvbnNlIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYXBpUGF0aCAtIFRoZSB1cmwgcGF0aCBmb3IgdGhlIHJlcXVlc3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2QgLSBUaGUgaHR0cCBtZXRob2RcbiAqIEBwYXJhbSB7bW9kdWxlOmNhcnZveWFudC9jbGllbnR+cmVzcG9uc2VDYWxsYmFja30gY2IgLSBUaGUgY2FsbGJhY2tcbiAqIEBwYXJhbSB7b2JqZWN0fSBbZGF0YV0gLSBUaGUgZGF0YSB0byBiZSBzdWJtaXR0ZWQgdG8gdGhlIEFQSS4gIChBUEkgc3BlY2lmaWMgcGFyYW1ldGVycywgcGFnaW5hdGlvbiBwYXJhbWV0ZXJzIGFuZFxuICogICAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRpbmcgcGFyYW1ldGVycy4gIFNpbmNlIGEgZmV3IGRpZmZlcmVudCBmdW5jdGlvbnMgc3VwcG9ydCB0aGUgcGFnaW5hdGlvbiBhbmQvb3Igc29ydGluZ1xuICogICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5IHBhcmFtZXRlcnMsIHRoZXkgYXJlIGRvY3VtZW50ZWQgaGVyZS4pXG4gKiBAcGFyYW0ge251bWJlcn0gW2RhdGEuc2VhcmNoTGltaXRdIC0gU3BlY2lmeSBob3cgbWFueSByZXN1bHRzIGFyZSBpbmNsdWRlZCBpbiB0aGUgcmVzcG9uc2VcbiAqIEBwYXJhbSB7bnVtYmVyfSBbZGF0YS5zZWFyY2hPZmZzZXRdIC0gU3BlY2lmeSB0aGUgb2Zmc2V0IGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgZGF0YSBzZXQgdGhhdCBpcyByZXR1cm5lZFxuICogQHBhcmFtIHtzdHJpbmd9IFtkYXRhLnNvcnRPcmRlcl0gLSBTcGVjaWZ5IHRoZSBzb3J0IG9yZGVyIChFaXRoZXIgYGFzY2Agb3IgYGRlc2NgIHRvIHNvcnQgdGhlIHJlc3BvbnNlIGl0ZW1zXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzY2VuZGluZyBvciBkZXNjZW5kaW5nIHJlc3BlY3RpdmVseS4pXG4gKlxuICogQGZ1bmN0aW9uIENsaWVudCNtYWtlUmVxdWVzdFxuICovXG5DbGllbnQucHJvdG90eXBlLm1ha2VSZXF1ZXN0ID0gZnVuY3Rpb24gKGFwaVBhdGgsIG1ldGhvZCwgY2IsIGRhdGEpIHtcblxuICB2YXIgciA9IHJlcXVlc3RbbWV0aG9kICE9PSAnZGVsZXRlJyA/IG1ldGhvZCA6ICdkZWwnXSh0aGlzLmFwaVVybCArIGFwaVBhdGgpLmF1dGgodGhpcy5hcGlLZXksIHRoaXMuc2VjdXJpdHlUb2tlbilcbiAgICAsIHNvcnRPcmRlcnMgPSBbJ2FzYycsICdkZXNjJ107XG5cbiAgaWYgKCFfLmlzVW5kZWZpbmVkKGNiKSAmJiAhXy5pc051bGwoY2IpICYmICFfLmlzRnVuY3Rpb24oY2IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2IgbXVzdCBiZSBhIEZ1bmN0aW9uLicpO1xuICB9XG5cbiAgLy8gRGVmYXVsdCB0byBhbiBlbXB0eSBvcHRpb25zXG4gIGRhdGEgPSBkYXRhIHx8IHt9O1xuXG4gIF8uZWFjaChkYXRhLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuXG4gICAgdmFyIGRhdGFJdGVtID0ge307XG5cbiAgICAvLyBEbyBub3QgdGhyb3cgdW5kZWZpbmVkIGl0ZW1zIGludG8gdGhlIGRhdGFJdGVtIHBhcmFtdGVyc1xuICAgIGlmIChfLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChrZXkgPT09ICdzb3J0T3JkZXInICYmICFfLmNvbnRhaW5zKHNvcnRPcmRlcnMsIHZhbHVlKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihrZXkgKyAnIG11c3QgYmUgb25lIG9mIHRoZSBmb2xsb3dpbmc6ICcgKyBzb3J0T3JkZXJzLmpvaW4oJywgJykpO1xuICAgIH0gZWxzZSBpZiAoKGtleSA9PT0gJ3NlYXJjaExpbWl0JyB8fCBrZXkgPT09ICdzZWFyY2hPZmZzZXQnKSAmJiAhXy5pc051bWJlcih2YWx1ZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3Ioa2V5ICsgJyBtdXN0IGJlIGEgTnVtYmVyLicpO1xuICAgIH1cblxuICAgIGRhdGFJdGVtW2tleV0gPSB2YWx1ZTtcblxuICAgIC8vIFRPRE86IFNob3VsZCB3ZSB1c2UgcXVlcnkgZm9yIEdFVCBhbmQgc2VuZCBmb3IgZXZlcnl0aGluZyBlbHNlP1xuICAgIGlmKG1ldGhvZC50b1VwcGVyQ2FzZSgpID09PSAnUE9TVCcpIHtcbiAgICAgIHIuc2VuZChkYXRhSXRlbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHIucXVlcnkoZGF0YUl0ZW0pO1xuICAgIH1cblxuICB9KTtcblxuICByLmVuZChmdW5jdGlvbiAocmVzKSB7XG4gICAgaWYgKGNiKSB7XG4gICAgICBjYihyZXMpO1xuICAgIH1cbiAgfSk7XG5cbn07XG5cbi8qKlxuICogTWFrZXMgYW4gQVBJIHJlcXVlc3QgYmFzZWQgb24gYW4gYWN0aW9uIGluIHRoZSBwYXNzZWQgaW4gcmVzcG9uc2Ugb2JqZWN0IGFuZCBjYWxscyB0aGUgY2FsbGJhY2sgd2l0aCB0aGUgcmVzcG9uc2VcbiAqIG9iamVjdC5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwOi8vY29uZmx1ZW5jZS5jYXJ2b3lhbnQuY29tL2Rpc3BsYXkvUFVCREVWL0pTT04rU3VjY2VzcytSZXNwb25zZStGb3JtYXR9XG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHJlcyAtIFRoZSBbU3VwZXJhZ2VudF0oaHR0cDovL3Zpc2lvbm1lZGlhLmdpdGh1Yi5pby9zdXBlcmFnZW50LyNyZXNwb25zZS1wcm9wZXJ0aWVzKSByZXNwb25zZSBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBhY3Rpb24gLSBUaGUgYWN0aW9uIGluIHRoZSBwYXNzZWQgaW4gcmVzcG9uc2UgdG8gaW52b2tlXG4gKiBAcGFyYW0ge21vZHVsZTpjYXJ2b3lhbnQvY2xpZW50fnJlc3BvbnNlQ2FsbGJhY2t9IGNiIC0gVGhlIGNhbGxiYWNrXG4gKlxuICogQGZ1bmN0aW9uIENsaWVudCNtYWtlQWN0aW9uUmVxdWVzdFxuICovXG5DbGllbnQucHJvdG90eXBlLm1ha2VBY3Rpb25SZXF1ZXN0ID0gZnVuY3Rpb24gKHJlcywgYWN0aW9uLCBjYikge1xuXG4gIC8vIFN1cGVyYWdlbnQgYXBwZWFycyB0byB1c2UgZGlmZmVyZW50IHZhcmlhYmxlcyBmb3IgdGhlIHBhdGgvdXJsIGJhc2VkIG9uIHRoZSBKYXZhU2NyaXB0IGVudmlyb25tZW50OlxuICAvLyAgIGJyb3dzZXI6IHJlcy5yZXEudXJsIChUaGUgZnVsbCBVUkwgb2YgdGhlIHJlcXVlc3QpXG4gIC8vICAgTm9kZS5qczogcmVzLnJlcS5wYXRoIChUaGUgcGF0aCBwb3J0aW9uIG9mIHRoZSByZXF1ZXN0KVxuICB2YXIgcGF0aCA9IF8uaXNVbmRlZmluZWQocmVzLnJlcS5wYXRoKSA/XG4gICAgcmVzLnJlcS51cmwucmVwbGFjZSh0aGlzLmFwaVVybCwgJycpIDpcbiAgICByZXMucmVxLnBhdGg7XG5cbiAgdGhpcy5tYWtlUmVxdWVzdChwYXRoLnJlcGxhY2UoJy9hcGknLCAnJykuc3BsaXQoJz8nKVswXSwgcmVzLnJlcS5tZXRob2QudG9Mb3dlckNhc2UoKSwgY2IsXG4gICAgICAgICAgICAgICAgICAgdXRpbHMuYWN0aW9uUXVlcnlQYXJhbXMocmVzLCBhY3Rpb24pKTtcblxufTtcblxuXG4vKipcbiAqIE1ha2UgYSBzdWJzZXF1ZW50IHJlcXVlc3QgYmFzZWQgb24gdGhlIHJlc3BvbnNlIHBhc3NlZCBpbiBmb3IgdGhlIG5leHQgcGFnZSBvZiByZXN1bHRzLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHA6Ly9jb25mbHVlbmNlLmNhcnZveWFudC5jb20vZGlzcGxheS9QVUJERVYvU29ydGluZythbmQrUGFnaW5nfVxuICogQHNlZSB7QGxpbmsgaHR0cDovL2NvbmZsdWVuY2UuY2Fydm95YW50LmNvbS9kaXNwbGF5L1BVQkRFVi9KU09OK1N1Y2Nlc3MrUmVzcG9uc2UrRm9ybWF0fVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSByZXMgLSBUaGUgW1N1cGVyYWdlbnRdKGh0dHA6Ly92aXNpb25tZWRpYS5naXRodWIuaW8vc3VwZXJhZ2VudC8jcmVzcG9uc2UtcHJvcGVydGllcykgcmVzcG9uc2Ugb2JqZWN0XG4gKiBAcGFyYW0ge21vZHVsZTpjYXJ2b3lhbnQvY2xpZW50fnJlc3BvbnNlQ2FsbGJhY2t9IGNiIC0gVGhlIGNhbGxiYWNrXG4gKi9cbkNsaWVudC5wcm90b3R5cGUubmV4dFBhZ2UgPSBmdW5jdGlvbiAocmVzLCBjYikge1xuXG4gIHRoaXMubWFrZUFjdGlvblJlcXVlc3QocmVzLCAnbmV4dCcsIGNiKTtcblxufTtcblxuLyoqXG4gKiBNYWtlIGEgc3Vic2VxdWVudCByZXF1ZXN0IGJhc2VkIG9uIHRoZSByZXNwb25zZSBwYXNzZWQgaW4gZm9yIHRoZSBwcmV2aW91cyBwYWdlIG9mIHJlc3VsdHMuXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cDovL2NvbmZsdWVuY2UuY2Fydm95YW50LmNvbS9kaXNwbGF5L1BVQkRFVi9Tb3J0aW5nK2FuZCtQYWdpbmd9XG4gKiBAc2VlIHtAbGluayBodHRwOi8vY29uZmx1ZW5jZS5jYXJ2b3lhbnQuY29tL2Rpc3BsYXkvUFVCREVWL0pTT04rU3VjY2VzcytSZXNwb25zZStGb3JtYXR9XG4gKlxuICogQHBhcmFtIHtvYmplY3R9IHJlcyAtIFRoZSBbU3VwZXJhZ2VudF0oaHR0cDovL3Zpc2lvbm1lZGlhLmdpdGh1Yi5pby9zdXBlcmFnZW50LyNyZXNwb25zZS1wcm9wZXJ0aWVzKSByZXNwb25zZSBvYmplY3RcbiAqIEBwYXJhbSB7bW9kdWxlOmNhcnZveWFudC9jbGllbnR+cmVzcG9uc2VDYWxsYmFja30gY2IgLSBUaGUgY2FsbGJhY2tcbiAqL1xuQ2xpZW50LnByb3RvdHlwZS5wcmV2UGFnZSA9IGZ1bmN0aW9uIChyZXMsIGNiKSB7XG5cbiAgdGhpcy5tYWtlQWN0aW9uUmVxdWVzdChyZXMsICdwcmV2aW91cycsIGNiKTtcblxufTtcblxuZXhwb3J0cy5DbGllbnQgPSBDbGllbnQ7XG5leHBvcnRzLmNyZWF0ZUNsaWVudCA9IGNyZWF0ZUNsaWVudDtcbiIsIi8qKiBAbW9kdWxlIGNhcnZveWFudC91dGlscyAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0ge1xuICAgIGNvbnRhaW5zOiByZXF1aXJlKCdsb2Rhc2guY29udGFpbnMnKSxcbiAgICBlYWNoOiByZXF1aXJlKCdsb2Rhc2guZm9yZWFjaCcpLFxuICAgIGZpbmQ6IHJlcXVpcmUoJ2xvZGFzaC5maW5kJyksXG4gICAgaXNEYXRlOiByZXF1aXJlKCdsb2Rhc2guaXNkYXRlJyksXG4gICAgaXNGdW5jdGlvbjogcmVxdWlyZSgnbG9kYXNoLmlzZnVuY3Rpb24nKSxcbiAgICBpc09iamVjdDogcmVxdWlyZSgnbG9kYXNoLmlzb2JqZWN0JyksXG4gICAgaXNTdHJpbmc6IHJlcXVpcmUoJ2xvZGFzaC5pc3N0cmluZycpLFxuICAgIGlzVW5kZWZpbmVkOiByZXF1aXJlKCdsb2Rhc2guaXN1bmRlZmluZWQnKVxuICB9XG4gICwgZXZlbnRTdWJzY3JpcHRpb25UeXBlTWFwID0ge1xuICAgIEdFT0ZFTkNFOiAnZ2VvRmVuY2UnLFxuICAgIExPV0JBVFRFUlk6ICdsb3dCYXR0ZXJ5JyxcbiAgICBOVU1FUklDREFUQUtFWTogJ251bWVyaWNEYXRhS2V5JyxcbiAgICBUSU1FT0ZEQVk6ICd0aW1lT2ZEYXknLFxuICAgIFRST1VCTEVDT0RFOiAndHJvdWJsZUNvZGUnXG4gIH07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgcmVxdWlyZWQgcXVlcnkgcGFyYW1ldGVycyB0byBtYWtlIGEgZm9sbG93LXVwIHJlcXVlc3QgZm9yIGEgZ2l2ZW4gYWN0aW9uLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHA6Ly9jb25mbHVlbmNlLmNhcnZveWFudC5jb20vZGlzcGxheS9QVUJERVYvSlNPTitTdWNjZXNzK1Jlc3BvbnNlK0Zvcm1hdH1cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gcmVzIC0gVGhlIFtTdXBlcmFnZW50XShodHRwOi8vdmlzaW9ubWVkaWEuZ2l0aHViLmlvL3N1cGVyYWdlbnQvI3Jlc3BvbnNlLXByb3BlcnRpZXMpIHJlc3BvbnNlIG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IGFjdGlvbk5hbWUgLSBUaGUgYWN0aW9uIHRvIHJldHJpZXZlIHRoZSBkZXRhaWxzIGZvclxuICovXG5leHBvcnRzLmFjdGlvblF1ZXJ5UGFyYW1zID0gZnVuY3Rpb24gKHJlcywgYWN0aW9uTmFtZSkge1xuXG4gIHZhciBxdWVyeVBhcmFtc1RvQ29udmVydCA9IHtcbiAgICAgIGJvb2xlYW5zOiBbXG4gICAgICAgICdpbmNsdWRlRGF0YSdcbiAgICAgIF0sXG4gICAgICB0aW1lc3RhbXBzOiBbXG4gICAgICAgICdlbmRUaW1lJyxcbiAgICAgICAgJ3N0YXJ0VGltZSdcbiAgICAgIF0sXG4gICAgICBudW1iZXJzOiBbXG4gICAgICAgICdzZWFyY2hMaW1pdCcsXG4gICAgICAgICdzZWFyY2hPZmZzZXQnXG4gICAgICBdXG4gICAgfVxuICAgICwgcXVlcnlQYXJhbXMgPSB7fVxuICAgICwgYWN0aW9uO1xuXG4gIGlmIChfLmlzVW5kZWZpbmVkKGFjdGlvbk5hbWUpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYWN0aW9uTmFtZSBtdXN0IGJlIGRlZmluZWQuJyk7XG4gIH0gZWxzZSBpZiAoIV8uaXNTdHJpbmcoYWN0aW9uTmFtZSkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdhY3Rpb25OYW1lIG11c3QgYmUgYSBTdHJpbmcuJyk7XG4gIH1cblxuICBpZiAoXy5pc1VuZGVmaW5lZChyZXMpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncmVzIG11c3QgYmUgZGVmaW5lZC4nKTtcbiAgfSBlbHNlIGlmICghXy5pc09iamVjdChyZXMpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigncmVzIG11c3QgYmUgYW4gT2JqZWN0LicpO1xuICB9XG5cbiAgYWN0aW9uID0gXy5maW5kKHJlcy5ib2R5LmFjdGlvbnMsIGZ1bmN0aW9uIChhY3Rpb25PYmopIHtcbiAgICByZXR1cm4gYWN0aW9uT2JqLm5hbWUgPT09IGFjdGlvbk5hbWU7XG4gIH0pO1xuXG4gIGlmIChfLmlzVW5kZWZpbmVkKGFjdGlvbikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdObyBhY3Rpb24gZm91bmQgZm9yIG5hbWU6ICcgKyBhY3Rpb25OYW1lKTtcbiAgfVxuXG4gIF8uZWFjaCgoYWN0aW9uLnVyaS5pbmRleE9mKCc/JykgPiAtMSA/IGFjdGlvbi51cmkuc3BsaXQoJz8nKVsxXSA6ICcnKS5zcGxpdCgnIycpWzBdLnNwbGl0KCcmJyksIGZ1bmN0aW9uIChwYXJhbSkge1xuICAgIHZhciBwYXJhbVBhcnRzID0gcGFyYW0uc3BsaXQoJz0nKVxuICAgICAgLCBrZXkgPSBkZWNvZGVVUklDb21wb25lbnQocGFyYW1QYXJ0c1swXS5yZXBsYWNlKC9cXCsvZywgJyAnKSlcbiAgICAgICwgdmFsdWUgPSBwYXJhbVBhcnRzLmxlbmd0aCA9PT0gMiA/IGRlY29kZVVSSUNvbXBvbmVudChwYXJhbVBhcnRzWzFdLnJlcGxhY2UoL1xcKy9nLCAnICcpKSA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChfLmNvbnRhaW5zKHF1ZXJ5UGFyYW1zVG9Db252ZXJ0LmJvb2xlYW5zLCBrZXkpKSB7XG4gICAgICBpZiAodmFsdWUgPT09ICd0cnVlJykge1xuICAgICAgICBxdWVyeVBhcmFtc1trZXldID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXJ5UGFyYW1zW2tleV0gPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKF8uY29udGFpbnMocXVlcnlQYXJhbXNUb0NvbnZlcnQudGltZXN0YW1wcywga2V5KSkge1xuICAgICAgLy8gRm9yIHNvbWUgcmVhc29uLCByZXR1cm5lZCB0aW1lc3RhbXBzIGFyZSByZWFsIElTTyA4NjAxIHN0cmluZ3NcbiAgICAgIHF1ZXJ5UGFyYW1zW2tleV0gPSBleHBvcnRzLmRhdGVUb1RpbWVzdGFtcChuZXcgRGF0ZSh2YWx1ZSkpO1xuICAgIH0gZWxzZSBpZiAoXy5jb250YWlucyhxdWVyeVBhcmFtc1RvQ29udmVydC5udW1iZXJzLCBrZXkpKSB7XG4gICAgICBxdWVyeVBhcmFtc1trZXldID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIERvIHR5cGUgY29udmVyc2lvblxuXG4gIHJldHVybiBxdWVyeVBhcmFtcztcblxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEge0BleHRlcm5hbCBEYXRlfSBiYXNlZCBvbiB0aGUgdGltZXN0YW1wIHN0cmluZyBwYXNzZWQgaW4uXG4gKlxuICogQHNlZSB7QGxpbmsgaHR0cDovL2NvbmZsdWVuY2UuY2Fydm95YW50LmNvbS9kaXNwbGF5L1BVQkRFVi9EYXRlVGltZX1cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdGltZXN0YW1wIC0gVGhlIHRpbWVzdGFtcCBzdHJpbmcgKEZvcm1hdDogeXl5eU1NZGRUSEhtbXNzWilcbiAqL1xuZXhwb3J0cy50aW1lc3RhbXBUb0RhdGUgPSBmdW5jdGlvbiAodGltZXN0YW1wKSB7XG5cbiAgaWYgKF8uaXNVbmRlZmluZWQodGltZXN0YW1wKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RpbWVzdGFtcCBtdXN0IGJlIGRlZmluZWQuJyk7XG4gIH0gZWxzZSBpZiAoIV8uaXNTdHJpbmcodGltZXN0YW1wKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3RpbWVzdGFtcCBtdXN0IGJlIGEgU3RyaW5nLicpO1xuICB9XG5cbiAgdmFyIG1hdGNoID0gL14oXFxkezR9KShcXGR7Mn0pKFxcZHsyfSlUKFxcZHsyfSkoXFxkezJ9KShcXGR7Mn0pKFsrLV0pKFxcZHs0fSkvLmV4ZWModGltZXN0YW1wKTtcblxuICBpZiAoIW1hdGNoKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndGltZXN0YW1wIGRpZCBub3QgbWF0Y2ggZXhwZWN0ZWQgZm9ybWF0ICh5eXl5TU1kZFRISG1tc3NaKS4nKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgRGF0ZShtYXRjaFsxXSArICctJyArIG1hdGNoWzJdICsgJy0nICsgbWF0Y2hbM10gKyAnVCcgKyBtYXRjaFs0XSArICc6JyArIG1hdGNoWzVdICsgJzonICsgbWF0Y2hbNl0gK1xuICAgICAgICAgICAgICAgICAgbWF0Y2hbN10gKyBtYXRjaFs4XSk7XG5cbn07XG5cbi8qKlxuICogUmV0dXJucyBhIGZvcm1hdHRlZCB0aW1lc3RhbXAge0BleHRlcm5hbCBTdHJpbmd9LlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHA6Ly9jb25mbHVlbmNlLmNhcnZveWFudC5jb20vZGlzcGxheS9QVUJERVYvRGF0ZVRpbWV9XG4gKlxuICogQHBhcmFtIHtkYXRlfSBkYXRlIC0gVGhlIGRhdGUgb2JqZWN0IHRvIGNvbnZlcnQgdG8gYSB0aW1lc3RhbXAgc3RyaW5nXG4gKi9cbmV4cG9ydHMuZGF0ZVRvVGltZXN0YW1wID0gZnVuY3Rpb24gKGRhdGUpIHtcblxuICBpZiAoXy5pc1VuZGVmaW5lZChkYXRlKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2RhdGUgbXVzdCBiZSBkZWZpbmVkLicpO1xuICB9IGVsc2UgaWYgKCFfLmlzRGF0ZShkYXRlKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2RhdGUgbXVzdCBiZSBhIERhdGUuJyk7XG4gIH1cblxuICB2YXIgbFBhZCA9IGZ1bmN0aW9uIChudW0pIHtcbiAgICAgIHJldHVybiBudW0gPCAxMCA/ICcwJyArIG51bSA6IG51bS50b1N0cmluZygpO1xuICAgIH1cbiAgICAsIHR6SG91cnMgPSBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCkgLyA2MFxuICAgICwgdHpNaW5zID0gZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpICUgNjA7XG5cbiAgcmV0dXJuIFtcbiAgICBkYXRlLmdldEZ1bGxZZWFyKCksXG4gICAgbFBhZChkYXRlLmdldE1vbnRoKCkgKyAxKSxcbiAgICBsUGFkKGRhdGUuZ2V0RGF0ZSgpKSxcbiAgICAnVCcsXG4gICAgbFBhZChkYXRlLmdldEhvdXJzKCkpLFxuICAgIGxQYWQoZGF0ZS5nZXRNaW51dGVzKCkpLFxuICAgIGxQYWQoZGF0ZS5nZXRTZWNvbmRzKCkpLFxuICAgIGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKSA+IDAgPyAnLScgOiAnKycsXG4gICAgbFBhZCh0ekhvdXJzKSArIGxQYWQodHpNaW5zKVxuICBdLmpvaW4oJycpO1xuXG59O1xuXG4vKipcbiAqIEV4dGVybmFsaXplIGV2ZW50IHN1YnNjcmlwdGlvbiB0eXBlLiAgKElmIHVuYWJsZSB0byBleHRlcm5hbGl6ZSwgcmV0dXJuIHRoZSBwYXNzZWQgaW4gdmFsdWUuKVxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHA6Ly9jb25mbHVlbmNlLmNhcnZveWFudC5jb20vZGlzcGxheS9QVUJERVYvRXZlbnRTdWJzY3JpcHRpb259XG4gKlxuICogTm90ZTogVGhlIGludGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBldmVudCBzdWJzY3JpcHRpb24gdHlwZSBpcyBub3QgdGhlIHNhbWUgdmFsdWUgdGhhdCBpcyB1c2VkIGluIHRoZSBVUkxzLlxuICogICAgICAgd2UgaGF2ZSB0byBjb252ZXJ0IHRoZXNlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFN1YnNjcmlwdGlvblR5cGUgLSBUaGUgZXZlbnQgc3Vic2NyaXB0aW9uIHR5cGVcbiAqL1xuZXhwb3J0cy5leHRlcm5hbGl6ZUV2ZW50U3Vic2NyaXB0aW9uVHlwZSA9IGZ1bmN0aW9uIChldmVudFN1YnNjcmlwdGlvblR5cGUpIHtcblxuICB2YXIgZXh0ZXJuYWxUeXBlID0gZXZlbnRTdWJzY3JpcHRpb25UeXBlTWFwW2V2ZW50U3Vic2NyaXB0aW9uVHlwZV07XG5cbiAgcmV0dXJuIGV4dGVybmFsVHlwZSA/IGV4dGVybmFsVHlwZSA6IGV4dGVybmFsVHlwZTtcblxufTtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjMuMCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgYmFzZUNyZWF0ZUNhbGxiYWNrID0gcmVxdWlyZSgnbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2snKSxcbiAgICBrZXlzID0gcmVxdWlyZSgnbG9kYXNoLmtleXMnKSxcbiAgICBvYmplY3RUeXBlcyA9IHJlcXVpcmUoJ2xvZGFzaC5fb2JqZWN0dHlwZXMnKTtcblxuLyoqXG4gKiBBc3NpZ25zIG93biBlbnVtZXJhYmxlIHByb3BlcnRpZXMgb2Ygc291cmNlIG9iamVjdChzKSB0byB0aGUgZGVzdGluYXRpb25cbiAqIG9iamVjdC4gU3Vic2VxdWVudCBzb3VyY2VzIHdpbGwgb3ZlcndyaXRlIHByb3BlcnR5IGFzc2lnbm1lbnRzIG9mIHByZXZpb3VzXG4gKiBzb3VyY2VzLiBJZiBhIGNhbGxiYWNrIGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgZXhlY3V0ZWQgdG8gcHJvZHVjZSB0aGVcbiAqIGFzc2lnbmVkIHZhbHVlcy4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHR3b1xuICogYXJndW1lbnRzOyAob2JqZWN0VmFsdWUsIHNvdXJjZVZhbHVlKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHR5cGUgRnVuY3Rpb25cbiAqIEBhbGlhcyBleHRlbmRcbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0gey4uLk9iamVjdH0gW3NvdXJjZV0gVGhlIHNvdXJjZSBvYmplY3RzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NhbGxiYWNrXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGFzc2lnbmluZyB2YWx1ZXMuXG4gKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5hc3NpZ24oeyAnbmFtZSc6ICdmcmVkJyB9LCB7ICdlbXBsb3llcic6ICdzbGF0ZScgfSk7XG4gKiAvLyA9PiB7ICduYW1lJzogJ2ZyZWQnLCAnZW1wbG95ZXInOiAnc2xhdGUnIH1cbiAqXG4gKiB2YXIgZGVmYXVsdHMgPSBfLnBhcnRpYWxSaWdodChfLmFzc2lnbiwgZnVuY3Rpb24oYSwgYikge1xuICogICByZXR1cm4gdHlwZW9mIGEgPT0gJ3VuZGVmaW5lZCcgPyBiIDogYTtcbiAqIH0pO1xuICpcbiAqIHZhciBvYmplY3QgPSB7ICduYW1lJzogJ2Jhcm5leScgfTtcbiAqIGRlZmF1bHRzKG9iamVjdCwgeyAnbmFtZSc6ICdmcmVkJywgJ2VtcGxveWVyJzogJ3NsYXRlJyB9KTtcbiAqIC8vID0+IHsgJ25hbWUnOiAnYmFybmV5JywgJ2VtcGxveWVyJzogJ3NsYXRlJyB9XG4gKi9cbnZhciBhc3NpZ24gPSBmdW5jdGlvbihvYmplY3QsIHNvdXJjZSwgZ3VhcmQpIHtcbiAgdmFyIGluZGV4LCBpdGVyYWJsZSA9IG9iamVjdCwgcmVzdWx0ID0gaXRlcmFibGU7XG4gIGlmICghaXRlcmFibGUpIHJldHVybiByZXN1bHQ7XG4gIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgYXJnc0luZGV4ID0gMCxcbiAgICAgIGFyZ3NMZW5ndGggPSB0eXBlb2YgZ3VhcmQgPT0gJ251bWJlcicgPyAyIDogYXJncy5sZW5ndGg7XG4gIGlmIChhcmdzTGVuZ3RoID4gMyAmJiB0eXBlb2YgYXJnc1thcmdzTGVuZ3RoIC0gMl0gPT0gJ2Z1bmN0aW9uJykge1xuICAgIHZhciBjYWxsYmFjayA9IGJhc2VDcmVhdGVDYWxsYmFjayhhcmdzWy0tYXJnc0xlbmd0aCAtIDFdLCBhcmdzW2FyZ3NMZW5ndGgtLV0sIDIpO1xuICB9IGVsc2UgaWYgKGFyZ3NMZW5ndGggPiAyICYmIHR5cGVvZiBhcmdzW2FyZ3NMZW5ndGggLSAxXSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgY2FsbGJhY2sgPSBhcmdzWy0tYXJnc0xlbmd0aF07XG4gIH1cbiAgd2hpbGUgKCsrYXJnc0luZGV4IDwgYXJnc0xlbmd0aCkge1xuICAgIGl0ZXJhYmxlID0gYXJnc1thcmdzSW5kZXhdO1xuICAgIGlmIChpdGVyYWJsZSAmJiBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdKSB7XG4gICAgdmFyIG93bkluZGV4ID0gLTEsXG4gICAgICAgIG93blByb3BzID0gb2JqZWN0VHlwZXNbdHlwZW9mIGl0ZXJhYmxlXSAmJiBrZXlzKGl0ZXJhYmxlKSxcbiAgICAgICAgbGVuZ3RoID0gb3duUHJvcHMgPyBvd25Qcm9wcy5sZW5ndGggOiAwO1xuXG4gICAgd2hpbGUgKCsrb3duSW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIGluZGV4ID0gb3duUHJvcHNbb3duSW5kZXhdO1xuICAgICAgcmVzdWx0W2luZGV4XSA9IGNhbGxiYWNrID8gY2FsbGJhY2socmVzdWx0W2luZGV4XSwgaXRlcmFibGVbaW5kZXhdKSA6IGl0ZXJhYmxlW2luZGV4XTtcbiAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzaWduO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuMy4wIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBiaW5kID0gcmVxdWlyZSgnbG9kYXNoLmJpbmQnKSxcbiAgICBpZGVudGl0eSA9IHJlcXVpcmUoJ2xvZGFzaC5pZGVudGl0eScpLFxuICAgIHNldEJpbmREYXRhID0gcmVxdWlyZSgnbG9kYXNoLl9zZXRiaW5kZGF0YScpLFxuICAgIHN1cHBvcnQgPSByZXF1aXJlKCdsb2Rhc2guc3VwcG9ydCcpO1xuXG4vKiogVXNlZCB0byBkZXRlY3RlZCBuYW1lZCBmdW5jdGlvbnMgKi9cbnZhciByZUZ1bmNOYW1lID0gL15cXHMqZnVuY3Rpb25bIFxcblxcclxcdF0rXFx3LztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGZ1bmN0aW9ucyBjb250YWluaW5nIGEgYHRoaXNgIHJlZmVyZW5jZSAqL1xudmFyIHJlVGhpcyA9IC9cXGJ0aGlzXFxiLztcblxuLyoqIE5hdGl2ZSBtZXRob2Qgc2hvcnRjdXRzICovXG52YXIgZm5Ub1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5jcmVhdGVDYWxsYmFja2Agd2l0aG91dCBzdXBwb3J0IGZvciBjcmVhdGluZ1xuICogXCJfLnBsdWNrXCIgb3IgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IFtmdW5jPWlkZW50aXR5XSBUaGUgdmFsdWUgdG8gY29udmVydCB0byBhIGNhbGxiYWNrLlxuICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIHRoZSBjcmVhdGVkIGNhbGxiYWNrLlxuICogQHBhcmFtIHtudW1iZXJ9IFthcmdDb3VudF0gVGhlIG51bWJlciBvZiBhcmd1bWVudHMgdGhlIGNhbGxiYWNrIGFjY2VwdHMuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgYSBjYWxsYmFjayBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZUNyZWF0ZUNhbGxiYWNrKGZ1bmMsIHRoaXNBcmcsIGFyZ0NvdW50KSB7XG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGlkZW50aXR5O1xuICB9XG4gIC8vIGV4aXQgZWFybHkgZm9yIG5vIGB0aGlzQXJnYCBvciBhbHJlYWR5IGJvdW5kIGJ5IGBGdW5jdGlvbiNiaW5kYFxuICBpZiAodHlwZW9mIHRoaXNBcmcgPT0gJ3VuZGVmaW5lZCcgfHwgISgncHJvdG90eXBlJyBpbiBmdW5jKSkge1xuICAgIHJldHVybiBmdW5jO1xuICB9XG4gIHZhciBiaW5kRGF0YSA9IGZ1bmMuX19iaW5kRGF0YV9fO1xuICBpZiAodHlwZW9mIGJpbmREYXRhID09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHN1cHBvcnQuZnVuY05hbWVzKSB7XG4gICAgICBiaW5kRGF0YSA9ICFmdW5jLm5hbWU7XG4gICAgfVxuICAgIGJpbmREYXRhID0gYmluZERhdGEgfHwgIXN1cHBvcnQuZnVuY0RlY29tcDtcbiAgICBpZiAoIWJpbmREYXRhKSB7XG4gICAgICB2YXIgc291cmNlID0gZm5Ub1N0cmluZy5jYWxsKGZ1bmMpO1xuICAgICAgaWYgKCFzdXBwb3J0LmZ1bmNOYW1lcykge1xuICAgICAgICBiaW5kRGF0YSA9ICFyZUZ1bmNOYW1lLnRlc3Qoc291cmNlKTtcbiAgICAgIH1cbiAgICAgIGlmICghYmluZERhdGEpIHtcbiAgICAgICAgLy8gY2hlY2tzIGlmIGBmdW5jYCByZWZlcmVuY2VzIHRoZSBgdGhpc2Aga2V5d29yZCBhbmQgc3RvcmVzIHRoZSByZXN1bHRcbiAgICAgICAgYmluZERhdGEgPSByZVRoaXMudGVzdChzb3VyY2UpO1xuICAgICAgICBzZXRCaW5kRGF0YShmdW5jLCBiaW5kRGF0YSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vIGV4aXQgZWFybHkgaWYgdGhlcmUgYXJlIG5vIGB0aGlzYCByZWZlcmVuY2VzIG9yIGBmdW5jYCBpcyBib3VuZFxuICBpZiAoYmluZERhdGEgPT09IGZhbHNlIHx8IChiaW5kRGF0YSAhPT0gdHJ1ZSAmJiBiaW5kRGF0YVsxXSAmIDEpKSB7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH1cbiAgc3dpdGNoIChhcmdDb3VudCkge1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIHZhbHVlKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICB9O1xuICAgIGNhc2UgNDogcmV0dXJuIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgIHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgfTtcbiAgfVxuICByZXR1cm4gYmluZChmdW5jLCB0aGlzQXJnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQ3JlYXRlQ2FsbGJhY2s7XG4iLCIvKipcbiAqIExvLURhc2ggMi4zLjAgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIG5vb3AgPSByZXF1aXJlKCdsb2Rhc2gubm9vcCcpLFxuICAgIHJlTmF0aXZlID0gcmVxdWlyZSgnbG9kYXNoLl9yZW5hdGl2ZScpO1xuXG4vKiogVXNlZCBhcyB0aGUgcHJvcGVydHkgZGVzY3JpcHRvciBmb3IgYF9fYmluZERhdGFfX2AgKi9cbnZhciBkZXNjcmlwdG9yID0ge1xuICAnY29uZmlndXJhYmxlJzogZmFsc2UsXG4gICdlbnVtZXJhYmxlJzogZmFsc2UsXG4gICd2YWx1ZSc6IG51bGwsXG4gICd3cml0YWJsZSc6IGZhbHNlXG59O1xuXG4vKiogVXNlZCB0byBzZXQgbWV0YSBkYXRhIG9uIGZ1bmN0aW9ucyAqL1xudmFyIGRlZmluZVByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICAvLyBJRSA4IG9ubHkgYWNjZXB0cyBET00gZWxlbWVudHNcbiAgdHJ5IHtcbiAgICB2YXIgbyA9IHt9LFxuICAgICAgICBmdW5jID0gcmVOYXRpdmUudGVzdChmdW5jID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KSAmJiBmdW5jLFxuICAgICAgICByZXN1bHQgPSBmdW5jKG8sIG8sIG8pICYmIGZ1bmM7XG4gIH0gY2F0Y2goZSkgeyB9XG4gIHJldHVybiByZXN1bHQ7XG59KCkpO1xuXG4vKipcbiAqIFNldHMgYHRoaXNgIGJpbmRpbmcgZGF0YSBvbiBhIGdpdmVuIGZ1bmN0aW9uLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBzZXQgZGF0YSBvbi5cbiAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlIFRoZSBkYXRhIGFycmF5IHRvIHNldC5cbiAqL1xudmFyIHNldEJpbmREYXRhID0gIWRlZmluZVByb3BlcnR5ID8gbm9vcCA6IGZ1bmN0aW9uKGZ1bmMsIHZhbHVlKSB7XG4gIGRlc2NyaXB0b3IudmFsdWUgPSB2YWx1ZTtcbiAgZGVmaW5lUHJvcGVydHkoZnVuYywgJ19fYmluZERhdGFfXycsIGRlc2NyaXB0b3IpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzZXRCaW5kRGF0YTtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjMuMCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGludGVybmFsIFtbQ2xhc3NdXSBvZiB2YWx1ZXMgKi9cbnZhciB0b1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlICovXG52YXIgcmVOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgU3RyaW5nKHRvU3RyaW5nKVxuICAgIC5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpXG4gICAgLnJlcGxhY2UoL3RvU3RyaW5nfCBmb3IgW15cXF1dKy9nLCAnLio/JykgKyAnJCdcbik7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVOYXRpdmU7XG4iLCIvKipcbiAqIExvLURhc2ggMi4zLjAgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKipcbiAqIEEgbm8tb3BlcmF0aW9uIGZ1bmN0aW9uLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICduYW1lJzogJ2ZyZWQnIH07XG4gKiBfLm5vb3Aob2JqZWN0KSA9PT0gdW5kZWZpbmVkO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBub29wKCkge1xuICAvLyBubyBvcGVyYXRpb24gcGVyZm9ybWVkXG59XG5cbm1vZHVsZS5leHBvcnRzID0gbm9vcDtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjMuMCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgY3JlYXRlV3JhcHBlciA9IHJlcXVpcmUoJ2xvZGFzaC5fY3JlYXRld3JhcHBlcicpLFxuICAgIHJlTmF0aXZlID0gcmVxdWlyZSgnbG9kYXNoLl9yZW5hdGl2ZScpLFxuICAgIHNsaWNlID0gcmVxdWlyZSgnbG9kYXNoLl9zbGljZScpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0LCB3aGVuIGNhbGxlZCwgaW52b2tlcyBgZnVuY2Agd2l0aCB0aGUgYHRoaXNgXG4gKiBiaW5kaW5nIG9mIGB0aGlzQXJnYCBhbmQgcHJlcGVuZHMgYW55IGFkZGl0aW9uYWwgYGJpbmRgIGFyZ3VtZW50cyB0byB0aG9zZVxuICogcHJvdmlkZWQgdG8gdGhlIGJvdW5kIGZ1bmN0aW9uLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25zXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBiaW5kLlxuICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBmdW5jYC5cbiAqIEBwYXJhbSB7Li4uKn0gW2FyZ10gQXJndW1lbnRzIHRvIGJlIHBhcnRpYWxseSBhcHBsaWVkLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYm91bmQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBmdW5jID0gZnVuY3Rpb24oZ3JlZXRpbmcpIHtcbiAqICAgcmV0dXJuIGdyZWV0aW5nICsgJyAnICsgdGhpcy5uYW1lO1xuICogfTtcbiAqXG4gKiBmdW5jID0gXy5iaW5kKGZ1bmMsIHsgJ25hbWUnOiAnZnJlZCcgfSwgJ2hpJyk7XG4gKiBmdW5jKCk7XG4gKiAvLyA9PiAnaGkgZnJlZCdcbiAqL1xuZnVuY3Rpb24gYmluZChmdW5jLCB0aGlzQXJnKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMlxuICAgID8gY3JlYXRlV3JhcHBlcihmdW5jLCAxNywgc2xpY2UoYXJndW1lbnRzLCAyKSwgbnVsbCwgdGhpc0FyZylcbiAgICA6IGNyZWF0ZVdyYXBwZXIoZnVuYywgMSwgbnVsbCwgbnVsbCwgdGhpc0FyZyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmluZDtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjMuMCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgYmFzZUJpbmQgPSByZXF1aXJlKCdsb2Rhc2guX2Jhc2ViaW5kJyksXG4gICAgYmFzZUNyZWF0ZVdyYXBwZXIgPSByZXF1aXJlKCdsb2Rhc2guX2Jhc2VjcmVhdGV3cmFwcGVyJyksXG4gICAgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJ2xvZGFzaC5pc2Z1bmN0aW9uJyk7XG5cbi8qKlxuICogVXNlZCBmb3IgYEFycmF5YCBtZXRob2QgcmVmZXJlbmNlcy5cbiAqXG4gKiBOb3JtYWxseSBgQXJyYXkucHJvdG90eXBlYCB3b3VsZCBzdWZmaWNlLCBob3dldmVyLCB1c2luZyBhbiBhcnJheSBsaXRlcmFsXG4gKiBhdm9pZHMgaXNzdWVzIGluIE5hcndoYWwuXG4gKi9cbnZhciBhcnJheVJlZiA9IFtdO1xuXG4vKiogTmF0aXZlIG1ldGhvZCBzaG9ydGN1dHMgKi9cbnZhciBwdXNoID0gYXJyYXlSZWYucHVzaDtcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBjYWxsZWQsIGVpdGhlciBjdXJyaWVzIG9yIGludm9rZXMgYGZ1bmNgXG4gKiB3aXRoIGFuIG9wdGlvbmFsIGB0aGlzYCBiaW5kaW5nIGFuZCBwYXJ0aWFsbHkgYXBwbGllZCBhcmd1bWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb258c3RyaW5nfSBmdW5jIFRoZSBmdW5jdGlvbiBvciBtZXRob2QgbmFtZSB0byByZWZlcmVuY2UuXG4gKiBAcGFyYW0ge251bWJlcn0gYml0bWFzayBUaGUgYml0bWFzayBvZiBtZXRob2QgZmxhZ3MgdG8gY29tcG9zZS5cbiAqICBUaGUgYml0bWFzayBtYXkgYmUgY29tcG9zZWQgb2YgdGhlIGZvbGxvd2luZyBmbGFnczpcbiAqICAxIC0gYF8uYmluZGBcbiAqICAyIC0gYF8uYmluZEtleWBcbiAqICA0IC0gYF8uY3VycnlgXG4gKiAgOCAtIGBfLmN1cnJ5YCAoYm91bmQpXG4gKiAgMTYgLSBgXy5wYXJ0aWFsYFxuICogIDMyIC0gYF8ucGFydGlhbFJpZ2h0YFxuICogQHBhcmFtIHtBcnJheX0gW3BhcnRpYWxBcmdzXSBBbiBhcnJheSBvZiBhcmd1bWVudHMgdG8gcHJlcGVuZCB0byB0aG9zZVxuICogIHByb3ZpZGVkIHRvIHRoZSBuZXcgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge0FycmF5fSBbcGFydGlhbFJpZ2h0QXJnc10gQW4gYXJyYXkgb2YgYXJndW1lbnRzIHRvIGFwcGVuZCB0byB0aG9zZVxuICogIHByb3ZpZGVkIHRvIHRoZSBuZXcgZnVuY3Rpb24uXG4gKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGZ1bmNgLlxuICogQHBhcmFtIHtudW1iZXJ9IFthcml0eV0gVGhlIGFyaXR5IG9mIGBmdW5jYC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBjcmVhdGVXcmFwcGVyKGZ1bmMsIGJpdG1hc2ssIHBhcnRpYWxBcmdzLCBwYXJ0aWFsUmlnaHRBcmdzLCB0aGlzQXJnLCBhcml0eSkge1xuICB2YXIgaXNCaW5kID0gYml0bWFzayAmIDEsXG4gICAgICBpc0JpbmRLZXkgPSBiaXRtYXNrICYgMixcbiAgICAgIGlzQ3VycnkgPSBiaXRtYXNrICYgNCxcbiAgICAgIGlzQ3VycnlCb3VuZCA9IGJpdG1hc2sgJiA4LFxuICAgICAgaXNQYXJ0aWFsID0gYml0bWFzayAmIDE2LFxuICAgICAgaXNQYXJ0aWFsUmlnaHQgPSBiaXRtYXNrICYgMzI7XG5cbiAgaWYgKCFpc0JpbmRLZXkgJiYgIWlzRnVuY3Rpb24oZnVuYykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICB9XG4gIGlmIChpc1BhcnRpYWwgJiYgIXBhcnRpYWxBcmdzLmxlbmd0aCkge1xuICAgIGJpdG1hc2sgJj0gfjE2O1xuICAgIGlzUGFydGlhbCA9IHBhcnRpYWxBcmdzID0gZmFsc2U7XG4gIH1cbiAgaWYgKGlzUGFydGlhbFJpZ2h0ICYmICFwYXJ0aWFsUmlnaHRBcmdzLmxlbmd0aCkge1xuICAgIGJpdG1hc2sgJj0gfjMyO1xuICAgIGlzUGFydGlhbFJpZ2h0ID0gcGFydGlhbFJpZ2h0QXJncyA9IGZhbHNlO1xuICB9XG4gIHZhciBiaW5kRGF0YSA9IGZ1bmMgJiYgZnVuYy5fX2JpbmREYXRhX187XG4gIGlmIChiaW5kRGF0YSAmJiBiaW5kRGF0YSAhPT0gdHJ1ZSkge1xuICAgIGJpbmREYXRhID0gYmluZERhdGEuc2xpY2UoKTtcblxuICAgIC8vIHNldCBgdGhpc0JpbmRpbmdgIGlzIG5vdCBwcmV2aW91c2x5IGJvdW5kXG4gICAgaWYgKGlzQmluZCAmJiAhKGJpbmREYXRhWzFdICYgMSkpIHtcbiAgICAgIGJpbmREYXRhWzRdID0gdGhpc0FyZztcbiAgICB9XG4gICAgLy8gc2V0IGlmIHByZXZpb3VzbHkgYm91bmQgYnV0IG5vdCBjdXJyZW50bHkgKHN1YnNlcXVlbnQgY3VycmllZCBmdW5jdGlvbnMpXG4gICAgaWYgKCFpc0JpbmQgJiYgYmluZERhdGFbMV0gJiAxKSB7XG4gICAgICBiaXRtYXNrIHw9IDg7XG4gICAgfVxuICAgIC8vIHNldCBjdXJyaWVkIGFyaXR5IGlmIG5vdCB5ZXQgc2V0XG4gICAgaWYgKGlzQ3VycnkgJiYgIShiaW5kRGF0YVsxXSAmIDQpKSB7XG4gICAgICBiaW5kRGF0YVs1XSA9IGFyaXR5O1xuICAgIH1cbiAgICAvLyBhcHBlbmQgcGFydGlhbCBsZWZ0IGFyZ3VtZW50c1xuICAgIGlmIChpc1BhcnRpYWwpIHtcbiAgICAgIHB1c2guYXBwbHkoYmluZERhdGFbMl0gfHwgKGJpbmREYXRhWzJdID0gW10pLCBwYXJ0aWFsQXJncyk7XG4gICAgfVxuICAgIC8vIGFwcGVuZCBwYXJ0aWFsIHJpZ2h0IGFyZ3VtZW50c1xuICAgIGlmIChpc1BhcnRpYWxSaWdodCkge1xuICAgICAgcHVzaC5hcHBseShiaW5kRGF0YVszXSB8fCAoYmluZERhdGFbM10gPSBbXSksIHBhcnRpYWxSaWdodEFyZ3MpO1xuICAgIH1cbiAgICAvLyBtZXJnZSBmbGFnc1xuICAgIGJpbmREYXRhWzFdIHw9IGJpdG1hc2s7XG4gICAgcmV0dXJuIGNyZWF0ZVdyYXBwZXIuYXBwbHkobnVsbCwgYmluZERhdGEpO1xuICB9XG4gIC8vIGZhc3QgcGF0aCBmb3IgYF8uYmluZGBcbiAgdmFyIGNyZWF0ZXIgPSAoYml0bWFzayA9PSAxIHx8IGJpdG1hc2sgPT09IDE3KSA/IGJhc2VCaW5kIDogYmFzZUNyZWF0ZVdyYXBwZXI7XG4gIHJldHVybiBjcmVhdGVyKFtmdW5jLCBiaXRtYXNrLCBwYXJ0aWFsQXJncywgcGFydGlhbFJpZ2h0QXJncywgdGhpc0FyZywgYXJpdHldKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVXcmFwcGVyO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuMy4wIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBiYXNlQ3JlYXRlID0gcmVxdWlyZSgnbG9kYXNoLl9iYXNlY3JlYXRlJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCdsb2Rhc2guaXNvYmplY3QnKSxcbiAgICBzZXRCaW5kRGF0YSA9IHJlcXVpcmUoJ2xvZGFzaC5fc2V0YmluZGRhdGEnKTtcblxuLyoqXG4gKiBVc2VkIGZvciBgQXJyYXlgIG1ldGhvZCByZWZlcmVuY2VzLlxuICpcbiAqIE5vcm1hbGx5IGBBcnJheS5wcm90b3R5cGVgIHdvdWxkIHN1ZmZpY2UsIGhvd2V2ZXIsIHVzaW5nIGFuIGFycmF5IGxpdGVyYWxcbiAqIGF2b2lkcyBpc3N1ZXMgaW4gTmFyd2hhbC5cbiAqL1xudmFyIGFycmF5UmVmID0gW107XG5cbi8qKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyAqL1xudmFyIHB1c2ggPSBhcnJheVJlZi5wdXNoO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmJpbmRgIHRoYXQgY3JlYXRlcyB0aGUgYm91bmQgZnVuY3Rpb24gYW5kXG4gKiBzZXRzIGl0cyBtZXRhIGRhdGEuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGJpbmREYXRhIFRoZSBiaW5kIGRhdGEgYXJyYXkuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBib3VuZCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZUJpbmQoYmluZERhdGEpIHtcbiAgdmFyIGZ1bmMgPSBiaW5kRGF0YVswXSxcbiAgICAgIHBhcnRpYWxBcmdzID0gYmluZERhdGFbMl0sXG4gICAgICB0aGlzQXJnID0gYmluZERhdGFbNF07XG5cbiAgZnVuY3Rpb24gYm91bmQoKSB7XG4gICAgLy8gYEZ1bmN0aW9uI2JpbmRgIHNwZWNcbiAgICAvLyBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjMuNC41XG4gICAgaWYgKHBhcnRpYWxBcmdzKSB7XG4gICAgICB2YXIgYXJncyA9IHBhcnRpYWxBcmdzLnNsaWNlKCk7XG4gICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgfVxuICAgIC8vIG1pbWljIHRoZSBjb25zdHJ1Y3RvcidzIGByZXR1cm5gIGJlaGF2aW9yXG4gICAgLy8gaHR0cDovL2VzNS5naXRodWIuaW8vI3gxMy4yLjJcbiAgICBpZiAodGhpcyBpbnN0YW5jZW9mIGJvdW5kKSB7XG4gICAgICAvLyBlbnN1cmUgYG5ldyBib3VuZGAgaXMgYW4gaW5zdGFuY2Ugb2YgYGZ1bmNgXG4gICAgICB2YXIgdGhpc0JpbmRpbmcgPSBiYXNlQ3JlYXRlKGZ1bmMucHJvdG90eXBlKSxcbiAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNCaW5kaW5nLCBhcmdzIHx8IGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gaXNPYmplY3QocmVzdWx0KSA/IHJlc3VsdCA6IHRoaXNCaW5kaW5nO1xuICAgIH1cbiAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzIHx8IGFyZ3VtZW50cyk7XG4gIH1cbiAgc2V0QmluZERhdGEoYm91bmQsIGJpbmREYXRhKTtcbiAgcmV0dXJuIGJvdW5kO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VCaW5kO1xuIiwidmFyIGdsb2JhbD10eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge307LyoqXG4gKiBMby1EYXNoIDIuMy4wIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC5pc29iamVjdCcpLFxuICAgIG5vb3AgPSByZXF1aXJlKCdsb2Rhc2gubm9vcCcpLFxuICAgIHJlTmF0aXZlID0gcmVxdWlyZSgnbG9kYXNoLl9yZW5hdGl2ZScpO1xuXG4vKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyBmb3IgbWV0aG9kcyB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcyAqL1xudmFyIG5hdGl2ZUNyZWF0ZSA9IHJlTmF0aXZlLnRlc3QobmF0aXZlQ3JlYXRlID0gT2JqZWN0LmNyZWF0ZSkgJiYgbmF0aXZlQ3JlYXRlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmNyZWF0ZWAgd2l0aG91dCBzdXBwb3J0IGZvciBhc3NpZ25pbmdcbiAqIHByb3BlcnRpZXMgdG8gdGhlIGNyZWF0ZWQgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvdG90eXBlIFRoZSBvYmplY3QgdG8gaW5oZXJpdCBmcm9tLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbmV3IG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gYmFzZUNyZWF0ZShwcm90b3R5cGUsIHByb3BlcnRpZXMpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KHByb3RvdHlwZSkgPyBuYXRpdmVDcmVhdGUocHJvdG90eXBlKSA6IHt9O1xufVxuLy8gZmFsbGJhY2sgZm9yIGJyb3dzZXJzIHdpdGhvdXQgYE9iamVjdC5jcmVhdGVgXG5pZiAoIW5hdGl2ZUNyZWF0ZSkge1xuICBiYXNlQ3JlYXRlID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIE9iamVjdCgpIHt9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHByb3RvdHlwZSkge1xuICAgICAgaWYgKGlzT2JqZWN0KHByb3RvdHlwZSkpIHtcbiAgICAgICAgT2JqZWN0LnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBPYmplY3Q7XG4gICAgICAgIE9iamVjdC5wcm90b3R5cGUgPSBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdCB8fCBnbG9iYWwuT2JqZWN0KCk7XG4gICAgfTtcbiAgfSgpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQ3JlYXRlO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuMy4wIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBiYXNlQ3JlYXRlID0gcmVxdWlyZSgnbG9kYXNoLl9iYXNlY3JlYXRlJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCdsb2Rhc2guaXNvYmplY3QnKSxcbiAgICBzZXRCaW5kRGF0YSA9IHJlcXVpcmUoJ2xvZGFzaC5fc2V0YmluZGRhdGEnKSxcbiAgICBzbGljZSA9IHJlcXVpcmUoJ2xvZGFzaC5fc2xpY2UnKTtcblxuLyoqXG4gKiBVc2VkIGZvciBgQXJyYXlgIG1ldGhvZCByZWZlcmVuY2VzLlxuICpcbiAqIE5vcm1hbGx5IGBBcnJheS5wcm90b3R5cGVgIHdvdWxkIHN1ZmZpY2UsIGhvd2V2ZXIsIHVzaW5nIGFuIGFycmF5IGxpdGVyYWxcbiAqIGF2b2lkcyBpc3N1ZXMgaW4gTmFyd2hhbC5cbiAqL1xudmFyIGFycmF5UmVmID0gW107XG5cbi8qKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyAqL1xudmFyIHB1c2ggPSBhcnJheVJlZi5wdXNoO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBjcmVhdGVXcmFwcGVyYCB0aGF0IGNyZWF0ZXMgdGhlIHdyYXBwZXIgYW5kXG4gKiBzZXRzIGl0cyBtZXRhIGRhdGEuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGJpbmREYXRhIFRoZSBiaW5kIGRhdGEgYXJyYXkuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZUNyZWF0ZVdyYXBwZXIoYmluZERhdGEpIHtcbiAgdmFyIGZ1bmMgPSBiaW5kRGF0YVswXSxcbiAgICAgIGJpdG1hc2sgPSBiaW5kRGF0YVsxXSxcbiAgICAgIHBhcnRpYWxBcmdzID0gYmluZERhdGFbMl0sXG4gICAgICBwYXJ0aWFsUmlnaHRBcmdzID0gYmluZERhdGFbM10sXG4gICAgICB0aGlzQXJnID0gYmluZERhdGFbNF0sXG4gICAgICBhcml0eSA9IGJpbmREYXRhWzVdO1xuXG4gIHZhciBpc0JpbmQgPSBiaXRtYXNrICYgMSxcbiAgICAgIGlzQmluZEtleSA9IGJpdG1hc2sgJiAyLFxuICAgICAgaXNDdXJyeSA9IGJpdG1hc2sgJiA0LFxuICAgICAgaXNDdXJyeUJvdW5kID0gYml0bWFzayAmIDgsXG4gICAgICBrZXkgPSBmdW5jO1xuXG4gIGZ1bmN0aW9uIGJvdW5kKCkge1xuICAgIHZhciB0aGlzQmluZGluZyA9IGlzQmluZCA/IHRoaXNBcmcgOiB0aGlzO1xuICAgIGlmIChwYXJ0aWFsQXJncykge1xuICAgICAgdmFyIGFyZ3MgPSBwYXJ0aWFsQXJncy5zbGljZSgpO1xuICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgICBpZiAocGFydGlhbFJpZ2h0QXJncyB8fCBpc0N1cnJ5KSB7XG4gICAgICBhcmdzIHx8IChhcmdzID0gc2xpY2UoYXJndW1lbnRzKSk7XG4gICAgICBpZiAocGFydGlhbFJpZ2h0QXJncykge1xuICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIHBhcnRpYWxSaWdodEFyZ3MpO1xuICAgICAgfVxuICAgICAgaWYgKGlzQ3VycnkgJiYgYXJncy5sZW5ndGggPCBhcml0eSkge1xuICAgICAgICBiaXRtYXNrIHw9IDE2ICYgfjMyO1xuICAgICAgICByZXR1cm4gYmFzZUNyZWF0ZVdyYXBwZXIoW2Z1bmMsIChpc0N1cnJ5Qm91bmQgPyBiaXRtYXNrIDogYml0bWFzayAmIH4zKSwgYXJncywgbnVsbCwgdGhpc0FyZywgYXJpdHldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgYXJncyB8fCAoYXJncyA9IGFyZ3VtZW50cyk7XG4gICAgaWYgKGlzQmluZEtleSkge1xuICAgICAgZnVuYyA9IHRoaXNCaW5kaW5nW2tleV07XG4gICAgfVxuICAgIGlmICh0aGlzIGluc3RhbmNlb2YgYm91bmQpIHtcbiAgICAgIHRoaXNCaW5kaW5nID0gYmFzZUNyZWF0ZShmdW5jLnByb3RvdHlwZSk7XG4gICAgICB2YXIgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQmluZGluZywgYXJncyk7XG4gICAgICByZXR1cm4gaXNPYmplY3QocmVzdWx0KSA/IHJlc3VsdCA6IHRoaXNCaW5kaW5nO1xuICAgIH1cbiAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQmluZGluZywgYXJncyk7XG4gIH1cbiAgc2V0QmluZERhdGEoYm91bmQsIGJpbmREYXRhKTtcbiAgcmV0dXJuIGJvdW5kO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VDcmVhdGVXcmFwcGVyO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuMy4wIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBTbGljZXMgdGhlIGBjb2xsZWN0aW9uYCBmcm9tIHRoZSBgc3RhcnRgIGluZGV4IHVwIHRvLCBidXQgbm90IGluY2x1ZGluZyxcbiAqIHRoZSBgZW5kYCBpbmRleC5cbiAqXG4gKiBOb3RlOiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgaW5zdGVhZCBvZiBgQXJyYXkjc2xpY2VgIHRvIHN1cHBvcnQgbm9kZSBsaXN0c1xuICogaW4gSUUgPCA5IGFuZCB0byBlbnN1cmUgZGVuc2UgYXJyYXlzIGFyZSByZXR1cm5lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIHNsaWNlLlxuICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0IFRoZSBzdGFydCBpbmRleC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBlbmQgVGhlIGVuZCBpbmRleC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGFycmF5LlxuICovXG5mdW5jdGlvbiBzbGljZShhcnJheSwgc3RhcnQsIGVuZCkge1xuICBzdGFydCB8fCAoc3RhcnQgPSAwKTtcbiAgaWYgKHR5cGVvZiBlbmQgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBlbmQgPSBhcnJheSA/IGFycmF5Lmxlbmd0aCA6IDA7XG4gIH1cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbmQgLSBzdGFydCB8fCAwLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGgpO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGFycmF5W3N0YXJ0ICsgaW5kZXhdO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2xpY2U7XG4iLCIvKipcbiAqIExvLURhc2ggMi4zLjAgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGZpcnN0IGFyZ3VtZW50IHByb3ZpZGVkIHRvIGl0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gKiBAcGFyYW0geyp9IHZhbHVlIEFueSB2YWx1ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIGB2YWx1ZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICduYW1lJzogJ2ZyZWQnIH07XG4gKiBfLmlkZW50aXR5KG9iamVjdCkgPT09IG9iamVjdDtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaWRlbnRpdHkodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlkZW50aXR5O1xuIiwidmFyIGdsb2JhbD10eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge307LyoqXG4gKiBMby1EYXNoIDIuMy4wIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciByZU5hdGl2ZSA9IHJlcXVpcmUoJ2xvZGFzaC5fcmVuYXRpdmUnKTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGZ1bmN0aW9ucyBjb250YWluaW5nIGEgYHRoaXNgIHJlZmVyZW5jZSAqL1xudmFyIHJlVGhpcyA9IC9cXGJ0aGlzXFxiLztcblxuLyoqXG4gKiBBbiBvYmplY3QgdXNlZCB0byBmbGFnIGVudmlyb25tZW50cyBmZWF0dXJlcy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHR5cGUgT2JqZWN0XG4gKi9cbnZhciBzdXBwb3J0ID0ge307XG5cbi8qKlxuICogRGV0ZWN0IGlmIGZ1bmN0aW9ucyBjYW4gYmUgZGVjb21waWxlZCBieSBgRnVuY3Rpb24jdG9TdHJpbmdgXG4gKiAoYWxsIGJ1dCBQUzMgYW5kIG9sZGVyIE9wZXJhIG1vYmlsZSBicm93c2VycyAmIGF2b2lkZWQgaW4gV2luZG93cyA4IGFwcHMpLlxuICpcbiAqIEBtZW1iZXJPZiBfLnN1cHBvcnRcbiAqIEB0eXBlIGJvb2xlYW5cbiAqL1xuc3VwcG9ydC5mdW5jRGVjb21wID0gIXJlTmF0aXZlLnRlc3QoZ2xvYmFsLldpblJURXJyb3IpICYmIHJlVGhpcy50ZXN0KGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSk7XG5cbi8qKlxuICogRGV0ZWN0IGlmIGBGdW5jdGlvbiNuYW1lYCBpcyBzdXBwb3J0ZWQgKGFsbCBidXQgSUUpLlxuICpcbiAqIEBtZW1iZXJPZiBfLnN1cHBvcnRcbiAqIEB0eXBlIGJvb2xlYW5cbiAqL1xuc3VwcG9ydC5mdW5jTmFtZXMgPSB0eXBlb2YgRnVuY3Rpb24ubmFtZSA9PSAnc3RyaW5nJztcblxubW9kdWxlLmV4cG9ydHMgPSBzdXBwb3J0O1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuMy4wIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqIFVzZWQgdG8gZGV0ZXJtaW5lIGlmIHZhbHVlcyBhcmUgb2YgdGhlIGxhbmd1YWdlIHR5cGUgT2JqZWN0ICovXG52YXIgb2JqZWN0VHlwZXMgPSB7XG4gICdib29sZWFuJzogZmFsc2UsXG4gICdmdW5jdGlvbic6IHRydWUsXG4gICdvYmplY3QnOiB0cnVlLFxuICAnbnVtYmVyJzogZmFsc2UsXG4gICdzdHJpbmcnOiBmYWxzZSxcbiAgJ3VuZGVmaW5lZCc6IGZhbHNlXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG9iamVjdFR5cGVzO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuMy4wIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC5pc29iamVjdCcpLFxuICAgIHJlTmF0aXZlID0gcmVxdWlyZSgnbG9kYXNoLl9yZW5hdGl2ZScpLFxuICAgIHNoaW1LZXlzID0gcmVxdWlyZSgnbG9kYXNoLl9zaGlta2V5cycpO1xuXG4vKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyBmb3IgbWV0aG9kcyB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcyAqL1xudmFyIG5hdGl2ZUtleXMgPSByZU5hdGl2ZS50ZXN0KG5hdGl2ZUtleXMgPSBPYmplY3Qua2V5cykgJiYgbmF0aXZlS2V5cztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IGNvbXBvc2VkIG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBhbiBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5rZXlzKHsgJ29uZSc6IDEsICd0d28nOiAyLCAndGhyZWUnOiAzIH0pO1xuICogLy8gPT4gWydvbmUnLCAndHdvJywgJ3RocmVlJ10gKHByb3BlcnR5IG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkIGFjcm9zcyBlbnZpcm9ubWVudHMpXG4gKi9cbnZhciBrZXlzID0gIW5hdGl2ZUtleXMgPyBzaGltS2V5cyA6IGZ1bmN0aW9uKG9iamVjdCkge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgcmV0dXJuIG5hdGl2ZUtleXMob2JqZWN0KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5cztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjMuMCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgb2JqZWN0VHlwZXMgPSByZXF1aXJlKCdsb2Rhc2guX29iamVjdHR5cGVzJyk7XG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQSBmYWxsYmFjayBpbXBsZW1lbnRhdGlvbiBvZiBgT2JqZWN0LmtleXNgIHdoaWNoIHByb2R1Y2VzIGFuIGFycmF5IG9mIHRoZVxuICogZ2l2ZW4gb2JqZWN0J3Mgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEB0eXBlIEZ1bmN0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gaW5zcGVjdC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xudmFyIHNoaW1LZXlzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gIHZhciBpbmRleCwgaXRlcmFibGUgPSBvYmplY3QsIHJlc3VsdCA9IFtdO1xuICBpZiAoIWl0ZXJhYmxlKSByZXR1cm4gcmVzdWx0O1xuICBpZiAoIShvYmplY3RUeXBlc1t0eXBlb2Ygb2JqZWN0XSkpIHJldHVybiByZXN1bHQ7XG4gICAgZm9yIChpbmRleCBpbiBpdGVyYWJsZSkge1xuICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoaXRlcmFibGUsIGluZGV4KSkge1xuICAgICAgICByZXN1bHQucHVzaChpbmRleCk7XG4gICAgICB9XG4gICAgfVxuICByZXR1cm4gcmVzdWx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNoaW1LZXlzO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuMy4wIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBiYXNlSW5kZXhPZiA9IHJlcXVpcmUoJ2xvZGFzaC5fYmFzZWluZGV4b2YnKSxcbiAgICBmb3JPd24gPSByZXF1aXJlKCdsb2Rhc2guZm9yb3duJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJ2xvZGFzaC5pc2FycmF5JyksXG4gICAgaXNTdHJpbmcgPSByZXF1aXJlKCdsb2Rhc2guaXNzdHJpbmcnKTtcblxuLyogTmF0aXZlIG1ldGhvZCBzaG9ydGN1dHMgZm9yIG1ldGhvZHMgd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMgKi9cbnZhciBuYXRpdmVNYXggPSBNYXRoLm1heDtcblxuLyoqXG4gKiBDaGVja3MgaWYgYSBnaXZlbiB2YWx1ZSBpcyBwcmVzZW50IGluIGEgY29sbGVjdGlvbiB1c2luZyBzdHJpY3QgZXF1YWxpdHlcbiAqIGZvciBjb21wYXJpc29ucywgaS5lLiBgPT09YC4gSWYgYGZyb21JbmRleGAgaXMgbmVnYXRpdmUsIGl0IGlzIHVzZWQgYXMgdGhlXG4gKiBvZmZzZXQgZnJvbSB0aGUgZW5kIG9mIHRoZSBjb2xsZWN0aW9uLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAYWxpYXMgaW5jbHVkZVxuICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHsqfSB0YXJnZXQgVGhlIHZhbHVlIHRvIGNoZWNrIGZvci5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbZnJvbUluZGV4PTBdIFRoZSBpbmRleCB0byBzZWFyY2ggZnJvbS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHRhcmdldGAgZWxlbWVudCBpcyBmb3VuZCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmNvbnRhaW5zKFsxLCAyLCAzXSwgMSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5jb250YWlucyhbMSwgMiwgM10sIDEsIDIpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmNvbnRhaW5zKHsgJ25hbWUnOiAnZnJlZCcsICdhZ2UnOiA0MCB9LCAnZnJlZCcpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uY29udGFpbnMoJ3BlYmJsZXMnLCAnZWInKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gY29udGFpbnMoY29sbGVjdGlvbiwgdGFyZ2V0LCBmcm9tSW5kZXgpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBpbmRleE9mID0gYmFzZUluZGV4T2YsXG4gICAgICBsZW5ndGggPSBjb2xsZWN0aW9uID8gY29sbGVjdGlvbi5sZW5ndGggOiAwLFxuICAgICAgcmVzdWx0ID0gZmFsc2U7XG5cbiAgZnJvbUluZGV4ID0gKGZyb21JbmRleCA8IDAgPyBuYXRpdmVNYXgoMCwgbGVuZ3RoICsgZnJvbUluZGV4KSA6IGZyb21JbmRleCkgfHwgMDtcbiAgaWYgKGlzQXJyYXkoY29sbGVjdGlvbikpIHtcbiAgICByZXN1bHQgPSBpbmRleE9mKGNvbGxlY3Rpb24sIHRhcmdldCwgZnJvbUluZGV4KSA+IC0xO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicpIHtcbiAgICByZXN1bHQgPSAoaXNTdHJpbmcoY29sbGVjdGlvbikgPyBjb2xsZWN0aW9uLmluZGV4T2YodGFyZ2V0LCBmcm9tSW5kZXgpIDogaW5kZXhPZihjb2xsZWN0aW9uLCB0YXJnZXQsIGZyb21JbmRleCkpID4gLTE7XG4gIH0gZWxzZSB7XG4gICAgZm9yT3duKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoKytpbmRleCA+PSBmcm9tSW5kZXgpIHtcbiAgICAgICAgcmV0dXJuICEocmVzdWx0ID0gdmFsdWUgPT09IHRhcmdldCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb250YWlucztcbiIsIi8qKlxuICogTG8tRGFzaCAyLjMuMCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaW5kZXhPZmAgd2l0aG91dCBzdXBwb3J0IGZvciBiaW5hcnkgc2VhcmNoZXNcbiAqIG9yIGBmcm9tSW5kZXhgIGNvbnN0cmFpbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gc2VhcmNoLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2VhcmNoIGZvci5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbZnJvbUluZGV4PTBdIFRoZSBpbmRleCB0byBzZWFyY2ggZnJvbS5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIHZhbHVlIG9yIGAtMWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJbmRleE9mKGFycmF5LCB2YWx1ZSwgZnJvbUluZGV4KSB7XG4gIHZhciBpbmRleCA9IChmcm9tSW5kZXggfHwgMCkgLSAxLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgaWYgKGFycmF5W2luZGV4XSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybiBpbmRleDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJbmRleE9mO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuMy4wIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBiYXNlQ3JlYXRlQ2FsbGJhY2sgPSByZXF1aXJlKCdsb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjaycpLFxuICAgIGtleXMgPSByZXF1aXJlKCdsb2Rhc2gua2V5cycpLFxuICAgIG9iamVjdFR5cGVzID0gcmVxdWlyZSgnbG9kYXNoLl9vYmplY3R0eXBlcycpO1xuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgb3duIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiBhbiBvYmplY3QsIGV4ZWN1dGluZyB0aGUgY2FsbGJhY2tcbiAqIGZvciBlYWNoIHByb3BlcnR5LiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgIGFuZCBpbnZva2VkIHdpdGggdGhyZWVcbiAqIGFyZ3VtZW50czsgKHZhbHVlLCBrZXksIG9iamVjdCkuIENhbGxiYWNrcyBtYXkgZXhpdCBpdGVyYXRpb24gZWFybHkgYnlcbiAqIGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEB0eXBlIEZ1bmN0aW9uXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmZvck93bih7ICcwJzogJ3plcm8nLCAnMSc6ICdvbmUnLCAnbGVuZ3RoJzogMiB9LCBmdW5jdGlvbihudW0sIGtleSkge1xuICogICBjb25zb2xlLmxvZyhrZXkpO1xuICogfSk7XG4gKiAvLyA9PiBsb2dzICcwJywgJzEnLCBhbmQgJ2xlbmd0aCcgKHByb3BlcnR5IG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkIGFjcm9zcyBlbnZpcm9ubWVudHMpXG4gKi9cbnZhciBmb3JPd24gPSBmdW5jdGlvbihjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICB2YXIgaW5kZXgsIGl0ZXJhYmxlID0gY29sbGVjdGlvbiwgcmVzdWx0ID0gaXRlcmFibGU7XG4gIGlmICghaXRlcmFibGUpIHJldHVybiByZXN1bHQ7XG4gIGlmICghb2JqZWN0VHlwZXNbdHlwZW9mIGl0ZXJhYmxlXSkgcmV0dXJuIHJlc3VsdDtcbiAgY2FsbGJhY2sgPSBjYWxsYmFjayAmJiB0eXBlb2YgdGhpc0FyZyA9PSAndW5kZWZpbmVkJyA/IGNhbGxiYWNrIDogYmFzZUNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICB2YXIgb3duSW5kZXggPSAtMSxcbiAgICAgICAgb3duUHJvcHMgPSBvYmplY3RUeXBlc1t0eXBlb2YgaXRlcmFibGVdICYmIGtleXMoaXRlcmFibGUpLFxuICAgICAgICBsZW5ndGggPSBvd25Qcm9wcyA/IG93blByb3BzLmxlbmd0aCA6IDA7XG5cbiAgICB3aGlsZSAoKytvd25JbmRleCA8IGxlbmd0aCkge1xuICAgICAgaW5kZXggPSBvd25Qcm9wc1tvd25JbmRleF07XG4gICAgICBpZiAoY2FsbGJhY2soaXRlcmFibGVbaW5kZXhdLCBpbmRleCwgY29sbGVjdGlvbikgPT09IGZhbHNlKSByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgcmV0dXJuIHJlc3VsdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmb3JPd247XG4iLCJhcmd1bWVudHNbNF1bNV1bMF0uYXBwbHkoZXhwb3J0cyxhcmd1bWVudHMpIiwiYXJndW1lbnRzWzRdWzldWzBdLmFwcGx5KGV4cG9ydHMsYXJndW1lbnRzKSIsImFyZ3VtZW50c1s0XVsxMF1bMF0uYXBwbHkoZXhwb3J0cyxhcmd1bWVudHMpIiwiYXJndW1lbnRzWzRdWzExXVswXS5hcHBseShleHBvcnRzLGFyZ3VtZW50cykiLCJhcmd1bWVudHNbNF1bMTRdWzBdLmFwcGx5KGV4cG9ydHMsYXJndW1lbnRzKSIsImFyZ3VtZW50c1s0XVsyM11bMF0uYXBwbHkoZXhwb3J0cyxhcmd1bWVudHMpIiwiLyoqXG4gKiBMby1EYXNoIDIuMy4wIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBjcmVhdGVDYWxsYmFjayA9IHJlcXVpcmUoJ2xvZGFzaC5jcmVhdGVjYWxsYmFjaycpLFxuICAgIGZvck93biA9IHJlcXVpcmUoJ2xvZGFzaC5mb3Jvd24nKTtcblxuLyoqXG4gKiBJdGVyYXRlcyBvdmVyIGVsZW1lbnRzIG9mIGEgY29sbGVjdGlvbiwgcmV0dXJuaW5nIHRoZSBmaXJzdCBlbGVtZW50IHRoYXRcbiAqIHRoZSBjYWxsYmFjayByZXR1cm5zIHRydWV5IGZvci4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmRcbiAqIGludm9rZWQgd2l0aCB0aHJlZSBhcmd1bWVudHM7ICh2YWx1ZSwgaW5kZXh8a2V5LCBjb2xsZWN0aW9uKS5cbiAqXG4gKiBJZiBhIHByb3BlcnR5IG5hbWUgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLnBsdWNrXCIgc3R5bGVcbiAqIGNhbGxiYWNrIHdpbGwgcmV0dXJuIHRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAqXG4gKiBJZiBhbiBvYmplY3QgaXMgcHJvdmlkZWQgZm9yIGBjYWxsYmFja2AgdGhlIGNyZWF0ZWQgXCJfLndoZXJlXCIgc3R5bGUgY2FsbGJhY2tcbiAqIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBnaXZlbiBvYmplY3QsXG4gKiBlbHNlIGBmYWxzZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBhbGlhcyBkZXRlY3QsIGZpbmRXaGVyZVxuICogQGNhdGVnb3J5IENvbGxlY3Rpb25zXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdHxzdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R8c3RyaW5nfSBbY2FsbGJhY2s9aWRlbnRpdHldIFRoZSBmdW5jdGlvbiBjYWxsZWRcbiAqICBwZXIgaXRlcmF0aW9uLiBJZiBhIHByb3BlcnR5IG5hbWUgb3Igb2JqZWN0IGlzIHByb3ZpZGVkIGl0IHdpbGwgYmUgdXNlZFxuICogIHRvIGNyZWF0ZSBhIFwiXy5wbHVja1wiIG9yIFwiXy53aGVyZVwiIHN0eWxlIGNhbGxiYWNrLCByZXNwZWN0aXZlbHkuXG4gKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgYGNhbGxiYWNrYC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBmb3VuZCBlbGVtZW50LCBlbHNlIGB1bmRlZmluZWRgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAgJ2FnZSc6IDM2LCAnYmxvY2tlZCc6IGZhbHNlIH0sXG4gKiAgIHsgJ25hbWUnOiAnZnJlZCcsICAgICdhZ2UnOiA0MCwgJ2Jsb2NrZWQnOiB0cnVlIH0sXG4gKiAgIHsgJ25hbWUnOiAncGViYmxlcycsICdhZ2UnOiAxLCAgJ2Jsb2NrZWQnOiBmYWxzZSB9XG4gKiBdO1xuICpcbiAqIF8uZmluZChjaGFyYWN0ZXJzLCBmdW5jdGlvbihjaHIpIHtcbiAqICAgcmV0dXJuIGNoci5hZ2UgPCA0MDtcbiAqIH0pO1xuICogLy8gPT4geyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYsICdibG9ja2VkJzogZmFsc2UgfVxuICpcbiAqIC8vIHVzaW5nIFwiXy53aGVyZVwiIGNhbGxiYWNrIHNob3J0aGFuZFxuICogXy5maW5kKGNoYXJhY3RlcnMsIHsgJ2FnZSc6IDEgfSk7XG4gKiAvLyA9PiAgeyAnbmFtZSc6ICdwZWJibGVzJywgJ2FnZSc6IDEsICdibG9ja2VkJzogZmFsc2UgfVxuICpcbiAqIC8vIHVzaW5nIFwiXy5wbHVja1wiIGNhbGxiYWNrIHNob3J0aGFuZFxuICogXy5maW5kKGNoYXJhY3RlcnMsICdibG9ja2VkJyk7XG4gKiAvLyA9PiB7ICduYW1lJzogJ2ZyZWQnLCAnYWdlJzogNDAsICdibG9ja2VkJzogdHJ1ZSB9XG4gKi9cbmZ1bmN0aW9uIGZpbmQoY29sbGVjdGlvbiwgY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgY2FsbGJhY2sgPSBjcmVhdGVDYWxsYmFjayhjYWxsYmFjaywgdGhpc0FyZywgMyk7XG5cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBjb2xsZWN0aW9uID8gY29sbGVjdGlvbi5sZW5ndGggOiAwO1xuXG4gIGlmICh0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInKSB7XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGNvbGxlY3Rpb25baW5kZXhdO1xuICAgICAgaWYgKGNhbGxiYWNrKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgcmVzdWx0O1xuICAgIGZvck93bihjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgIGlmIChjYWxsYmFjayh2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pKSB7XG4gICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZpbmQ7XG4iLCIvKipcbiAqIExvLURhc2ggMi4zLjAgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGJhc2VDcmVhdGVDYWxsYmFjayA9IHJlcXVpcmUoJ2xvZGFzaC5fYmFzZWNyZWF0ZWNhbGxiYWNrJyksXG4gICAgYmFzZUlzRXF1YWwgPSByZXF1aXJlKCdsb2Rhc2guX2Jhc2Vpc2VxdWFsJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCdsb2Rhc2guaXNvYmplY3QnKSxcbiAgICBrZXlzID0gcmVxdWlyZSgnbG9kYXNoLmtleXMnKTtcblxuLyoqXG4gKiBQcm9kdWNlcyBhIGNhbGxiYWNrIGJvdW5kIHRvIGFuIG9wdGlvbmFsIGB0aGlzQXJnYC4gSWYgYGZ1bmNgIGlzIGEgcHJvcGVydHlcbiAqIG5hbWUgdGhlIGNyZWF0ZWQgY2FsbGJhY2sgd2lsbCByZXR1cm4gdGhlIHByb3BlcnR5IHZhbHVlIGZvciBhIGdpdmVuIGVsZW1lbnQuXG4gKiBJZiBgZnVuY2AgaXMgYW4gb2JqZWN0IHRoZSBjcmVhdGVkIGNhbGxiYWNrIHdpbGwgcmV0dXJuIGB0cnVlYCBmb3IgZWxlbWVudHNcbiAqIHRoYXQgY29udGFpbiB0aGUgZXF1aXZhbGVudCBvYmplY3QgcHJvcGVydGllcywgb3RoZXJ3aXNlIGl0IHdpbGwgcmV0dXJuIGBmYWxzZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAqIEBwYXJhbSB7Kn0gW2Z1bmM9aWRlbnRpdHldIFRoZSB2YWx1ZSB0byBjb252ZXJ0IHRvIGEgY2FsbGJhY2suXG4gKiBAcGFyYW0geyp9IFt0aGlzQXJnXSBUaGUgYHRoaXNgIGJpbmRpbmcgb2YgdGhlIGNyZWF0ZWQgY2FsbGJhY2suXG4gKiBAcGFyYW0ge251bWJlcn0gW2FyZ0NvdW50XSBUaGUgbnVtYmVyIG9mIGFyZ3VtZW50cyB0aGUgY2FsbGJhY2sgYWNjZXB0cy5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBhIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgY2hhcmFjdGVycyA9IFtcbiAqICAgeyAnbmFtZSc6ICdiYXJuZXknLCAnYWdlJzogMzYgfSxcbiAqICAgeyAnbmFtZSc6ICdmcmVkJywgICAnYWdlJzogNDAgfVxuICogXTtcbiAqXG4gKiAvLyB3cmFwIHRvIGNyZWF0ZSBjdXN0b20gY2FsbGJhY2sgc2hvcnRoYW5kc1xuICogXy5jcmVhdGVDYWxsYmFjayA9IF8ud3JhcChfLmNyZWF0ZUNhbGxiYWNrLCBmdW5jdGlvbihmdW5jLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICogICB2YXIgbWF0Y2ggPSAvXiguKz8pX18oW2dsXXQpKC4rKSQvLmV4ZWMoY2FsbGJhY2spO1xuICogICByZXR1cm4gIW1hdGNoID8gZnVuYyhjYWxsYmFjaywgdGhpc0FyZykgOiBmdW5jdGlvbihvYmplY3QpIHtcbiAqICAgICByZXR1cm4gbWF0Y2hbMl0gPT0gJ2d0JyA/IG9iamVjdFttYXRjaFsxXV0gPiBtYXRjaFszXSA6IG9iamVjdFttYXRjaFsxXV0gPCBtYXRjaFszXTtcbiAqICAgfTtcbiAqIH0pO1xuICpcbiAqIF8uZmlsdGVyKGNoYXJhY3RlcnMsICdhZ2VfX2d0MzgnKTtcbiAqIC8vID0+IFt7ICduYW1lJzogJ2ZyZWQnLCAnYWdlJzogNDAgfV1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ2FsbGJhY2soZnVuYywgdGhpc0FyZywgYXJnQ291bnQpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgZnVuYztcbiAgaWYgKGZ1bmMgPT0gbnVsbCB8fCB0eXBlID09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gYmFzZUNyZWF0ZUNhbGxiYWNrKGZ1bmMsIHRoaXNBcmcsIGFyZ0NvdW50KTtcbiAgfVxuICAvLyBoYW5kbGUgXCJfLnBsdWNrXCIgc3R5bGUgY2FsbGJhY2sgc2hvcnRoYW5kc1xuICBpZiAodHlwZSAhPSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICAgIHJldHVybiBvYmplY3RbZnVuY107XG4gICAgfTtcbiAgfVxuICB2YXIgcHJvcHMgPSBrZXlzKGZ1bmMpLFxuICAgICAga2V5ID0gcHJvcHNbMF0sXG4gICAgICBhID0gZnVuY1trZXldO1xuXG4gIC8vIGhhbmRsZSBcIl8ud2hlcmVcIiBzdHlsZSBjYWxsYmFjayBzaG9ydGhhbmRzXG4gIGlmIChwcm9wcy5sZW5ndGggPT0gMSAmJiBhID09PSBhICYmICFpc09iamVjdChhKSkge1xuICAgIC8vIGZhc3QgcGF0aCB0aGUgY29tbW9uIGNhc2Ugb2YgcHJvdmlkaW5nIGFuIG9iamVjdCB3aXRoIGEgc2luZ2xlXG4gICAgLy8gcHJvcGVydHkgY29udGFpbmluZyBhIHByaW1pdGl2ZSB2YWx1ZVxuICAgIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICAgIHZhciBiID0gb2JqZWN0W2tleV07XG4gICAgICByZXR1cm4gYSA9PT0gYiAmJiAoYSAhPT0gMCB8fCAoMSAvIGEgPT0gMSAvIGIpKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIgbGVuZ3RoID0gcHJvcHMubGVuZ3RoLFxuICAgICAgICByZXN1bHQgPSBmYWxzZTtcblxuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgaWYgKCEocmVzdWx0ID0gYmFzZUlzRXF1YWwob2JqZWN0W3Byb3BzW2xlbmd0aF1dLCBmdW5jW3Byb3BzW2xlbmd0aF1dLCBudWxsLCB0cnVlKSkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlQ2FsbGJhY2s7XG4iLCJhcmd1bWVudHNbNF1bNV1bMF0uYXBwbHkoZXhwb3J0cyxhcmd1bWVudHMpIiwiYXJndW1lbnRzWzRdWzldWzBdLmFwcGx5KGV4cG9ydHMsYXJndW1lbnRzKSIsImFyZ3VtZW50c1s0XVsxMF1bMF0uYXBwbHkoZXhwb3J0cyxhcmd1bWVudHMpIiwiYXJndW1lbnRzWzRdWzExXVswXS5hcHBseShleHBvcnRzLGFyZ3VtZW50cykiLCJhcmd1bWVudHNbNF1bMTRdWzBdLmFwcGx5KGV4cG9ydHMsYXJndW1lbnRzKSIsIi8qKlxuICogTG8tRGFzaCAyLjMuMCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgZm9ySW4gPSByZXF1aXJlKCdsb2Rhc2guZm9yaW4nKSxcbiAgICBnZXRBcnJheSA9IHJlcXVpcmUoJ2xvZGFzaC5fZ2V0YXJyYXknKSxcbiAgICBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnbG9kYXNoLmlzZnVuY3Rpb24nKSxcbiAgICBvYmplY3RUeXBlcyA9IHJlcXVpcmUoJ2xvZGFzaC5fb2JqZWN0dHlwZXMnKSxcbiAgICByZWxlYXNlQXJyYXkgPSByZXF1aXJlKCdsb2Rhc2guX3JlbGVhc2VhcnJheScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHNob3J0Y3V0cyAqL1xudmFyIGFyZ3NDbGFzcyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5Q2xhc3MgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIGJvb2xDbGFzcyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlQ2xhc3MgPSAnW29iamVjdCBEYXRlXScsXG4gICAgbnVtYmVyQ2xhc3MgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICBvYmplY3RDbGFzcyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHJlZ2V4cENsYXNzID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc3RyaW5nQ2xhc3MgPSAnW29iamVjdCBTdHJpbmddJztcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgaW50ZXJuYWwgW1tDbGFzc11dIG9mIHZhbHVlcyAqL1xudmFyIHRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNFcXVhbGAsIHdpdGhvdXQgc3VwcG9ydCBmb3IgYHRoaXNBcmdgIGJpbmRpbmcsXG4gKiB0aGF0IGFsbG93cyBwYXJ0aWFsIFwiXy53aGVyZVwiIHN0eWxlIGNvbXBhcmlzb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IGEgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IGIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29tcGFyaW5nIHZhbHVlcy5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtpc1doZXJlPWZhbHNlXSBBIGZsYWcgdG8gaW5kaWNhdGUgcGVyZm9ybWluZyBwYXJ0aWFsIGNvbXBhcmlzb25zLlxuICogQHBhcmFtIHtBcnJheX0gW3N0YWNrQT1bXV0gVHJhY2tzIHRyYXZlcnNlZCBgYWAgb2JqZWN0cy5cbiAqIEBwYXJhbSB7QXJyYXl9IFtzdGFja0I9W11dIFRyYWNrcyB0cmF2ZXJzZWQgYGJgIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNFcXVhbChhLCBiLCBjYWxsYmFjaywgaXNXaGVyZSwgc3RhY2tBLCBzdGFja0IpIHtcbiAgLy8gdXNlZCB0byBpbmRpY2F0ZSB0aGF0IHdoZW4gY29tcGFyaW5nIG9iamVjdHMsIGBhYCBoYXMgYXQgbGVhc3QgdGhlIHByb3BlcnRpZXMgb2YgYGJgXG4gIGlmIChjYWxsYmFjaykge1xuICAgIHZhciByZXN1bHQgPSBjYWxsYmFjayhhLCBiKTtcbiAgICBpZiAodHlwZW9mIHJlc3VsdCAhPSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuICEhcmVzdWx0O1xuICAgIH1cbiAgfVxuICAvLyBleGl0IGVhcmx5IGZvciBpZGVudGljYWwgdmFsdWVzXG4gIGlmIChhID09PSBiKSB7XG4gICAgLy8gdHJlYXQgYCswYCB2cy4gYC0wYCBhcyBub3QgZXF1YWxcbiAgICByZXR1cm4gYSAhPT0gMCB8fCAoMSAvIGEgPT0gMSAvIGIpO1xuICB9XG4gIHZhciB0eXBlID0gdHlwZW9mIGEsXG4gICAgICBvdGhlclR5cGUgPSB0eXBlb2YgYjtcblxuICAvLyBleGl0IGVhcmx5IGZvciB1bmxpa2UgcHJpbWl0aXZlIHZhbHVlc1xuICBpZiAoYSA9PT0gYSAmJlxuICAgICAgIShhICYmIG9iamVjdFR5cGVzW3R5cGVdKSAmJlxuICAgICAgIShiICYmIG9iamVjdFR5cGVzW290aGVyVHlwZV0pKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIGV4aXQgZWFybHkgZm9yIGBudWxsYCBhbmQgYHVuZGVmaW5lZGAgYXZvaWRpbmcgRVMzJ3MgRnVuY3Rpb24jY2FsbCBiZWhhdmlvclxuICAvLyBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjMuNC40XG4gIGlmIChhID09IG51bGwgfHwgYiA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGEgPT09IGI7XG4gIH1cbiAgLy8gY29tcGFyZSBbW0NsYXNzXV0gbmFtZXNcbiAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSksXG4gICAgICBvdGhlckNsYXNzID0gdG9TdHJpbmcuY2FsbChiKTtcblxuICBpZiAoY2xhc3NOYW1lID09IGFyZ3NDbGFzcykge1xuICAgIGNsYXNzTmFtZSA9IG9iamVjdENsYXNzO1xuICB9XG4gIGlmIChvdGhlckNsYXNzID09IGFyZ3NDbGFzcykge1xuICAgIG90aGVyQ2xhc3MgPSBvYmplY3RDbGFzcztcbiAgfVxuICBpZiAoY2xhc3NOYW1lICE9IG90aGVyQ2xhc3MpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgc3dpdGNoIChjbGFzc05hbWUpIHtcbiAgICBjYXNlIGJvb2xDbGFzczpcbiAgICBjYXNlIGRhdGVDbGFzczpcbiAgICAgIC8vIGNvZXJjZSBkYXRlcyBhbmQgYm9vbGVhbnMgdG8gbnVtYmVycywgZGF0ZXMgdG8gbWlsbGlzZWNvbmRzIGFuZCBib29sZWFuc1xuICAgICAgLy8gdG8gYDFgIG9yIGAwYCB0cmVhdGluZyBpbnZhbGlkIGRhdGVzIGNvZXJjZWQgdG8gYE5hTmAgYXMgbm90IGVxdWFsXG4gICAgICByZXR1cm4gK2EgPT0gK2I7XG5cbiAgICBjYXNlIG51bWJlckNsYXNzOlxuICAgICAgLy8gdHJlYXQgYE5hTmAgdnMuIGBOYU5gIGFzIGVxdWFsXG4gICAgICByZXR1cm4gKGEgIT0gK2EpXG4gICAgICAgID8gYiAhPSArYlxuICAgICAgICAvLyBidXQgdHJlYXQgYCswYCB2cy4gYC0wYCBhcyBub3QgZXF1YWxcbiAgICAgICAgOiAoYSA9PSAwID8gKDEgLyBhID09IDEgLyBiKSA6IGEgPT0gK2IpO1xuXG4gICAgY2FzZSByZWdleHBDbGFzczpcbiAgICBjYXNlIHN0cmluZ0NsYXNzOlxuICAgICAgLy8gY29lcmNlIHJlZ2V4ZXMgdG8gc3RyaW5ncyAoaHR0cDovL2VzNS5naXRodWIuaW8vI3gxNS4xMC42LjQpXG4gICAgICAvLyB0cmVhdCBzdHJpbmcgcHJpbWl0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBvYmplY3QgaW5zdGFuY2VzIGFzIGVxdWFsXG4gICAgICByZXR1cm4gYSA9PSBTdHJpbmcoYik7XG4gIH1cbiAgdmFyIGlzQXJyID0gY2xhc3NOYW1lID09IGFycmF5Q2xhc3M7XG4gIGlmICghaXNBcnIpIHtcbiAgICAvLyB1bndyYXAgYW55IGBsb2Rhc2hgIHdyYXBwZWQgdmFsdWVzXG4gICAgdmFyIGFXcmFwcGVkID0gaGFzT3duUHJvcGVydHkuY2FsbChhLCAnX193cmFwcGVkX18nKSxcbiAgICAgICAgYldyYXBwZWQgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKGIsICdfX3dyYXBwZWRfXycpO1xuXG4gICAgaWYgKGFXcmFwcGVkIHx8IGJXcmFwcGVkKSB7XG4gICAgICByZXR1cm4gYmFzZUlzRXF1YWwoYVdyYXBwZWQgPyBhLl9fd3JhcHBlZF9fIDogYSwgYldyYXBwZWQgPyBiLl9fd3JhcHBlZF9fIDogYiwgY2FsbGJhY2ssIGlzV2hlcmUsIHN0YWNrQSwgc3RhY2tCKTtcbiAgICB9XG4gICAgLy8gZXhpdCBmb3IgZnVuY3Rpb25zIGFuZCBET00gbm9kZXNcbiAgICBpZiAoY2xhc3NOYW1lICE9IG9iamVjdENsYXNzKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIGluIG9sZGVyIHZlcnNpb25zIG9mIE9wZXJhLCBgYXJndW1lbnRzYCBvYmplY3RzIGhhdmUgYEFycmF5YCBjb25zdHJ1Y3RvcnNcbiAgICB2YXIgY3RvckEgPSBhLmNvbnN0cnVjdG9yLFxuICAgICAgICBjdG9yQiA9IGIuY29uc3RydWN0b3I7XG5cbiAgICAvLyBub24gYE9iamVjdGAgb2JqZWN0IGluc3RhbmNlcyB3aXRoIGRpZmZlcmVudCBjb25zdHJ1Y3RvcnMgYXJlIG5vdCBlcXVhbFxuICAgIGlmIChjdG9yQSAhPSBjdG9yQiAmJlxuICAgICAgICAgICEoaXNGdW5jdGlvbihjdG9yQSkgJiYgY3RvckEgaW5zdGFuY2VvZiBjdG9yQSAmJiBpc0Z1bmN0aW9uKGN0b3JCKSAmJiBjdG9yQiBpbnN0YW5jZW9mIGN0b3JCKSAmJlxuICAgICAgICAgICgnY29uc3RydWN0b3InIGluIGEgJiYgJ2NvbnN0cnVjdG9yJyBpbiBiKVxuICAgICAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgLy8gYXNzdW1lIGN5Y2xpYyBzdHJ1Y3R1cmVzIGFyZSBlcXVhbFxuICAvLyB0aGUgYWxnb3JpdGhtIGZvciBkZXRlY3RpbmcgY3ljbGljIHN0cnVjdHVyZXMgaXMgYWRhcHRlZCBmcm9tIEVTIDUuMVxuICAvLyBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gIChodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDE1LjEyLjMpXG4gIHZhciBpbml0ZWRTdGFjayA9ICFzdGFja0E7XG4gIHN0YWNrQSB8fCAoc3RhY2tBID0gZ2V0QXJyYXkoKSk7XG4gIHN0YWNrQiB8fCAoc3RhY2tCID0gZ2V0QXJyYXkoKSk7XG5cbiAgdmFyIGxlbmd0aCA9IHN0YWNrQS5sZW5ndGg7XG4gIHdoaWxlIChsZW5ndGgtLSkge1xuICAgIGlmIChzdGFja0FbbGVuZ3RoXSA9PSBhKSB7XG4gICAgICByZXR1cm4gc3RhY2tCW2xlbmd0aF0gPT0gYjtcbiAgICB9XG4gIH1cbiAgdmFyIHNpemUgPSAwO1xuICByZXN1bHQgPSB0cnVlO1xuXG4gIC8vIGFkZCBgYWAgYW5kIGBiYCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHNcbiAgc3RhY2tBLnB1c2goYSk7XG4gIHN0YWNrQi5wdXNoKGIpO1xuXG4gIC8vIHJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyBhbmQgYXJyYXlzIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cylcbiAgaWYgKGlzQXJyKSB7XG4gICAgbGVuZ3RoID0gYS5sZW5ndGg7XG4gICAgc2l6ZSA9IGIubGVuZ3RoO1xuXG4gICAgLy8gY29tcGFyZSBsZW5ndGhzIHRvIGRldGVybWluZSBpZiBhIGRlZXAgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnlcbiAgICByZXN1bHQgPSBzaXplID09IGEubGVuZ3RoO1xuICAgIGlmICghcmVzdWx0ICYmICFpc1doZXJlKSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICAvLyBkZWVwIGNvbXBhcmUgdGhlIGNvbnRlbnRzLCBpZ25vcmluZyBub24tbnVtZXJpYyBwcm9wZXJ0aWVzXG4gICAgd2hpbGUgKHNpemUtLSkge1xuICAgICAgdmFyIGluZGV4ID0gbGVuZ3RoLFxuICAgICAgICAgIHZhbHVlID0gYltzaXplXTtcblxuICAgICAgaWYgKGlzV2hlcmUpIHtcbiAgICAgICAgd2hpbGUgKGluZGV4LS0pIHtcbiAgICAgICAgICBpZiAoKHJlc3VsdCA9IGJhc2VJc0VxdWFsKGFbaW5kZXhdLCB2YWx1ZSwgY2FsbGJhY2ssIGlzV2hlcmUsIHN0YWNrQSwgc3RhY2tCKSkpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghKHJlc3VsdCA9IGJhc2VJc0VxdWFsKGFbc2l6ZV0sIHZhbHVlLCBjYWxsYmFjaywgaXNXaGVyZSwgc3RhY2tBLCBzdGFja0IpKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICAvLyBkZWVwIGNvbXBhcmUgb2JqZWN0cyB1c2luZyBgZm9ySW5gLCBpbnN0ZWFkIG9mIGBmb3JPd25gLCB0byBhdm9pZCBgT2JqZWN0LmtleXNgXG4gIC8vIHdoaWNoLCBpbiB0aGlzIGNhc2UsIGlzIG1vcmUgY29zdGx5XG4gIGZvckluKGIsIGZ1bmN0aW9uKHZhbHVlLCBrZXksIGIpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChiLCBrZXkpKSB7XG4gICAgICAvLyBjb3VudCB0aGUgbnVtYmVyIG9mIHByb3BlcnRpZXMuXG4gICAgICBzaXplKys7XG4gICAgICAvLyBkZWVwIGNvbXBhcmUgZWFjaCBwcm9wZXJ0eSB2YWx1ZS5cbiAgICAgIHJldHVybiAocmVzdWx0ID0gaGFzT3duUHJvcGVydHkuY2FsbChhLCBrZXkpICYmIGJhc2VJc0VxdWFsKGFba2V5XSwgdmFsdWUsIGNhbGxiYWNrLCBpc1doZXJlLCBzdGFja0EsIHN0YWNrQikpO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKHJlc3VsdCAmJiAhaXNXaGVyZSkge1xuICAgIC8vIGVuc3VyZSBib3RoIG9iamVjdHMgaGF2ZSB0aGUgc2FtZSBudW1iZXIgb2YgcHJvcGVydGllc1xuICAgIGZvckluKGEsIGZ1bmN0aW9uKHZhbHVlLCBrZXksIGEpIHtcbiAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGEsIGtleSkpIHtcbiAgICAgICAgLy8gYHNpemVgIHdpbGwgYmUgYC0xYCBpZiBgYWAgaGFzIG1vcmUgcHJvcGVydGllcyB0aGFuIGBiYFxuICAgICAgICByZXR1cm4gKHJlc3VsdCA9IC0tc2l6ZSA+IC0xKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBpZiAoaW5pdGVkU3RhY2spIHtcbiAgICByZWxlYXNlQXJyYXkoc3RhY2tBKTtcbiAgICByZWxlYXNlQXJyYXkoc3RhY2tCKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc0VxdWFsO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuMy4wIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBhcnJheVBvb2wgPSByZXF1aXJlKCdsb2Rhc2guX2FycmF5cG9vbCcpO1xuXG4vKipcbiAqIEdldHMgYW4gYXJyYXkgZnJvbSB0aGUgYXJyYXkgcG9vbCBvciBjcmVhdGVzIGEgbmV3IG9uZSBpZiB0aGUgcG9vbCBpcyBlbXB0eS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHJldHVybnMge0FycmF5fSBUaGUgYXJyYXkgZnJvbSB0aGUgcG9vbC5cbiAqL1xuZnVuY3Rpb24gZ2V0QXJyYXkoKSB7XG4gIHJldHVybiBhcnJheVBvb2wucG9wKCkgfHwgW107XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0QXJyYXk7XG4iLCIvKipcbiAqIExvLURhc2ggMi4zLjAgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKiogVXNlZCB0byBwb29sIGFycmF5cyBhbmQgb2JqZWN0cyB1c2VkIGludGVybmFsbHkgKi9cbnZhciBhcnJheVBvb2wgPSBbXTtcblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheVBvb2w7XG4iLCIvKipcbiAqIExvLURhc2ggMi4zLjAgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIGFycmF5UG9vbCA9IHJlcXVpcmUoJ2xvZGFzaC5fYXJyYXlwb29sJyksXG4gICAgbWF4UG9vbFNpemUgPSByZXF1aXJlKCdsb2Rhc2guX21heHBvb2xzaXplJyk7XG5cbi8qKlxuICogUmVsZWFzZXMgdGhlIGdpdmVuIGFycmF5IGJhY2sgdG8gdGhlIGFycmF5IHBvb2wuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIHJlbGVhc2UuXG4gKi9cbmZ1bmN0aW9uIHJlbGVhc2VBcnJheShhcnJheSkge1xuICBhcnJheS5sZW5ndGggPSAwO1xuICBpZiAoYXJyYXlQb29sLmxlbmd0aCA8IG1heFBvb2xTaXplKSB7XG4gICAgYXJyYXlQb29sLnB1c2goYXJyYXkpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVsZWFzZUFycmF5O1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuMy4wIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqIFVzZWQgYXMgdGhlIG1heCBzaXplIG9mIHRoZSBgYXJyYXlQb29sYCBhbmQgYG9iamVjdFBvb2xgICovXG52YXIgbWF4UG9vbFNpemUgPSA0MDtcblxubW9kdWxlLmV4cG9ydHMgPSBtYXhQb29sU2l6ZTtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjMuMCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgYmFzZUNyZWF0ZUNhbGxiYWNrID0gcmVxdWlyZSgnbG9kYXNoLl9iYXNlY3JlYXRlY2FsbGJhY2snKSxcbiAgICBvYmplY3RUeXBlcyA9IHJlcXVpcmUoJ2xvZGFzaC5fb2JqZWN0dHlwZXMnKTtcblxuLyoqXG4gKiBJdGVyYXRlcyBvdmVyIG93biBhbmQgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydGllcyBvZiBhbiBvYmplY3QsXG4gKiBleGVjdXRpbmcgdGhlIGNhbGxiYWNrIGZvciBlYWNoIHByb3BlcnR5LiBUaGUgY2FsbGJhY2sgaXMgYm91bmQgdG8gYHRoaXNBcmdgXG4gKiBhbmQgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50czsgKHZhbHVlLCBrZXksIG9iamVjdCkuIENhbGxiYWNrcyBtYXkgZXhpdFxuICogaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEB0eXBlIEZ1bmN0aW9uXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBTaGFwZSgpIHtcbiAqICAgdGhpcy54ID0gMDtcbiAqICAgdGhpcy55ID0gMDtcbiAqIH1cbiAqXG4gKiBTaGFwZS5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAqICAgdGhpcy54ICs9IHg7XG4gKiAgIHRoaXMueSArPSB5O1xuICogfTtcbiAqXG4gKiBfLmZvckluKG5ldyBTaGFwZSwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICogICBjb25zb2xlLmxvZyhrZXkpO1xuICogfSk7XG4gKiAvLyA9PiBsb2dzICd4JywgJ3knLCBhbmQgJ21vdmUnIChwcm9wZXJ0eSBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCBhY3Jvc3MgZW52aXJvbm1lbnRzKVxuICovXG52YXIgZm9ySW4gPSBmdW5jdGlvbihjb2xsZWN0aW9uLCBjYWxsYmFjaywgdGhpc0FyZykge1xuICB2YXIgaW5kZXgsIGl0ZXJhYmxlID0gY29sbGVjdGlvbiwgcmVzdWx0ID0gaXRlcmFibGU7XG4gIGlmICghaXRlcmFibGUpIHJldHVybiByZXN1bHQ7XG4gIGlmICghb2JqZWN0VHlwZXNbdHlwZW9mIGl0ZXJhYmxlXSkgcmV0dXJuIHJlc3VsdDtcbiAgY2FsbGJhY2sgPSBjYWxsYmFjayAmJiB0eXBlb2YgdGhpc0FyZyA9PSAndW5kZWZpbmVkJyA/IGNhbGxiYWNrIDogYmFzZUNyZWF0ZUNhbGxiYWNrKGNhbGxiYWNrLCB0aGlzQXJnLCAzKTtcbiAgICBmb3IgKGluZGV4IGluIGl0ZXJhYmxlKSB7XG4gICAgICBpZiAoY2FsbGJhY2soaXRlcmFibGVbaW5kZXhdLCBpbmRleCwgY29sbGVjdGlvbikgPT09IGZhbHNlKSByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgcmV0dXJuIHJlc3VsdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmb3JJbjtcbiIsImFyZ3VtZW50c1s0XVsyM11bMF0uYXBwbHkoZXhwb3J0cyxhcmd1bWVudHMpIiwiYXJndW1lbnRzWzRdWzI4XVswXS5hcHBseShleHBvcnRzLGFyZ3VtZW50cykiLCJhcmd1bWVudHNbNF1bNV1bMF0uYXBwbHkoZXhwb3J0cyxhcmd1bWVudHMpIiwiYXJndW1lbnRzWzRdWzldWzBdLmFwcGx5KGV4cG9ydHMsYXJndW1lbnRzKSIsImFyZ3VtZW50c1s0XVsxMF1bMF0uYXBwbHkoZXhwb3J0cyxhcmd1bWVudHMpIiwiYXJndW1lbnRzWzRdWzExXVswXS5hcHBseShleHBvcnRzLGFyZ3VtZW50cykiLCJhcmd1bWVudHNbNF1bMTRdWzBdLmFwcGx5KGV4cG9ydHMsYXJndW1lbnRzKSIsImFyZ3VtZW50c1s0XVsyM11bMF0uYXBwbHkoZXhwb3J0cyxhcmd1bWVudHMpIiwiLyoqXG4gKiBMby1EYXNoIDIuMy4wIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBiYXNlQ3JlYXRlQ2FsbGJhY2sgPSByZXF1aXJlKCdsb2Rhc2guX2Jhc2VjcmVhdGVjYWxsYmFjaycpLFxuICAgIGZvck93biA9IHJlcXVpcmUoJ2xvZGFzaC5mb3Jvd24nKTtcblxuLyoqXG4gKiBJdGVyYXRlcyBvdmVyIGVsZW1lbnRzIG9mIGEgY29sbGVjdGlvbiwgZXhlY3V0aW5nIHRoZSBjYWxsYmFjayBmb3IgZWFjaFxuICogZWxlbWVudC4gVGhlIGNhbGxiYWNrIGlzIGJvdW5kIHRvIGB0aGlzQXJnYCBhbmQgaW52b2tlZCB3aXRoIHRocmVlIGFyZ3VtZW50cztcbiAqICh2YWx1ZSwgaW5kZXh8a2V5LCBjb2xsZWN0aW9uKS4gQ2FsbGJhY2tzIG1heSBleGl0IGl0ZXJhdGlvbiBlYXJseSBieVxuICogZXhwbGljaXRseSByZXR1cm5pbmcgYGZhbHNlYC5cbiAqXG4gKiBOb3RlOiBBcyB3aXRoIG90aGVyIFwiQ29sbGVjdGlvbnNcIiBtZXRob2RzLCBvYmplY3RzIHdpdGggYSBgbGVuZ3RoYCBwcm9wZXJ0eVxuICogYXJlIGl0ZXJhdGVkIGxpa2UgYXJyYXlzLiBUbyBhdm9pZCB0aGlzIGJlaGF2aW9yIGBfLmZvckluYCBvciBgXy5mb3JPd25gXG4gKiBtYXkgYmUgdXNlZCBmb3Igb2JqZWN0IGl0ZXJhdGlvbi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGFsaWFzIGVhY2hcbiAqIEBjYXRlZ29yeSBDb2xsZWN0aW9uc1xuICogQHBhcmFtIHtBcnJheXxPYmplY3R8c3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBjb2xsZWN0aW9uIHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFjaz1pZGVudGl0eV0gVGhlIGZ1bmN0aW9uIGNhbGxlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHsqfSBbdGhpc0FyZ10gVGhlIGB0aGlzYCBiaW5kaW5nIG9mIGBjYWxsYmFja2AuXG4gKiBAcmV0dXJucyB7QXJyYXl8T2JqZWN0fHN0cmluZ30gUmV0dXJucyBgY29sbGVjdGlvbmAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8oWzEsIDIsIDNdKS5mb3JFYWNoKGZ1bmN0aW9uKG51bSkgeyBjb25zb2xlLmxvZyhudW0pOyB9KS5qb2luKCcsJyk7XG4gKiAvLyA9PiBsb2dzIGVhY2ggbnVtYmVyIGFuZCByZXR1cm5zICcxLDIsMydcbiAqXG4gKiBfLmZvckVhY2goeyAnb25lJzogMSwgJ3R3byc6IDIsICd0aHJlZSc6IDMgfSwgZnVuY3Rpb24obnVtKSB7IGNvbnNvbGUubG9nKG51bSk7IH0pO1xuICogLy8gPT4gbG9ncyBlYWNoIG51bWJlciBhbmQgcmV0dXJucyB0aGUgb2JqZWN0IChwcm9wZXJ0eSBvcmRlciBpcyBub3QgZ3VhcmFudGVlZCBhY3Jvc3MgZW52aXJvbm1lbnRzKVxuICovXG5mdW5jdGlvbiBmb3JFYWNoKGNvbGxlY3Rpb24sIGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gY29sbGVjdGlvbiA/IGNvbGxlY3Rpb24ubGVuZ3RoIDogMDtcblxuICBjYWxsYmFjayA9IGNhbGxiYWNrICYmIHR5cGVvZiB0aGlzQXJnID09ICd1bmRlZmluZWQnID8gY2FsbGJhY2sgOiBiYXNlQ3JlYXRlQ2FsbGJhY2soY2FsbGJhY2ssIHRoaXNBcmcsIDMpO1xuICBpZiAodHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJykge1xuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICBpZiAoY2FsbGJhY2soY29sbGVjdGlvbltpbmRleF0sIGluZGV4LCBjb2xsZWN0aW9uKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvck93bihjb2xsZWN0aW9uLCBjYWxsYmFjayk7XG4gIH1cbiAgcmV0dXJuIGNvbGxlY3Rpb247XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZm9yRWFjaDtcbiIsImFyZ3VtZW50c1s0XVs1XVswXS5hcHBseShleHBvcnRzLGFyZ3VtZW50cykiLCJhcmd1bWVudHNbNF1bOV1bMF0uYXBwbHkoZXhwb3J0cyxhcmd1bWVudHMpIiwiYXJndW1lbnRzWzRdWzEwXVswXS5hcHBseShleHBvcnRzLGFyZ3VtZW50cykiLCJhcmd1bWVudHNbNF1bMTFdWzBdLmFwcGx5KGV4cG9ydHMsYXJndW1lbnRzKSIsImFyZ3VtZW50c1s0XVsxNF1bMF0uYXBwbHkoZXhwb3J0cyxhcmd1bWVudHMpIiwiYXJndW1lbnRzWzRdWzI4XVswXS5hcHBseShleHBvcnRzLGFyZ3VtZW50cykiLCJhcmd1bWVudHNbNF1bMjNdWzBdLmFwcGx5KGV4cG9ydHMsYXJndW1lbnRzKSIsIi8qKlxuICogTG8tRGFzaCAyLjMuMCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgcmVOYXRpdmUgPSByZXF1aXJlKCdsb2Rhc2guX3JlbmF0aXZlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgc2hvcnRjdXRzICovXG52YXIgYXJyYXlDbGFzcyA9ICdbb2JqZWN0IEFycmF5XSc7XG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGludGVybmFsIFtbQ2xhc3NdXSBvZiB2YWx1ZXMgKi9cbnZhciB0b1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyBmb3IgbWV0aG9kcyB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcyAqL1xudmFyIG5hdGl2ZUlzQXJyYXkgPSByZU5hdGl2ZS50ZXN0KG5hdGl2ZUlzQXJyYXkgPSBBcnJheS5pc0FycmF5KSAmJiBuYXRpdmVJc0FycmF5O1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGFuIGFycmF5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAdHlwZSBGdW5jdGlvblxuICogQGNhdGVnb3J5IE9iamVjdHNcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGFuIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIChmdW5jdGlvbigpIHsgcmV0dXJuIF8uaXNBcnJheShhcmd1bWVudHMpOyB9KSgpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqL1xudmFyIGlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbHVlLmxlbmd0aCA9PSAnbnVtYmVyJyAmJlxuICAgIHRvU3RyaW5nLmNhbGwodmFsdWUpID09IGFycmF5Q2xhc3MgfHwgZmFsc2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXk7XG4iLCIvKipcbiAqIExvLURhc2ggMi4zLjAgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHNob3J0Y3V0cyAqL1xudmFyIGJvb2xDbGFzcyA9ICdbb2JqZWN0IEJvb2xlYW5dJztcblxuLyoqIFVzZWQgZm9yIG5hdGl2ZSBtZXRob2QgcmVmZXJlbmNlcyAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgaW50ZXJuYWwgW1tDbGFzc11dIG9mIHZhbHVlcyAqL1xudmFyIHRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBib29sZWFuIHZhbHVlLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBib29sZWFuIHZhbHVlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNCb29sZWFuKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNCb29sZWFuKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gZmFsc2UgfHxcbiAgICB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gYm9vbENsYXNzIHx8IGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQm9vbGVhbjtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjMuMCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5wbVwiIC1vIC4vbnBtL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgc2hvcnRjdXRzICovXG52YXIgZGF0ZUNsYXNzID0gJ1tvYmplY3QgRGF0ZV0nO1xuXG4vKiogVXNlZCBmb3IgbmF0aXZlIG1ldGhvZCByZWZlcmVuY2VzICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBpbnRlcm5hbCBbW0NsYXNzXV0gb2YgdmFsdWVzICovXG52YXIgdG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGRhdGUuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RzXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgYHZhbHVlYCBpcyBhIGRhdGUsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0RhdGUobmV3IERhdGUpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpc0RhdGUodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyAmJiB0b1N0cmluZy5jYWxsKHZhbHVlKSA9PSBkYXRlQ2xhc3MgfHwgZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNEYXRlO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuMy4wIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRnVuY3Rpb247XG4iLCIvKipcbiAqIExvLURhc2ggMi4zLjAgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGBudWxsYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdHNcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGBudWxsYCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzTnVsbChudWxsKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTnVsbCh1bmRlZmluZWQpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdWxsKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gbnVsbDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc051bGw7XG4iLCIvKipcbiAqIExvLURhc2ggMi4zLjAgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHNob3J0Y3V0cyAqL1xudmFyIG51bWJlckNsYXNzID0gJ1tvYmplY3QgTnVtYmVyXSc7XG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGludGVybmFsIFtbQ2xhc3NdXSBvZiB2YWx1ZXMgKi9cbnZhciB0b1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgbnVtYmVyLlxuICpcbiAqIE5vdGU6IGBOYU5gIGlzIGNvbnNpZGVyZWQgYSBudW1iZXIuIFNlZSBodHRwOi8vZXM1LmdpdGh1Yi5pby8jeDguNS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdHNcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGEgbnVtYmVyLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNOdW1iZXIoOC40ICogNSk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzTnVtYmVyKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgfHxcbiAgICB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcgJiYgdG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT0gbnVtYmVyQ2xhc3MgfHwgZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNOdW1iZXI7XG4iLCIvKipcbiAqIExvLURhc2ggMi4zLjAgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xudmFyIG9iamVjdFR5cGVzID0gcmVxdWlyZSgnbG9kYXNoLl9vYmplY3R0eXBlcycpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZSBsYW5ndWFnZSB0eXBlIG9mIE9iamVjdC5cbiAqIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KDEpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgLy8gY2hlY2sgaWYgdGhlIHZhbHVlIGlzIHRoZSBFQ01BU2NyaXB0IGxhbmd1YWdlIHR5cGUgb2YgT2JqZWN0XG4gIC8vIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4OFxuICAvLyBhbmQgYXZvaWQgYSBWOCBidWdcbiAgLy8gaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MjI5MVxuICByZXR1cm4gISEodmFsdWUgJiYgb2JqZWN0VHlwZXNbdHlwZW9mIHZhbHVlXSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3Q7XG4iLCIvKipcbiAqIExvLURhc2ggMi4zLjAgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJucG1cIiAtbyAuL25wbS9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHNob3J0Y3V0cyAqL1xudmFyIHN0cmluZ0NsYXNzID0gJ1tvYmplY3QgU3RyaW5nXSc7XG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGludGVybmFsIFtbQ2xhc3NdXSBvZiB2YWx1ZXMgKi9cbnZhciB0b1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgc3RyaW5nLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBzdHJpbmcsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N0cmluZygnZnJlZCcpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpc1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdzdHJpbmcnIHx8XG4gICAgdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnICYmIHRvU3RyaW5nLmNhbGwodmFsdWUpID09IHN0cmluZ0NsYXNzIHx8IGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzU3RyaW5nO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuMy4wIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibnBtXCIgLW8gLi9ucG0vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBgdW5kZWZpbmVkYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdHNcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGB1bmRlZmluZWRgLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNVbmRlZmluZWQodm9pZCAwKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAndW5kZWZpbmVkJztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1VuZGVmaW5lZDtcbiIsIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgRW1pdHRlciA9IHJlcXVpcmUoJ2VtaXR0ZXInKTtcbnZhciByZWR1Y2UgPSByZXF1aXJlKCdyZWR1Y2UnKTtcblxuLyoqXG4gKiBSb290IHJlZmVyZW5jZSBmb3IgaWZyYW1lcy5cbiAqL1xuXG52YXIgcm9vdCA9ICd1bmRlZmluZWQnID09IHR5cGVvZiB3aW5kb3dcbiAgPyB0aGlzXG4gIDogd2luZG93O1xuXG4vKipcbiAqIE5vb3AuXG4gKi9cblxuZnVuY3Rpb24gbm9vcCgpe307XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBob3N0IG9iamVjdCxcbiAqIHdlIGRvbid0IHdhbnQgdG8gc2VyaWFsaXplIHRoZXNlIDopXG4gKlxuICogVE9ETzogZnV0dXJlIHByb29mLCBtb3ZlIHRvIGNvbXBvZW50IGxhbmRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNIb3N0KG9iaikge1xuICB2YXIgc3RyID0ge30udG9TdHJpbmcuY2FsbChvYmopO1xuXG4gIHN3aXRjaCAoc3RyKSB7XG4gICAgY2FzZSAnW29iamVjdCBGaWxlXSc6XG4gICAgY2FzZSAnW29iamVjdCBCbG9iXSc6XG4gICAgY2FzZSAnW29iamVjdCBGb3JtRGF0YV0nOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIERldGVybWluZSBYSFIuXG4gKi9cblxuZnVuY3Rpb24gZ2V0WEhSKCkge1xuICBpZiAocm9vdC5YTUxIdHRwUmVxdWVzdFxuICAgICYmICgnZmlsZTonICE9IHJvb3QubG9jYXRpb24ucHJvdG9jb2wgfHwgIXJvb3QuQWN0aXZlWE9iamVjdCkpIHtcbiAgICByZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICB9IGVsc2Uge1xuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuNi4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjMuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZSwgYWRkZWQgdG8gc3VwcG9ydCBJRS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxudmFyIHRyaW0gPSAnJy50cmltXG4gID8gZnVuY3Rpb24ocykgeyByZXR1cm4gcy50cmltKCk7IH1cbiAgOiBmdW5jdGlvbihzKSB7IHJldHVybiBzLnJlcGxhY2UoLyheXFxzKnxcXHMqJCkvZywgJycpOyB9O1xuXG4vKipcbiAqIENoZWNrIGlmIGBvYmpgIGlzIGFuIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNPYmplY3Qob2JqKSB7XG4gIHJldHVybiBvYmogPT09IE9iamVjdChvYmopO1xufVxuXG4vKipcbiAqIFNlcmlhbGl6ZSB0aGUgZ2l2ZW4gYG9iamAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2VyaWFsaXplKG9iaikge1xuICBpZiAoIWlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gIHZhciBwYWlycyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKG51bGwgIT0gb2JqW2tleV0pIHtcbiAgICAgIHBhaXJzLnB1c2goZW5jb2RlVVJJQ29tcG9uZW50KGtleSlcbiAgICAgICAgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQob2JqW2tleV0pKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhaXJzLmpvaW4oJyYnKTtcbn1cblxuLyoqXG4gKiBFeHBvc2Ugc2VyaWFsaXphdGlvbiBtZXRob2QuXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplT2JqZWN0ID0gc2VyaWFsaXplO1xuXG4gLyoqXG4gICogUGFyc2UgdGhlIGdpdmVuIHgtd3d3LWZvcm0tdXJsZW5jb2RlZCBgc3RyYC5cbiAgKlxuICAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICogQGFwaSBwcml2YXRlXG4gICovXG5cbmZ1bmN0aW9uIHBhcnNlU3RyaW5nKHN0cikge1xuICB2YXIgb2JqID0ge307XG4gIHZhciBwYWlycyA9IHN0ci5zcGxpdCgnJicpO1xuICB2YXIgcGFydHM7XG4gIHZhciBwYWlyO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgIHBhaXIgPSBwYWlyc1tpXTtcbiAgICBwYXJ0cyA9IHBhaXIuc3BsaXQoJz0nKTtcbiAgICBvYmpbZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzBdKV0gPSBkZWNvZGVVUklDb21wb25lbnQocGFydHNbMV0pO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBFeHBvc2UgcGFyc2VyLlxuICovXG5cbnJlcXVlc3QucGFyc2VTdHJpbmcgPSBwYXJzZVN0cmluZztcblxuLyoqXG4gKiBEZWZhdWx0IE1JTUUgdHlwZSBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQudHlwZXMueG1sID0gJ2FwcGxpY2F0aW9uL3htbCc7XG4gKlxuICovXG5cbnJlcXVlc3QudHlwZXMgPSB7XG4gIGh0bWw6ICd0ZXh0L2h0bWwnLFxuICBqc29uOiAnYXBwbGljYXRpb24vanNvbicsXG4gIHhtbDogJ2FwcGxpY2F0aW9uL3htbCcsXG4gIHVybGVuY29kZWQ6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAnZm9ybSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAnZm9ybS1kYXRhJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbn07XG5cbi8qKlxuICogRGVmYXVsdCBzZXJpYWxpemF0aW9uIG1hcC5cbiAqXG4gKiAgICAgc3VwZXJhZ2VudC5zZXJpYWxpemVbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24ob2JqKXtcbiAqICAgICAgIHJldHVybiAnZ2VuZXJhdGVkIHhtbCBoZXJlJztcbiAqICAgICB9O1xuICpcbiAqL1xuXG4gcmVxdWVzdC5zZXJpYWxpemUgPSB7XG4gICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogc2VyaWFsaXplLFxuICAgJ2FwcGxpY2F0aW9uL2pzb24nOiBKU09OLnN0cmluZ2lmeVxuIH07XG5cbiAvKipcbiAgKiBEZWZhdWx0IHBhcnNlcnMuXG4gICpcbiAgKiAgICAgc3VwZXJhZ2VudC5wYXJzZVsnYXBwbGljYXRpb24veG1sJ10gPSBmdW5jdGlvbihzdHIpe1xuICAqICAgICAgIHJldHVybiB7IG9iamVjdCBwYXJzZWQgZnJvbSBzdHIgfTtcbiAgKiAgICAgfTtcbiAgKlxuICAqL1xuXG5yZXF1ZXN0LnBhcnNlID0ge1xuICAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJzogcGFyc2VTdHJpbmcsXG4gICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5wYXJzZVxufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gaGVhZGVyIGBzdHJgIGludG9cbiAqIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBtYXBwZWQgZmllbGRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlSGVhZGVyKHN0cikge1xuICB2YXIgbGluZXMgPSBzdHIuc3BsaXQoL1xccj9cXG4vKTtcbiAgdmFyIGZpZWxkcyA9IHt9O1xuICB2YXIgaW5kZXg7XG4gIHZhciBsaW5lO1xuICB2YXIgZmllbGQ7XG4gIHZhciB2YWw7XG5cbiAgbGluZXMucG9wKCk7IC8vIHRyYWlsaW5nIENSTEZcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gbGluZXMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBsaW5lID0gbGluZXNbaV07XG4gICAgaW5kZXggPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICBmaWVsZCA9IGxpbmUuc2xpY2UoMCwgaW5kZXgpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFsID0gdHJpbShsaW5lLnNsaWNlKGluZGV4ICsgMSkpO1xuICAgIGZpZWxkc1tmaWVsZF0gPSB2YWw7XG4gIH1cblxuICByZXR1cm4gZmllbGRzO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgbWltZSB0eXBlIGZvciB0aGUgZ2l2ZW4gYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gdHlwZShzdHIpe1xuICByZXR1cm4gc3RyLnNwbGl0KC8gKjsgKi8pLnNoaWZ0KCk7XG59O1xuXG4vKipcbiAqIFJldHVybiBoZWFkZXIgZmllbGQgcGFyYW1ldGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJhbXMoc3RyKXtcbiAgcmV0dXJuIHJlZHVjZShzdHIuc3BsaXQoLyAqOyAqLyksIGZ1bmN0aW9uKG9iaiwgc3RyKXtcbiAgICB2YXIgcGFydHMgPSBzdHIuc3BsaXQoLyAqPSAqLylcbiAgICAgICwga2V5ID0gcGFydHMuc2hpZnQoKVxuICAgICAgLCB2YWwgPSBwYXJ0cy5zaGlmdCgpO1xuXG4gICAgaWYgKGtleSAmJiB2YWwpIG9ialtrZXldID0gdmFsO1xuICAgIHJldHVybiBvYmo7XG4gIH0sIHt9KTtcbn07XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVzcG9uc2VgIHdpdGggdGhlIGdpdmVuIGB4aHJgLlxuICpcbiAqICAtIHNldCBmbGFncyAoLm9rLCAuZXJyb3IsIGV0YylcbiAqICAtIHBhcnNlIGhlYWRlclxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICBBbGlhc2luZyBgc3VwZXJhZ2VudGAgYXMgYHJlcXVlc3RgIGlzIG5pY2U6XG4gKlxuICogICAgICByZXF1ZXN0ID0gc3VwZXJhZ2VudDtcbiAqXG4gKiAgV2UgY2FuIHVzZSB0aGUgcHJvbWlzZS1saWtlIEFQSSwgb3IgcGFzcyBjYWxsYmFja3M6XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnLycpLmVuZChmdW5jdGlvbihyZXMpe30pO1xuICogICAgICByZXF1ZXN0LmdldCgnLycsIGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIFNlbmRpbmcgZGF0YSBjYW4gYmUgY2hhaW5lZDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAuc2VuZCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInKVxuICogICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBPciBwYXNzZWQgdG8gYC5wb3N0KClgOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgIC5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBPciBmdXJ0aGVyIHJlZHVjZWQgdG8gYSBzaW5nbGUgY2FsbCBmb3Igc2ltcGxlIGNhc2VzOlxuICpcbiAqICAgICAgcmVxdWVzdFxuICogICAgICAgIC5wb3N0KCcvdXNlcicsIHsgbmFtZTogJ3RqJyB9LCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqIEBwYXJhbSB7WE1MSFRUUFJlcXVlc3R9IHhoclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIFJlc3BvbnNlKHJlcSwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdGhpcy5yZXEgPSByZXE7XG4gIHRoaXMueGhyID0gdGhpcy5yZXEueGhyO1xuICB0aGlzLnRleHQgPSB0aGlzLnhoci5yZXNwb25zZVRleHQ7XG4gIHRoaXMuc2V0U3RhdHVzUHJvcGVydGllcyh0aGlzLnhoci5zdGF0dXMpO1xuICB0aGlzLmhlYWRlciA9IHRoaXMuaGVhZGVycyA9IHBhcnNlSGVhZGVyKHRoaXMueGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKTtcbiAgLy8gZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIHNvbWV0aW1lcyBmYWxzZWx5IHJldHVybnMgXCJcIiBmb3IgQ09SUyByZXF1ZXN0cywgYnV0XG4gIC8vIGdldFJlc3BvbnNlSGVhZGVyIHN0aWxsIHdvcmtzLiBzbyB3ZSBnZXQgY29udGVudC10eXBlIGV2ZW4gaWYgZ2V0dGluZ1xuICAvLyBvdGhlciBoZWFkZXJzIGZhaWxzLlxuICB0aGlzLmhlYWRlclsnY29udGVudC10eXBlJ10gPSB0aGlzLnhoci5nZXRSZXNwb25zZUhlYWRlcignY29udGVudC10eXBlJyk7XG4gIHRoaXMuc2V0SGVhZGVyUHJvcGVydGllcyh0aGlzLmhlYWRlcik7XG4gIHRoaXMuYm9keSA9IHRoaXMucmVxLm1ldGhvZCAhPSAnSEVBRCdcbiAgICA/IHRoaXMucGFyc2VCb2R5KHRoaXMudGV4dClcbiAgICA6IG51bGw7XG59XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuaGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIHJlbGF0ZWQgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gYC50eXBlYCB0aGUgY29udGVudCB0eXBlIHdpdGhvdXQgcGFyYW1zXG4gKlxuICogQSByZXNwb25zZSBvZiBcIkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbjsgY2hhcnNldD11dGYtOFwiXG4gKiB3aWxsIHByb3ZpZGUgeW91IHdpdGggYSBgLnR5cGVgIG9mIFwidGV4dC9wbGFpblwiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRIZWFkZXJQcm9wZXJ0aWVzID0gZnVuY3Rpb24oaGVhZGVyKXtcbiAgLy8gY29udGVudC10eXBlXG4gIHZhciBjdCA9IHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSB8fCAnJztcbiAgdGhpcy50eXBlID0gdHlwZShjdCk7XG5cbiAgLy8gcGFyYW1zXG4gIHZhciBvYmogPSBwYXJhbXMoY3QpO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB0aGlzW2tleV0gPSBvYmpba2V5XTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGJvZHkgYHN0cmAuXG4gKlxuICogVXNlZCBmb3IgYXV0by1wYXJzaW5nIG9mIGJvZGllcy4gUGFyc2Vyc1xuICogYXJlIGRlZmluZWQgb24gdGhlIGBzdXBlcmFnZW50LnBhcnNlYCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUucGFyc2VCb2R5ID0gZnVuY3Rpb24oc3RyKXtcbiAgdmFyIHBhcnNlID0gcmVxdWVzdC5wYXJzZVt0aGlzLnR5cGVdO1xuICByZXR1cm4gcGFyc2VcbiAgICA/IHBhcnNlKHN0cilcbiAgICA6IG51bGw7XG59O1xuXG4vKipcbiAqIFNldCBmbGFncyBzdWNoIGFzIGAub2tgIGJhc2VkIG9uIGBzdGF0dXNgLlxuICpcbiAqIEZvciBleGFtcGxlIGEgMnh4IHJlc3BvbnNlIHdpbGwgZ2l2ZSB5b3UgYSBgLm9rYCBvZiBfX3RydWVfX1xuICogd2hlcmVhcyA1eHggd2lsbCBiZSBfX2ZhbHNlX18gYW5kIGAuZXJyb3JgIHdpbGwgYmUgX190cnVlX18uIFRoZVxuICogYC5jbGllbnRFcnJvcmAgYW5kIGAuc2VydmVyRXJyb3JgIGFyZSBhbHNvIGF2YWlsYWJsZSB0byBiZSBtb3JlXG4gKiBzcGVjaWZpYywgYW5kIGAuc3RhdHVzVHlwZWAgaXMgdGhlIGNsYXNzIG9mIGVycm9yIHJhbmdpbmcgZnJvbSAxLi41XG4gKiBzb21ldGltZXMgdXNlZnVsIGZvciBtYXBwaW5nIHJlc3BvbmQgY29sb3JzIGV0Yy5cbiAqXG4gKiBcInN1Z2FyXCIgcHJvcGVydGllcyBhcmUgYWxzbyBkZWZpbmVkIGZvciBjb21tb24gY2FzZXMuIEN1cnJlbnRseSBwcm92aWRpbmc6XG4gKlxuICogICAtIC5ub0NvbnRlbnRcbiAqICAgLSAuYmFkUmVxdWVzdFxuICogICAtIC51bmF1dGhvcml6ZWRcbiAqICAgLSAubm90QWNjZXB0YWJsZVxuICogICAtIC5ub3RGb3VuZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGF0dXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRTdGF0dXNQcm9wZXJ0aWVzID0gZnVuY3Rpb24oc3RhdHVzKXtcbiAgdmFyIHR5cGUgPSBzdGF0dXMgLyAxMDAgfCAwO1xuXG4gIC8vIHN0YXR1cyAvIGNsYXNzXG4gIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICB0aGlzLnN0YXR1c1R5cGUgPSB0eXBlO1xuXG4gIC8vIGJhc2ljc1xuICB0aGlzLmluZm8gPSAxID09IHR5cGU7XG4gIHRoaXMub2sgPSAyID09IHR5cGU7XG4gIHRoaXMuY2xpZW50RXJyb3IgPSA0ID09IHR5cGU7XG4gIHRoaXMuc2VydmVyRXJyb3IgPSA1ID09IHR5cGU7XG4gIHRoaXMuZXJyb3IgPSAoNCA9PSB0eXBlIHx8IDUgPT0gdHlwZSlcbiAgICA/IHRoaXMudG9FcnJvcigpXG4gICAgOiBmYWxzZTtcblxuICAvLyBzdWdhclxuICB0aGlzLmFjY2VwdGVkID0gMjAyID09IHN0YXR1cztcbiAgdGhpcy5ub0NvbnRlbnQgPSAyMDQgPT0gc3RhdHVzIHx8IDEyMjMgPT0gc3RhdHVzO1xuICB0aGlzLmJhZFJlcXVlc3QgPSA0MDAgPT0gc3RhdHVzO1xuICB0aGlzLnVuYXV0aG9yaXplZCA9IDQwMSA9PSBzdGF0dXM7XG4gIHRoaXMubm90QWNjZXB0YWJsZSA9IDQwNiA9PSBzdGF0dXM7XG4gIHRoaXMubm90Rm91bmQgPSA0MDQgPT0gc3RhdHVzO1xuICB0aGlzLmZvcmJpZGRlbiA9IDQwMyA9PSBzdGF0dXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBgRXJyb3JgIHJlcHJlc2VudGF0aXZlIG9mIHRoaXMgcmVzcG9uc2UuXG4gKlxuICogQHJldHVybiB7RXJyb3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS50b0Vycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHJlcSA9IHRoaXMucmVxO1xuICB2YXIgbWV0aG9kID0gcmVxLm1ldGhvZDtcbiAgdmFyIHBhdGggPSByZXEucGF0aDtcblxuICB2YXIgbXNnID0gJ2Nhbm5vdCAnICsgbWV0aG9kICsgJyAnICsgcGF0aCArICcgKCcgKyB0aGlzLnN0YXR1cyArICcpJztcbiAgdmFyIGVyciA9IG5ldyBFcnJvcihtc2cpO1xuICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVyci5tZXRob2QgPSBtZXRob2Q7XG4gIGVyci5wYXRoID0gcGF0aDtcblxuICByZXR1cm4gZXJyO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlYC5cbiAqL1xuXG5yZXF1ZXN0LlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgUmVxdWVzdGAgd2l0aCB0aGUgZ2l2ZW4gYG1ldGhvZGAgYW5kIGB1cmxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXRob2RcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gUmVxdWVzdChtZXRob2QsIHVybCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIEVtaXR0ZXIuY2FsbCh0aGlzKTtcbiAgdGhpcy5fcXVlcnkgPSB0aGlzLl9xdWVyeSB8fCBbXTtcbiAgdGhpcy5tZXRob2QgPSBtZXRob2Q7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmhlYWRlciA9IHt9O1xuICB0aGlzLl9oZWFkZXIgPSB7fTtcbiAgdGhpcy5vbignZW5kJywgZnVuY3Rpb24oKXtcbiAgICB2YXIgcmVzID0gbmV3IFJlc3BvbnNlKHNlbGYpO1xuICAgIGlmICgnSEVBRCcgPT0gbWV0aG9kKSByZXMudGV4dCA9IG51bGw7XG4gICAgc2VsZi5jYWxsYmFjayhudWxsLCByZXMpO1xuICB9KTtcbn1cblxuLyoqXG4gKiBNaXhpbiBgRW1pdHRlcmAuXG4gKi9cblxuRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7XG5cbi8qKlxuICogU2V0IHRpbWVvdXQgdG8gYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24obXMpe1xuICB0aGlzLl90aW1lb3V0ID0gbXM7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBDbGVhciBwcmV2aW91cyB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jbGVhclRpbWVvdXQgPSBmdW5jdGlvbigpe1xuICB0aGlzLl90aW1lb3V0ID0gMDtcbiAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFib3J0IHRoZSByZXF1ZXN0LCBhbmQgY2xlYXIgcG90ZW50aWFsIHRpbWVvdXQuXG4gKlxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbigpe1xuICBpZiAodGhpcy5hYm9ydGVkKSByZXR1cm47XG4gIHRoaXMuYWJvcnRlZCA9IHRydWU7XG4gIHRoaXMueGhyLmFib3J0KCk7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIHRoaXMuZW1pdCgnYWJvcnQnKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNldCBoZWFkZXIgYGZpZWxkYCB0byBgdmFsYCwgb3IgbXVsdGlwbGUgZmllbGRzIHdpdGggb25lIG9iamVjdC5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoJ0FjY2VwdCcsICdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuc2V0KCdYLUFQSS1LZXknLCAnZm9vYmFyJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC5zZXQoeyBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJywgJ1gtQVBJLUtleSc6ICdmb29iYXInIH0pXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBmaWVsZFxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKGZpZWxkLCB2YWwpe1xuICBpZiAoaXNPYmplY3QoZmllbGQpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGZpZWxkKSB7XG4gICAgICB0aGlzLnNldChrZXksIGZpZWxkW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV0gPSB2YWw7XG4gIHRoaXMuaGVhZGVyW2ZpZWxkXSA9IHZhbDtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEdldCBjYXNlLWluc2Vuc2l0aXZlIGhlYWRlciBgZmllbGRgIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaWVsZFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZ2V0SGVhZGVyID0gZnVuY3Rpb24oZmllbGQpe1xuICByZXR1cm4gdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgQ29udGVudC1UeXBlIHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgneG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LnBvc3QoJy8nKVxuICogICAgICAgIC50eXBlKCdhcHBsaWNhdGlvbi94bWwnKVxuICogICAgICAgIC5zZW5kKHhtbHN0cmluZylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnR5cGUgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0NvbnRlbnQtVHlwZScsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQWNjZXB0IHRvIGB0eXBlYCwgbWFwcGluZyB2YWx1ZXMgZnJvbSBgcmVxdWVzdC50eXBlc2AuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICBzdXBlcmFnZW50LnR5cGVzLmpzb24gPSAnYXBwbGljYXRpb24vanNvbic7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdqc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiAgICAgIHJlcXVlc3QuZ2V0KCcvYWdlbnQnKVxuICogICAgICAgIC5hY2NlcHQoJ2FwcGxpY2F0aW9uL2pzb24nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhY2NlcHRcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hY2NlcHQgPSBmdW5jdGlvbih0eXBlKXtcbiAgdGhpcy5zZXQoJ0FjY2VwdCcsIHJlcXVlc3QudHlwZXNbdHlwZV0gfHwgdHlwZSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgQXV0aG9yaXphdGlvbiBmaWVsZCB2YWx1ZSB3aXRoIGB1c2VyYCBhbmQgYHBhc3NgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1c2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gcGFzc1xuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmF1dGggPSBmdW5jdGlvbih1c2VyLCBwYXNzKXtcbiAgdmFyIHN0ciA9IGJ0b2EodXNlciArICc6JyArIHBhc3MpO1xuICB0aGlzLnNldCgnQXV0aG9yaXphdGlvbicsICdCYXNpYyAnICsgc3RyKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiogQWRkIHF1ZXJ5LXN0cmluZyBgdmFsYC5cbipcbiogRXhhbXBsZXM6XG4qXG4qICAgcmVxdWVzdC5nZXQoJy9zaG9lcycpXG4qICAgICAucXVlcnkoJ3NpemU9MTAnKVxuKiAgICAgLnF1ZXJ5KHsgY29sb3I6ICdibHVlJyB9KVxuKlxuKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHZhbFxuKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiogQGFwaSBwdWJsaWNcbiovXG5cblJlcXVlc3QucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24odmFsKXtcbiAgaWYgKCdzdHJpbmcnICE9IHR5cGVvZiB2YWwpIHZhbCA9IHNlcmlhbGl6ZSh2YWwpO1xuICBpZiAodmFsKSB0aGlzLl9xdWVyeS5wdXNoKHZhbCk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZW5kIGBkYXRhYCwgZGVmYXVsdGluZyB0aGUgYC50eXBlKClgIHRvIFwianNvblwiIHdoZW5cbiAqIGFuIG9iamVjdCBpcyBnaXZlbi5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICAgICAvLyBxdWVyeXN0cmluZ1xuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG11bHRpcGxlIGRhdGEgXCJ3cml0ZXNcIlxuICogICAgICAgcmVxdWVzdC5nZXQoJy9zZWFyY2gnKVxuICogICAgICAgICAuc2VuZCh7IHNlYXJjaDogJ3F1ZXJ5JyB9KVxuICogICAgICAgICAuc2VuZCh7IHJhbmdlOiAnMS4uNScgfSlcbiAqICAgICAgICAgLnNlbmQoeyBvcmRlcjogJ2Rlc2MnIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbWFudWFsIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnanNvbicpXG4gKiAgICAgICAgIC5zZW5kKCd7XCJuYW1lXCI6XCJ0alwifSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIGpzb25cbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwgeC13d3ctZm9ybS11cmxlbmNvZGVkXG4gKiAgICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAqICAgICAgICAgLnR5cGUoJ2Zvcm0nKVxuICogICAgICAgICAuc2VuZCgnbmFtZT10aicpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gYXV0byB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGRlZmF1bHRzIHRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICAqICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gICogICAgICAgIC5zZW5kKCduYW1lPXRvYmknKVxuICAqICAgICAgICAuc2VuZCgnc3BlY2llcz1mZXJyZXQnKVxuICAqICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZGF0YVxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKXtcbiAgdmFyIG9iaiA9IGlzT2JqZWN0KGRhdGEpO1xuICB2YXIgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcblxuICAvLyBtZXJnZVxuICBpZiAob2JqICYmIGlzT2JqZWN0KHRoaXMuX2RhdGEpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgIHRoaXMuX2RhdGFba2V5XSA9IGRhdGFba2V5XTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoJ3N0cmluZycgPT0gdHlwZW9mIGRhdGEpIHtcbiAgICBpZiAoIXR5cGUpIHRoaXMudHlwZSgnZm9ybScpO1xuICAgIHR5cGUgPSB0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyk7XG4gICAgaWYgKCdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnID09IHR5cGUpIHtcbiAgICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9kYXRhXG4gICAgICAgID8gdGhpcy5fZGF0YSArICcmJyArIGRhdGFcbiAgICAgICAgOiBkYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kYXRhID0gKHRoaXMuX2RhdGEgfHwgJycpICsgZGF0YTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fZGF0YSA9IGRhdGE7XG4gIH1cblxuICBpZiAoIW9iaikgcmV0dXJuIHRoaXM7XG4gIGlmICghdHlwZSkgdGhpcy50eXBlKCdqc29uJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbnZva2UgdGhlIGNhbGxiYWNrIHdpdGggYGVycmAgYW5kIGByZXNgXG4gKiBhbmQgaGFuZGxlIGFyaXR5IGNoZWNrLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtSZXNwb25zZX0gcmVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jYWxsYmFjayA9IGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgdmFyIGZuID0gdGhpcy5fY2FsbGJhY2s7XG4gIGlmICgyID09IGZuLmxlbmd0aCkgcmV0dXJuIGZuKGVyciwgcmVzKTtcbiAgaWYgKGVycikgcmV0dXJuIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICBmbihyZXMpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB4LWRvbWFpbiBlcnJvci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jcm9zc0RvbWFpbkVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcignT3JpZ2luIGlzIG5vdCBhbGxvd2VkIGJ5IEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbicpO1xuICBlcnIuY3Jvc3NEb21haW4gPSB0cnVlO1xuICB0aGlzLmNhbGxiYWNrKGVycik7XG59O1xuXG4vKipcbiAqIEludm9rZSBjYWxsYmFjayB3aXRoIHRpbWVvdXQgZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dEVycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHRpbWVvdXQgPSB0aGlzLl90aW1lb3V0O1xuICB2YXIgZXJyID0gbmV3IEVycm9yKCd0aW1lb3V0IG9mICcgKyB0aW1lb3V0ICsgJ21zIGV4Y2VlZGVkJyk7XG4gIGVyci50aW1lb3V0ID0gdGltZW91dDtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBFbmFibGUgdHJhbnNtaXNzaW9uIG9mIGNvb2tpZXMgd2l0aCB4LWRvbWFpbiByZXF1ZXN0cy5cbiAqXG4gKiBOb3RlIHRoYXQgZm9yIHRoaXMgdG8gd29yayB0aGUgb3JpZ2luIG11c3Qgbm90IGJlXG4gKiB1c2luZyBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiIHdpdGggYSB3aWxkY2FyZCxcbiAqIGFuZCBhbHNvIG11c3Qgc2V0IFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIlxuICogdG8gXCJ0cnVlXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS53aXRoQ3JlZGVudGlhbHMgPSBmdW5jdGlvbigpe1xuICB0aGlzLl93aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogSW5pdGlhdGUgcmVxdWVzdCwgaW52b2tpbmcgY2FsbGJhY2sgYGZuKHJlcylgXG4gKiB3aXRoIGFuIGluc3RhbmNlb2YgYFJlc3BvbnNlYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmVuZCA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB2YXIgeGhyID0gdGhpcy54aHIgPSBnZXRYSFIoKTtcbiAgdmFyIHF1ZXJ5ID0gdGhpcy5fcXVlcnkuam9pbignJicpO1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBkYXRhID0gdGhpcy5fZGF0YTtcblxuICAvLyBzdG9yZSBjYWxsYmFja1xuICB0aGlzLl9jYWxsYmFjayA9IGZuIHx8IG5vb3A7XG5cbiAgLy8gc3RhdGUgY2hhbmdlXG4gIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuICAgIGlmICg0ICE9IHhoci5yZWFkeVN0YXRlKSByZXR1cm47XG4gICAgaWYgKDAgPT0geGhyLnN0YXR1cykge1xuICAgICAgaWYgKHNlbGYuYWJvcnRlZCkgcmV0dXJuIHNlbGYudGltZW91dEVycm9yKCk7XG4gICAgICByZXR1cm4gc2VsZi5jcm9zc0RvbWFpbkVycm9yKCk7XG4gICAgfVxuICAgIHNlbGYuZW1pdCgnZW5kJyk7XG4gIH07XG5cbiAgLy8gcHJvZ3Jlc3NcbiAgaWYgKHhoci51cGxvYWQpIHtcbiAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbihlKXtcbiAgICAgIGUucGVyY2VudCA9IGUubG9hZGVkIC8gZS50b3RhbCAqIDEwMDtcbiAgICAgIHNlbGYuZW1pdCgncHJvZ3Jlc3MnLCBlKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gdGltZW91dFxuICBpZiAodGltZW91dCAmJiAhdGhpcy5fdGltZXIpIHtcbiAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNlbGYuYWJvcnQoKTtcbiAgICB9LCB0aW1lb3V0KTtcbiAgfVxuXG4gIC8vIHF1ZXJ5c3RyaW5nXG4gIGlmIChxdWVyeSkge1xuICAgIHF1ZXJ5ID0gcmVxdWVzdC5zZXJpYWxpemVPYmplY3QocXVlcnkpO1xuICAgIHRoaXMudXJsICs9IH50aGlzLnVybC5pbmRleE9mKCc/JylcbiAgICAgID8gJyYnICsgcXVlcnlcbiAgICAgIDogJz8nICsgcXVlcnk7XG4gIH1cblxuICAvLyBpbml0aWF0ZSByZXF1ZXN0XG4gIHhoci5vcGVuKHRoaXMubWV0aG9kLCB0aGlzLnVybCwgdHJ1ZSk7XG5cbiAgLy8gQ09SU1xuICBpZiAodGhpcy5fd2l0aENyZWRlbnRpYWxzKSB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcblxuICAvLyBib2R5XG4gIGlmICgnR0VUJyAhPSB0aGlzLm1ldGhvZCAmJiAnSEVBRCcgIT0gdGhpcy5tZXRob2QgJiYgJ3N0cmluZycgIT0gdHlwZW9mIGRhdGEgJiYgIWlzSG9zdChkYXRhKSkge1xuICAgIC8vIHNlcmlhbGl6ZSBzdHVmZlxuICAgIHZhciBzZXJpYWxpemUgPSByZXF1ZXN0LnNlcmlhbGl6ZVt0aGlzLmdldEhlYWRlcignQ29udGVudC1UeXBlJyldO1xuICAgIGlmIChzZXJpYWxpemUpIGRhdGEgPSBzZXJpYWxpemUoZGF0YSk7XG4gIH1cblxuICAvLyBzZXQgaGVhZGVyIGZpZWxkc1xuICBmb3IgKHZhciBmaWVsZCBpbiB0aGlzLmhlYWRlcikge1xuICAgIGlmIChudWxsID09IHRoaXMuaGVhZGVyW2ZpZWxkXSkgY29udGludWU7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoZmllbGQsIHRoaXMuaGVhZGVyW2ZpZWxkXSk7XG4gIH1cblxuICAvLyBzZW5kIHN0dWZmXG4gIHhoci5zZW5kKGRhdGEpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXF1ZXN0YC5cbiAqL1xuXG5yZXF1ZXN0LlJlcXVlc3QgPSBSZXF1ZXN0O1xuXG4vKipcbiAqIElzc3VlIGEgcmVxdWVzdDpcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICByZXF1ZXN0KCdHRVQnLCAnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJywgY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IHVybCBvciBjYWxsYmFja1xuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcmVxdWVzdChtZXRob2QsIHVybCkge1xuICAvLyBjYWxsYmFja1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdXJsKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpLmVuZCh1cmwpO1xuICB9XG5cbiAgLy8gdXJsIGZpcnN0XG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCk7XG4gIH1cblxuICByZXR1cm4gbmV3IFJlcXVlc3QobWV0aG9kLCB1cmwpO1xufVxuXG4vKipcbiAqIEdFVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5nZXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0dFVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnF1ZXJ5KGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBIRUFEIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmhlYWQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0hFQUQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBERUxFVEUgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZGVsID0gZnVuY3Rpb24odXJsLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdERUxFVEUnLCB1cmwpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQQVRDSCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBhdGNoID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQQVRDSCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBPU1QgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wb3N0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQT1NUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUFVUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucHV0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQVVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYHJlcXVlc3RgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWVzdDtcbiIsIlxuLyoqXG4gKiBFeHBvc2UgYEVtaXR0ZXJgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBFbWl0dGVyYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIEVtaXR0ZXIob2JqKSB7XG4gIGlmIChvYmopIHJldHVybiBtaXhpbihvYmopO1xufTtcblxuLyoqXG4gKiBNaXhpbiB0aGUgZW1pdHRlciBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1peGluKG9iaikge1xuICBmb3IgKHZhciBrZXkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtcbiAgICBvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV07XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICAodGhpcy5fY2FsbGJhY2tzW2V2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW10pXG4gICAgLnB1c2goZm4pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICBmdW5jdGlvbiBvbigpIHtcbiAgICBzZWxmLm9mZihldmVudCwgb24pO1xuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBmbi5fb2ZmID0gb247XG4gIHRoaXMub24oZXZlbnQsIG9uKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGBldmVudGAgb3IgYWxsXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vZmYgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIC8vIGFsbFxuICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBzcGVjaWZpYyBldmVudFxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgaWYgKCFjYWxsYmFja3MpIHJldHVybiB0aGlzO1xuXG4gIC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcbiAgdmFyIGkgPSBjYWxsYmFja3MuaW5kZXhPZihmbi5fb2ZmIHx8IGZuKTtcbiAgaWYgKH5pKSBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICwgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcblxuICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW107XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XG59O1xuIiwiXG4vKipcbiAqIFJlZHVjZSBgYXJyYCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtNaXhlZH0gaW5pdGlhbFxuICpcbiAqIFRPRE86IGNvbWJhdGlibGUgZXJyb3IgaGFuZGxpbmc/XG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnIsIGZuLCBpbml0aWFsKXsgIFxuICB2YXIgaWR4ID0gMDtcbiAgdmFyIGxlbiA9IGFyci5sZW5ndGg7XG4gIHZhciBjdXJyID0gYXJndW1lbnRzLmxlbmd0aCA9PSAzXG4gICAgPyBpbml0aWFsXG4gICAgOiBhcnJbaWR4KytdO1xuXG4gIHdoaWxlIChpZHggPCBsZW4pIHtcbiAgICBjdXJyID0gZm4uY2FsbChudWxsLCBjdXJyLCBhcnJbaWR4XSwgKytpZHgsIGFycik7XG4gIH1cbiAgXG4gIHJldHVybiBjdXJyO1xufTsiLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwibmFtZVwiOiBcImNhcnZveWFudFwiLFxuICBcImRlc2NyaXB0aW9uXCI6IFwiVGhlIENhcnZveWFudCBBUEkgY2xpZW50IGxpYnJhcnkuXCIsXG4gIFwidmVyc2lvblwiOiBcIjAuMC4zXCIsXG4gIFwiYXV0aG9yXCI6IHtcbiAgICBcIm5hbWVcIjogXCJKZXJlbXkgV2hpdGxvY2tcIixcbiAgICBcImVtYWlsXCI6IFwiandoaXRsb2NrQGFwYWNoZS5vcmdcIlxuICB9LFxuICBcImJ1Z3NcIjogXCJodHRwczovL2dpdGh1Yi5jb20vd2hpdGxvY2tqYy9jYXJ2b3lhbnQvaXNzdWVzXCIsXG4gIFwiaG9tZXBhZ2VcIjogXCJodHRwczovL2dpdGh1Yi5jb20vd2hpdGxvY2tqYy9jYXJ2b3lhbnRcIixcbiAgXCJsaWNlbnNlc1wiOiBbXG4gICAge1xuICAgICAgXCJ0eXBlXCI6IFwiQXBhY2hlLTIuMFwiLFxuICAgICAgXCJ1cmxcIjogXCJodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcIlxuICAgIH1cbiAgXSxcbiAgXCJyZXBvc2l0b3J5XCI6IHtcbiAgICBcInR5cGVcIjogXCJnaXRcIixcbiAgICBcInVybFwiOiBcImdpdDovL2dpdGh1Yi5jb20vd2hpdGxvY2tqYy9jYXJ2b3lhbnQuZ2l0XCJcbiAgfSxcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcInRlc3RcIjogXCJncnVudCBub2RldW5pdCBrYXJtYVwiXG4gIH0sXG4gIFwia2V5d29yZHNcIjogW1xuICAgIFwiY2Fydm95YW50XCJcbiAgXSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwibG9kYXNoLmFzc2lnblwiOiBcIn4yLjMuMFwiLFxuICAgIFwibG9kYXNoLmNvbnRhaW5zXCI6IFwifjIuMy4wXCIsXG4gICAgXCJsb2Rhc2guZmluZFwiOiBcIn4yLjMuMFwiLFxuICAgIFwibG9kYXNoLmZvcmVhY2hcIjogXCJ+Mi4zLjBcIixcbiAgICBcImxvZGFzaC5pc2Jvb2xlYW5cIjogXCJ+Mi4zLjBcIixcbiAgICBcImxvZGFzaC5pc2RhdGVcIjogXCJ+Mi4zLjBcIixcbiAgICBcImxvZGFzaC5pc2Z1bmN0aW9uXCI6IFwifjIuMy4wXCIsXG4gICAgXCJsb2Rhc2guaXNudWxsXCI6IFwifjIuMy4wXCIsXG4gICAgXCJsb2Rhc2guaXNudW1iZXJcIjogXCJ+Mi4zLjBcIixcbiAgICBcImxvZGFzaC5pc29iamVjdFwiOiBcIn4yLjMuMFwiLFxuICAgIFwibG9kYXNoLmlzc3RyaW5nXCI6IFwifjIuMy4wXCIsXG4gICAgXCJsb2Rhc2guaXN1bmRlZmluZWRcIjogXCJ+Mi4zLjBcIixcbiAgICBcInN1cGVyYWdlbnRcIjogXCJ+MC4xNi4wXCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiYnJvd3NlcmlmeVwiOiBcIn4yLjM1LjRcIixcbiAgICBcImdydW50XCI6IFwifjAuNC4xXCIsXG4gICAgXCJncnVudC1icm93c2VyaWZ5XCI6IFwifjEuMi4xMVwiLFxuICAgIFwiZ3J1bnQtY29udHJpYi1jbGVhblwiOiBcIn4wLjUuMFwiLFxuICAgIFwiZ3J1bnQtY29udHJpYi1qc2hpbnRcIjogXCJ+MC42LjRcIixcbiAgICBcImdydW50LWNvbnRyaWItbm9kZXVuaXRcIjogXCJ+MC4yLjBcIixcbiAgICBcImdydW50LWNvbnRyaWItdWdsaWZ5XCI6IFwifjAuMi43XCIsXG4gICAgXCJncnVudC1qc2RvY1wiOiBcIn4wLjQuMlwiLFxuICAgIFwiZ3J1bnQta2FybWFcIjogXCJ+MC42LjJcIixcbiAgICBcImdydW50LXJlbGVhc2VcIjogXCJ+MC42LjBcIixcbiAgICBcImthcm1hXCI6IFwifjAuMTAuNFwiLFxuICAgIFwia2FybWEtY2hyb21lLWxhdW5jaGVyXCI6IFwifjAuMS4wXCIsXG4gICAgXCJrYXJtYS1jb2ZmZWUtcHJlcHJvY2Vzc29yXCI6IFwifjAuMS4wXCIsXG4gICAgXCJrYXJtYS1maXJlZm94LWxhdW5jaGVyXCI6IFwifjAuMS4wXCIsXG4gICAgXCJrYXJtYS1odG1sMmpzLXByZXByb2Nlc3NvclwiOiBcIn4wLjEuMFwiLFxuICAgIFwia2FybWEtamFzbWluZVwiOiBcIn4wLjEuM1wiLFxuICAgIFwia2FybWEtbm9kZXVuaXRcIjogXCJ+MC4xLjFcIixcbiAgICBcImthcm1hLXBoYW50b21qcy1sYXVuY2hlclwiOiBcIn4wLjEuMFwiLFxuICAgIFwia2FybWEtcmVxdWlyZWpzXCI6IFwifjAuMS4wXCIsXG4gICAgXCJrYXJtYS1zY3JpcHQtbGF1bmNoZXJcIjogXCJ+MC4xLjBcIixcbiAgICBcImxvZGFzaC5pc2FycmF5XCI6IFwifjIuMy4wXCIsXG4gICAgXCJsb2Rhc2gubWFwXCI6IFwifjIuMy4wXCJcbiAgfSxcbiAgXCJtYWluXCI6IFwibGliL2NhcnZveWFudFwiLFxuICBcImVuZ2luZXNcIjoge1xuICAgIFwibm9kZVwiOiBcIj49IDAuOC4wXCJcbiAgfVxufVxuIl19
(1)
});
;