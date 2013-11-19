/**
 * Tests for lib/utils.
 *
 * NOTE: These tests are live tests and as such can be somewhat brittle.  With there being no APIs for putting data
 *       into the Carvoyant API, there is no other way to do this without mocking.
 */

'use strict';

var _ = {
    contains: require('lodash.contains'),
    each: require('lodash.foreach'),
    isArray: require('lodash.isarray'),
    isObject: require('lodash.isobject'),
    isUndefined: require('lodash.isundefined'),
    map: require('lodash.map')
  }
  , Carvoyant = require('..')
  , realConfig = require('./client_config')
  , Client = Carvoyant.Client;

/**
 * Test that an empty {@link Client} constructor throws an error.
 */
exports.testEmptyClientOptions = function (test) {

  // Ensure an Error is thrown (We'll test for specific Error messages below)
  test.throws(function () {

    new Client();

  }, Error);

  // Obligatory nodeunit completion signal
  test.done();

};

/**
 * Test that a missing **apiKey** {@link Client} option throws the appropriate error.
 */
exports.testMissingClientAPIKey = function (test) {

  try {
    new Client({
      securityToken: 'fakeSecurityToken'
    });
    test.fail('Creating a Client without an apiKey should fail.');
  } catch (err) {
    test.strictEqual('options.apiKey is a required Client option.', err.message);
  }

  // Obligatory nodeunit completion signal
  test.done();

};

/**
 * Test that a missing **securityToken** {@link Client} option throws the appropriate error.
 */
exports.testMissingClientSecurityToken = function (test) {

  try {
    new Client({
      apiKey: 'fakeAPIKey'
    });
    test.fail('Creating a Client without a securityToken should fail.');
  } catch (err) {
    test.strictEqual('options.securityToken is a required Client option.', err.message);
  }

  // Obligatory nodeunit completion signal
  test.done();

};

/**
 * Test creating a new {@link Client}.
 */
exports.testNewClient = function (test) {

  var fakeConfig = {
      apiKey: 'fakeAPIKey',
      securityToken: 'fakeSecurityToken'
    }
    , client = new Client(fakeConfig);

  test.strictEqual(client.apiKey, fakeConfig.apiKey);
  test.strictEqual(client.securityToken, fakeConfig.securityToken);
  // TODO: Rewrite this to access the exposed default URL
  test.strictEqual(client.apiUrl, 'https://dash.carvoyant.com/api');

  // Obligatory nodeunit completion signal
  test.done();

};

/**
 * Test creating a new {@link Client} with an overloaded baseUrl.
 */
exports.testNewClientWithCustomApiUrl = function (test) {

  var fakeConfig = {
      apiKey: 'fakeAPIKey',
      securityToken: 'fakeSecurityToken',
      apiUrl: 'http://dev.carvoyant.com/api'
    }
    , client = new Client(fakeConfig);

  test.strictEqual(client.apiKey, fakeConfig.apiKey);
  test.strictEqual(client.securityToken, fakeConfig.securityToken);
  test.strictEqual(client.apiUrl, fakeConfig.apiUrl);

  // Obligatory nodeunit completion signal
  test.done();

};

/**
 * Test {@link Client#vehicles} works as expected.
 */
exports.testListVehicles = function (test) {

  var client = new Client(realConfig);

  client.vehicles(function (res) {

    test.strictEqual(200, res.status);
    test.ok(_.isArray(res.body.vehicle));
    test.ok(res.body.vehicle.length > 0);

    // Obligatory nodeunit completion signal
    test.done();

  });

};

/**
 * Test {@link Client#vehicle} works as expected.
 */
exports.testGetVehicleById = function (test) {

  var client = new Client(realConfig);

  client.vehicles(function (res) {

    var vehicle = res.body.vehicle[0];

    client.vehicle(vehicle.deviceId, function (res2) {

      test.strictEqual(200, res2.status);
      test.ok(_.isObject(res2.body.vehicle));
      test.strictEqual(vehicle.name, res2.body.vehicle.name);

      // Obligatory nodeunit completion signal
      test.done();

    });

  });

};

/**
 * Test that invalid values passed to {@link Client#vehicleTrips} throw the proper error.
 */
exports.testListTripsInvalidArguments = function (test) {

  var client = new Client(realConfig)
    , invalidValues = [
      {
        key: 'includeData',
        value: 'NotBoolean',
        message: 'includeData must be a Boolean.'
      },
      {
        key: 'startTime',
        value: 'NotDate',
        message: 'startTime must be a Date.'
      },
      {
        key: 'endTime',
        value: 'NotDate',
        message: 'endTime must be a Date.'
      }
    ];

  _.each(invalidValues, function (invalidValue) {

    var query = {};

    try {
      query[invalidValue.key] = invalidValue.value;

      client.vehicleTrips('Fake', null, query);
    } catch (err) {
      test.ok(err instanceof TypeError);
      test.strictEqual(invalidValue.message, err.message);
    }

  });

  // Obligatory nodeunit completion signal
  test.done();

};

/**
 * Test {@link Client#vehicleTrips} works as expected.
 */
