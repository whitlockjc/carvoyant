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
var DEFAULT_API_URL = 'https://api.carvoyant.com/v1/api';

/**
 * The old Carvoyant API URL.
 *
 * @constant
 * @type {string}
 * @default
 */

var OLD_API_URL = 'https://dash.carvoyant.com/api';

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
 * @param {string} options.apiKey - (deprecated) Your API Key
 * @param {string} options.securityToken - (deprecated) Your Security Token
 * @param {string} options.accessToken - Your OAuth access token
 *
 * @constructor Client
 */
function Client (options) {

  var accessToken
    , apiKey
    , securityToken;

  // Default options to an empty object
  if (!options) {
    options = {};
  }

  accessToken = options.accessToken;
  apiKey = options.apiKey;
  securityToken = options.securityToken;

  if (!accessToken && !(apiKey && securityToken)) {
    throw new Error('options.accessToken or both options.apiKey and options.securityToken are required.');
  }

  // Set defaults
  if (!options.apiUrl && options.accessToken) {
    options.apiUrl = DEFAULT_API_URL;
  } else if (!options.apiUrl) {
    options.apiUrl = OLD_API_URL;
  }

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
 * @deprecated since version 0.0.5
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
 * @param {string} eventType - The event type
 * @param {object} eventSubscription - The event subscription
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 *
 * @function Client#createEventSubscription
 */
Client.prototype.createEventSubscription = function (vehicleId, eventType, eventSubscription, cb) {

  // We do not validate the event subscription type to avoid the API breaking when upstream types are added/deleted

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  if (_.isUndefined(eventType)) {
    throw new TypeError('eventType must be defined.');
  }

  if (_.isUndefined(eventSubscription)) {
    throw new TypeError('eventSubscription must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleId + '/eventSubscription' + (eventType ? '/' + eventType : ''),
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
 * @param {string} [eventType] - The event type
 *
 * @function Client#deleteEventSubscription
 */
Client.prototype.deleteEventSubscription = function (vehicleId, eventSubscriptionId, cb, eventType) {

  // We do not validate the event subscription type to avoid the API breaking when upstream types are added/deleted

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  if (_.isUndefined(eventSubscriptionId)) {
    throw new TypeError('eventSubscriptionId must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleId + '/eventSubscription' + (eventType ? '/' + eventType : '') + '/' +
                       eventSubscriptionId, 'delete', cb);

};

/**
 * Deletes a vehicle.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/Vehicle}
 *
 * @param {object} vehicleId - The vehicle id
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 *
 * @function Client#deleteVehicle
 */
Client.prototype.deleteVehicle = function (vehicleId, cb) {

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleId, 'delete', cb);

};

/**
 * Returns the event notification details.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/EventNotification}
 *
 * @param {string} vehicleId - The vehicle id
 * @param {string} eventNotificationId - The event notification id
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 * @param {string} [eventType] - The event type
 *
 * @function Client#eventNotificationDetails
 */
Client.prototype.eventNotificationDetails = function (vehicleId, eventNotificationId, cb, eventType) {

  // We do not validate the event notification type to avoid the API breaking when upstream types are added/deleted

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  if (_.isUndefined(eventNotificationId)) {
    throw new TypeError('eventNotificationId must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleId + '/eventNotification' + (eventType ? '/' + eventType : '') + '/' +
                       eventNotificationId, 'get', cb);

};

/**
 * Returns the event notifications.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/EventNotification}
 *
 * @param {string} vehicleId - The vehicle id
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 * @param {string} [eventType] - If provided, return only event notifications of the given type
 *
 * @function Client#eventNotifications
 */
Client.prototype.eventNotifications = function (vehicleId, cb, eventType) {

  // We do not validate the event notification type to avoid the API breaking when upstream types are added/deleted

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleId + '/eventNotification' + (eventType ? '/' + eventType : ''), 'get', cb);

};

/**
 * Returns the event subscription details.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/EventSubscription}
 *
 * @param {string} vehicleId - The vehicle id
 * @param {string} eventSubscriptionId - The event subscription id
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 * @param {string} [eventType] - The event type
 *
 * @function Client#eventSubscriptionDetails
 */
Client.prototype.eventSubscriptionDetails = function (vehicleId, eventSubscriptionId, cb, eventType) {

  // We do not validate the event subscription type to avoid the API breaking when upstream types are added/deleted

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  if (_.isUndefined(eventSubscriptionId)) {
    throw new TypeError('eventSubscriptionId must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleId + '/eventSubscription' + (eventType ? '/' + eventType : '') + '/' +
                       eventSubscriptionId, 'get', cb);

};

/**
 * Returns the event subscriptions.
 *
 * @see {@link http://confluence.carvoyant.com/display/PUBDEV/EventSubscription}
 *
 * @param {string} vehicleId - The vehicle id
 * @param {module:carvoyant/client~responseCallback} cb - The callback to invoke upon response received
 * @param {string} [eventType] - If provided, return only event subscriptions of the given type
 *
 * @function Client#eventSubscriptions
 */
Client.prototype.eventSubscriptions = function (vehicleId, cb, eventType) {

  // We do not validate the event subscription type to avoid the API breaking when upstream types are added/deleted

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleId + '/eventSubscription' + (eventType ? '/' + eventType : ''), 'get', cb);

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
 * @function Client#updateEventSubscription
 */
Client.prototype.updateEventSubscription = function (vehicleId, eventSubscription, cb) {

  if (_.isUndefined(vehicleId)) {
    throw new TypeError('vehicleId must be defined.');
  }

  if (_.isUndefined(eventSubscription)) {
    throw new TypeError('eventSubscription must be defined.');
  }

  this.makeRequest('/vehicle/' + vehicleId + '/eventSubscription/' +
                       utils.externalizeEventType(eventSubscription._type) + '/' + eventSubscription.id,
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
 * @deprecated since version 0.0.5
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

  // APIs that don't end in / result in '596 Service Not Found'
  if (this.accessToken && apiPath.slice(-1) !== '/') {
    apiPath = apiPath + '/';
  }

  var r = request[method !== 'delete' ? method : 'del'](this.apiUrl + apiPath)
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

  if (this.accessToken) {
    r.set('Authorization', 'Bearer ' + this.accessToken);
  } else {
    r.auth(this.apiKey, this.securityToken);
  }

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
  //   Browser: res.req.url (The full URL of the request)
  //   Node.js: res.req.path (The path portion of the request)
  var path = _.isUndefined(res.req.path) ?
    res.req.url.replace(this.apiUrl, '') :
    res.req.path;

  // This step is not required for Browser but required for Node.js
  if (path.indexOf('/api') > -1) {
    path = path.split('/api')[1];
  }

  this.makeRequest(path.split('?')[0], res.req.method.toLowerCase(), cb,
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
