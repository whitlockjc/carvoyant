'use strict';

var _ = {
    each: require('lodash.foreach'),
    isBoolean: require('lodash.isboolean'),
    isNumber: require('lodash.isNumber'),
    isString: require('lodash.isstring')
  }
  , Carvoyant = require('..')
  , utils = Carvoyant.Utilities;

/**
 * Test that invalid values passed to {@link module:carvoyant/utils#actionQueryParams} throw the proper error.
 */
exports.testActionQueryParamsInvalidArgument = function (test) {

  var invalidValues = [
    {
      res: undefined,
      actionName: 'fake',
      message: 'res must be defined.'
    },
    {
      res: 'NotObject',
      actionName: 'fake',
      message: 'res must be an Object.'
    },
    {
      res: {},
      actionName: undefined,
      message: 'actionName must be defined.'
    },
    {
      res: {},
      actionName: new Date(),
      message: 'actionName must be a String.'
    },
    {
      res: {body: {actions: []}},
      actionName: 'next',
      message: 'No action found for name: next'
    }
  ];

  _.each(invalidValues, function (invalidValue) {
    try {
      utils.actionQueryParams(invalidValue.res, invalidValue.actionName);
      test.fail('Should had failed above.');
    } catch (err) {
      test.ok(err instanceof TypeError);
      test.strictEqual(invalidValue.message, err.message);
    }
  });

  // Obligatory nodeunit completion signal
  test.done();

};

/**
 * Test that {@link module:carvoyant/utils#actionQueryParams} returns the expected object.
 */
exports.testActionQueryParams = function (test) {

  var actualQueryParams = utils.actionQueryParams({
    body: {
      actions: [
        {
          name: 'next',
          uri: 'https://dash.carvoyant.com/api/vehicle/C201200001/trip?includeData=true&sortOrder=desc' +
               '&startTime=2013-06-27+09%3A00%3A00%2B0000&searchOffset=4&searchLimit=2'
        }
      ]
    }
  }, 'next');

  _.each(actualQueryParams, function (value, key) {
    if (key === 'includeData') {
      test.ok(_.isBoolean(value));
      test.ok(value);
    } else if (key === 'sortOrder') {
      test.ok(_.isString(value));
      test.strictEqual('desc', value);
    } else if (key === 'startTime') {
      test.ok(_.isString(value));
      test.strictEqual(utils.dateToTimestamp(new Date('2013-06-27 09:00:00+0000')), value);
    } else if (key === 'searchOffset') {
      test.ok(_.isNumber(value));
      test.strictEqual(4, value);
    } else if (key === 'searchLimit') {
      test.ok(_.isNumber(value));
      test.strictEqual(2, value);
    } else {
      test.fail('Unexpected key: ' + key);
    }
  });

  // Obligatory nodeunit completion signal
  test.done();

};

/**
 * Test that invalid values passed to {@link module:carvoyant/utils#timestampToDate} throw the proper error.
 */
exports.testTimestampToDateInvalidArgument = function (test) {

  var invalidValues = [
    {
      value: undefined,
      message: 'timestamp must be defined.'
    },
    {
      value: new Date(),
      message: 'timestamp must be a String.'
    },
    {
      value: new Date().toString(),
      message: 'timestamp did not match expected format (yyyyMMddTHHmmssZ).'
    }
  ];

  _.each(invalidValues, function (invalidValue) {
    try {
      utils.timestampToDate(invalidValue.value);
      test.fail('Should had failed above.');
    } catch (err) {
      test.ok(err instanceof TypeError);
      test.strictEqual(invalidValue.message, err.message);
    }
  });

  // Obligatory nodeunit completion signal
  test.done();

};

/**
 * Test that {@link module:carvoyant/utils#timestampToDate} returns the expected date.
 */
exports.testTimestampToDate = function (test) {

  var timestamp = '20130526T204840+0000'
  , expectedDate = Date.UTC(2013, 4, 26, 20, 48, 40);

  test.strictEqual(expectedDate, utils.timestampToDate(timestamp).getTime());

  // Obligatory nodeunit completion signal
  test.done();

};

/**
 * Test that invalid values passed to {@link module:carvoyant/utils#dateToTimestamp} throw the proper error.
 */
exports.testDateToTimestampInvalidArgument = function (test) {

  var invalidValues = [
    {
      value: undefined,
      message: 'date must be defined.'
    },
    {
      value: 'NonDate',
      message: 'date must be a Date.'
    }
  ];

  _.each(invalidValues, function (invalidValue) {
    try {
      utils.dateToTimestamp(invalidValue.value);
      test.fail('Should had failed above.');
    } catch (err) {
      test.ok(err instanceof TypeError);
      test.strictEqual(invalidValue.message, err.message);
    }
  });

  // Obligatory nodeunit completion signal
  test.done();

};

/**
 * Test that {@link module:carvoyant/utils#dateToTimestamp} returns the expected timestamp.
 */
exports.testTimestampToDate = function (test) {

  var testDate = new Date();

  test.strictEqual(utils.dateToTimestamp(testDate), utils.dateToTimestamp(new Date()));

  // Obligatory nodeunit completion signal
  test.done();

};

/**
 * Test that {@link module:carvoyant/utils#externalizeEventType} works as expected.
 */
exports.testExternalizeEventType = function (test) {

  var valueMap = {
    GEOFENCE: 'geoFence',
    LOWBATTERY: 'lowBattery',
    NUMERICDATAKEY: 'numericDataKey',
    TIMEOFDAY: 'timeOfDay',
    TROUBLECODE: 'troubleCode',
    UNKNOWN: 'UNKNOWN'
  };

  _.each(valueMap, function (value, key) {

    test.strictEqual(value, utils.externalizeEventType(key));

  });

  // Obligatory nodeunit completion signal
  test.done();

};