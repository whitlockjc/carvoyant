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

  // We do not validate the constraint type to avoid the API breaking when upstream constraint types are added/deleted

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

  var r = request[method](this.apiUrl + apiPath).auth(this.apiKey, this.securityToken)
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
