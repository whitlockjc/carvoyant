/**
 * Tests for lib/client.js.
 *
 * NOTE: These tests are live tests and as such can be somewhat brittle.  Some of the APIs we use to write new data to
 *       Carvoyant do not have equivalent delete APIs so we cannot cleanup what we create.  This being said, try to use
 *       a set of Carvoyant credentials that you can fill with test data without concern.  You should be able to clean
 *       up your vehicle list from the Carvoyant Dashboard.
 */

'use strict';

var _ = {
    contains: require('lodash.contains'),
    each: require('lodash.foreach'),
    find: require('lodash.find'),
    isArray: require('lodash.isarray'),
    isBoolean: require('lodash.isboolean'),
    isNumber: require('lodash.isnumber'),
    isObject: require('lodash.isobject'),
    isUndefined: require('lodash.isundefined'),
    map: require('lodash.map')
  }
  , Carvoyant = require('..')
  , realConfig = require('./client_config')
  , Client = Carvoyant.Client
  , createdVehicle; // This will be created once to avoid unnecessary cleanup

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
 * Test {@link Client#createVehicle} works as expected.
 *
 * Note: This test *must* run successfully for the remaining tests to run
 */
exports.testCreateVehicle = function (test) {

  var client = new Client(realConfig)
    , timestamp = new Date().getTime();

  try {
    client.createVehicle();
  } catch (err) {
    test.ok(err instanceof TypeError);
    test.strictEqual('vehicleData must be defined.', err.message);
  }

  client.createVehicle({
    label: 'Test Vehicle ' + timestamp,
    mileage: 1
  }, function (res) {

    test.strictEqual(200, res.status);
    createdVehicle = res.body.vehicle;

    // Obligatory nodeunit completion signal
    test.done();

  });

};

/**
 * Test {@link Client#updateVehicle} works as expected.
 */
exports.testUpdateVehicle = function (test) {

  var client = new Client(realConfig);

  try {
    client.updateVehicle();
  } catch (err) {
    test.ok(err instanceof TypeError);
    test.strictEqual('vehicleData must be defined.', err.message);
  }

  try {
    client.updateVehicle({label: 'Testing'});
  } catch (err) {
    test.ok(err instanceof TypeError);
    test.strictEqual('vehicleData.vehicleId must be defined.', err.message);
  }

  createdVehicle.mileage += 1;

  client.updateVehicle(createdVehicle, function (res) {

    test.strictEqual(200, res.status);
    test.strictEqual(createdVehicle.mileage, res.body.vehicle.mileage);

    createdVehicle = res.body.vehicle;

    // Obligatory nodeunit completion signal
    test.done();

  });

};

/**
 * Test {@link Client#vehicles} works as expected.
 */
exports.testListVehicles = function (test) {

  var client = new Client(realConfig);

  client.vehicles(function (res) {

    test.strictEqual(200, res.status);
    test.ok(_.isArray(res.body.vehicle));

    // Obligatory nodeunit completion signal
    test.done();

  });

};

/**
 * Test {@link Client#vehicle} works as expected.
 */
exports.testGetVehicleById = function (test) {

  var client = new Client(realConfig);

  client.vehicle(createdVehicle.vehicleId, function (res) {

    test.strictEqual(200, res.status);
    test.ok(_.isObject(res.body.vehicle));
    test.strictEqual(createdVehicle.label, res.body.vehicle.label);

    // Obligatory nodeunit completion signal
    test.done();

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

  client.vehicleTrips(createdVehicle.vehicleId, function (res) {

    test.strictEqual(200, res.status);
    test.ok(_.isArray(res.body.trip));
    test.ok(_.isNumber(res.body.totalRecords));
    test.ok(_.isArray(res.body.actions));

    // Obligatory nodeunit completion signal
    test.done();

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

  try {
    client.vehicleData();
  } catch (err) {
    test.ok(err instanceof TypeError);
    test.strictEqual('vehicleId must be defined.', err.message);
  }

  client.vehicleData(createdVehicle.vehicleId, function (res) {

    test.strictEqual(200, res.status);
    test.strictEqual(-1, (_.isUndefined(res.req.path) ? res.req.url : res.req.path).indexOf('mostRecentOnly'));
    test.ok(_.isArray(res.body.data));

    // Obligatory nodeunit completion signal
    test.done();

  }, {
    mostRecentOnly: false
  });

};

/**
 * Test that calls to {@link Client#vehicleDataSet} work as expected.
 */
exports.testVehicleDataSet = function (test) {

  var client = new Client(realConfig);

  try {
    client.vehicleDataSet();
  } catch (err) {
    test.ok(err instanceof TypeError);
    test.strictEqual('vehicleId must be defined.', err.message);
  }

  client.vehicleDataSet(createdVehicle.vehicleId, function (res) {

    test.strictEqual(200, res.status);
    test.ok(_.isArray(res.body.dataSet));

    // Obligatory nodeunit completion signal
    test.done();

  });

};

/** All tests below this point have parts that are skipped if the required configuration is missing. **/

/**
 * Test that calls to {@link Client#tripDetails} work as expected.
 *
 * Note: Skipped if your client_config.js is missing the vehicleIdWithTripData option.
 */
exports.testTripDetails = function (test) {

  var client = new Client(realConfig);

  if (realConfig.vehicleIdWithTripData) {
    client.vehicleTrips(realConfig.vehicleIdWithTripData, function (res) {

      var trip = res.body.trip[0];

      client.tripDetails(realConfig.vehicleIdWithTripData, trip.id, function (res2) {

        test.strictEqual(trip.id, res2.body.trip.id);

        // Obligatory nodeunit completion signal
        test.done();

      });

    }, {
      searchLimit: 1
    });
  } else {
    // Obligatory nodeunit completion signal
    test.done();
  }

};

/**
 * Test that calls to {@link Client#vehicleConstraints} work as expected.
 */
exports.testVehicleConstraints = function (test) {

  var client = new Client(realConfig);

  try {
    client.vehicleConstraints();
  } catch (err) {
    test.ok(err instanceof TypeError);
    test.strictEqual('vehicleId must be defined.', err.message);
  }

  if (realConfig.vehicleIdWithConstraints) {
    client.vehicleConstraints(realConfig.vehicleIdWithConstraints, function (res) {

      test.strictEqual(200, res.status);
      test.ok(_.isArray(res.body.constraints));

      // Obligatory nodeunit completion signal
      test.done();

    });
  } else {
    // Obligatory nodeunit completion signal
    test.done();
  }

};

/**
 * Test that calls to {@link Client#constraintDetails} work as expected.
 */
exports.testConstraintDetails = function (test) {

  var client = new Client(realConfig);

  try {
    client.vehicleConstraints();
  } catch (err) {
    test.ok(err instanceof TypeError);
    test.strictEqual('vehicleId must be defined.', err.message);
  }

  try {
    client.vehicleConstraints(createdVehicle.vehicleId);
  } catch (err) {
    test.ok(err instanceof TypeError);
    test.strictEqual('constraintId must be defined.', err.message);
  }

  try {
    client.vehicleConstraints(createdVehicle.vehicleId, function (res) {

      // Should never happen, here just to make the test fail when it does
      test.ok(res.status === 0);

    }, {
      activeOnly: 123
    });
  } catch (err) {
    test.ok(err instanceof TypeError);
    test.strictEqual('activeOnly must be a Boolean.', err.message);
  }

  if (realConfig.vehicleIdWithConstraints) {
    client.vehicleConstraints(realConfig.vehicleIdWithConstraints, function (res) {

      client.constraintDetails(realConfig.vehicleIdWithConstraints, res.body.constraints[0].id, function (res2) {

        test.strictEqual(200, res2.status);
        test.ok(_.isBoolean(res2.body.constraint.active));

        // Obligatory nodeunit completion signal
        test.done();

      });

    });
  } else {
    // Obligatory nodeunit completion signal
    test.done();
  }

};

/**
 * Test that calls to {@link Client#nextPage} and {@link Client#prevPage} work as expected.
 *
 * Note: Skipped if your client_config.js is missing the vehicleIdWithTripData option.
 */
exports.testNextPageAndPrevPage = function (test) {

  var client = new Client(realConfig);

  if (realConfig.vehicleIdWithTripData) {
    client.vehicleTrips(realConfig.vehicleIdWithTripData, function (res) {

      test.strictEqual(1, res.body.trip.length);
      test.ok(!_.contains(_.map(res.body.actions, function (action) { return action.name; }), 'previous'));

      client.nextPage(res, function (res2) {

        var actions = _.map(res2.body.actions, function (action) { return action.name; });

        test.strictEqual(1, res2.body.trip.length);
        test.ok(_.contains(actions, 'previous'));
        test.ok(_.contains(actions, 'next'));

        client.prevPage(res2, function (res4) {

          test.ok(!_.contains(_.map(res4.body.actions, function (action) { return action.name; }), 'previous'));

          // Obligatory nodeunit completion signal
          test.done();

        });

      });

    }, {
      searchLimit: 1
    });
  } else {
    // Obligatory nodeunit completion signal
    test.done();
  }

};