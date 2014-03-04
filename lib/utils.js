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
