const moment = require('moment');
const momentDurationFormatSetup = require('moment-duration-format');
const { IsCmiTimespan } = require('./validators');

momentDurationFormatSetup(moment);

/**
 * Combined two AICC timespans
 *
 * @param {String} timespan1
 * @param {String} timespan2
 * @return {*}
 */
const addTimes = (timespan1, timespan2) => {
  // validate the timespans
  if (!IsCmiTimespan(timespan1)) throw new Error(`Invalid CMITimespan`, timespan1);
  if (!IsCmiTimespan(timespan2)) throw new Error(`Invalid CMITimespan`, timespan2);

  const timespanDuration1 = moment.duration(timespan1 || '00:00:00').asSeconds();
  const timespanDuration2 = moment.duration(timespan2 || '00:00:00').asSeconds();

  return moment
    .duration(timespanDuration1 + timespanDuration2, 'seconds')
    .format('hh:mm:ss', { trim: false });
};

module.exports = {
  addTimes,
};