exports.testListTrips = function (test) {

  var client = new Client(realConfig);

  client.vehicles(function (res) {

    var vehicle = res.body.vehicle[0]
      , defaultPageSize = 20;

    client.vehicleTrips(vehicle.deviceId, function (res2) {

      test.strictEqual(200, res2.status);
      test.ok(_.isArray(res2.body.trip));
      test.strictEqual(defaultPageSize, res2.body.trip.length);
      test.ok(_.isArray(res2.body.actions));

      if (res2.body.totalRecords > defaultPageSize) {
        test.strictEqual('next', res2.body.actions[0].name);

        client.vehicleTrips(vehicle.deviceId, function (res3) {

          test.notStrictEqual(res2.body.trip[0].id, res3.body.trip[0].id);

          client.nextPage(res3);

          // Obligatory nodeunit completion signal
          test.done();

        }, {
          searchOffset: defaultPageSize + 1
        });
      } else {
        // Obligatory nodeunit completion signal
        test.done();
      }

    });

  });

};

/**
 * Test that invalid values passed to {@link Client#makeRequest} throw the proper error.
 */
exports.testMakeRequestInvalidArgument = function (test) {

  var client = new Client(realConfig)
    , invalidValues = [
      {
        key: 'searchLimit',
        value: 'NotNumber',
        message: 'searchLimit must be a Number.'
      },
      {
        key: 'searchOffset',
        value: 'NotNumber',
        message: 'searchOffset must be a Number.'
      },
      {
        key: 'sortOrder',
        value: 'NotValid',
        message: 'sortOrder must be one of the following: asc, desc'
      }
    ];

  _.each(invalidValues, function (invalidValue) {

    var query = {};

    try {
      query[invalidValue.key] = invalidValue.value;

      client.vehicleTrips('Fake', null, query);
    } catch (err) {
      test.ok(err instanceof TypeError);
      test.strictEqual(invalidValue.message, err.message);
    }

  });

  // Obligatory nodeunit completion signal
  test.done();

};

/**
 * Test that calls to {@link Client#nextPage} and {@link Client#prevPage} work as expected.
 */
exports.testNextPageAndPrevPage = function (test) {

  var client = new Client(realConfig);

  client.vehicles(function (res) {

    var vehicle = res.body.vehicle[0];

    client.vehicleTrips(vehicle.deviceId, function (res2) {

      test.strictEqual(1, res2.body.trip.length);
      test.ok(!_.contains(_.map(res2.body.actions, function (action) { return action.name; }), 'previous'));

      client.nextPage(res2, function (res3) {

        var actions = _.map(res3.body.actions, function (action) { return action.name; });

        test.strictEqual(1, res3.body.trip.length);
        test.ok(_.contains(actions, 'previous'));
        test.ok(_.contains(actions, 'next'));

        client.prevPage(res3, function (res4) {

          test.ok(!_.contains(_.map(res4.body.actions, function (action) { return action.name; }), 'previous'));

          // Obligatory nodeunit completion signal
          test.done();

        });

      });

    }, {
      searchLimit: 1
    });

  });

};

/**
 * Test that invalid values passed to {@link Client#vehicleData} throw the proper error.
 */
exports.testVehicleDataInvalidArgument = function (test) {

  var client = new Client(realConfig)
    , invalidValues = [
      {
        key: 'mostRecentOnly',
        value: 'NotBoolean',
        message: 'mostRecentOnly must be a Boolean.'
      }
    ];

  _.each(invalidValues, function (invalidValue) {

    var query = {};

    try {
      query[invalidValue.key] = invalidValue.value;

      client.vehicleData('Fake', null, query);
    } catch (err) {
      test.ok(err instanceof TypeError);
      test.strictEqual(invalidValue.message, err.message);
    }

  });

  // Obligatory nodeunit completion signal
  test.done();

};

/**
 * Test that calls to {@link Client#vehicleData} work as expected.
 */
exports.testVehicleData = function (test) {

  var client = new Client(realConfig);

  client.vehicles(function (res) {

    var vehicle = res.body.vehicle[0];

    client.vehicleData(vehicle.deviceId, function (res) {

      test.strictEqual(-1, (_.isUndefined(res.req.path) ? res.req.url : res.req.path).indexOf('mostRecentOnly'));
      test.ok(_.isArray(res.body.data));
      test.ok(res.body.data.length > 0);

      // Obligatory nodeunit completion signal
      test.done();

    }, {
      mostRecentOnly: false
    });

  });

};

/**
 * Test that calls to {@link Client#tripDetails} work as expected.
 */
exports.testTripDetails = function (test) {

  var client = new Client(realConfig);

  client.vehicles(function (res) {

    var vehicle = res.body.vehicle[0];

    client.vehicleTrips(vehicle.deviceId, function (res2) {

      var trip = res2.body.trip[0];

      client.tripDetails(vehicle.deviceId, trip.id, function (res3) {

        test.strictEqual(trip.id, res3.body.trip.id);

        // Obligatory nodeunit completion signal
        test.done();

      });

    }, {
      searchLimit: 1
    });

  });

};
