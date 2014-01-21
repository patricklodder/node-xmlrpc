var DateFormatter = function (opts) {
  this.opts = {}
  this.setOpts(opts)
}

DateFormatter.DEFAULT_OPTIONS = {
  colons: true
, hyphens: false
, local: true
, milliseconds: false
, offset: false
}

DateFormatter.ISO8601 = new RegExp(
  '([0-9]{4})([-]?([0-9]{2}))([-]?([0-9]{2}))'
+ '(T([0-9]{2})(((:?([0-9]{2}))?((:?([0-9]{2}))?(\.([0-9]+))?))?)'
+ '(Z|([+-]([0-9]{2}(:?([0-9]{2}))?)))?)?'
)

DateFormatter.prototype.setOpts = function (opts) {
  if (!opts) opts = DateFormatter.DEFAULT_OPTIONS
  var orig = this.opts
  Object.keys(opts).forEach(function (k) {
    orig[k] = opts[k]
  })
}

/*
 * Converts a date time stamp following the ISO8601 format to a JavaScript Date
 * object.
 *
 * @param {String} time - String representation of timestamp.
 * @return {Date}       - Date object from timestamp.
 */
DateFormatter.prototype.decodeIso8601 = function(time) {
  var dateParts = time.toString().match(DateFormatter.ISO8601)
  if (!dateParts) {
    throw new Error('Expected a ISO8601 datetime but got \'' + time + '\'')
  }

  var date = [
    [dateParts[1], dateParts[3] || '01', dateParts[5] || '01'].join('-')
    , 'T'
    , [dateParts[7] || '00', dateParts[11] || '00', dateParts[14] || '00'].join(':')
    , '.'
    , dateParts[16] || '000'
  ].join('')

  date += (dateParts[17] !== undefined) ?
    dateParts[17] + ((dateParts[19] && dateParts[20] === undefined) ? '00' : '') :
    DateFormatter.formatCurrentOffset(new Date(date))

  return new Date(date)
}

/**
 * Converts a JavaScript Date object to an ISO8601 timestamp.
 *
 * @param {Date} date - Date object.
 * @return {String}   - String representation of timestamp.
 */
DateFormatter.prototype.encodeIso8601 = function(date) {
  var parts = this.opts.local ?
    DateFormatter.getLocalDateParts(date) :
    DateFormatter.getUTCDateParts(date)

  return [
    parts.slice(0,3).join(this.opts.hyphens ? '-' : '')
  , 'T'
  , parts.slice(3,6).join(this.opts.colons ? ':' : '')
  , (this.opts.milliseconds) ? '.' + parts[6] : ''
  , (this.opts.local) ? ((this.opts.offset) ? DateFormatter.formatCurrentOffset(date) : '') : 'Z'
  ].join('')
}

DateFormatter.getUTCDateParts = function (date) {
  return [
    date.getUTCFullYear()
  , DateFormatter.zeroPad(date.getUTCMonth()+1,2)
  , DateFormatter.zeroPad(date.getUTCDate(),2)
  , DateFormatter.zeroPad(date.getUTCHours(), 2)
  , DateFormatter.zeroPad(date.getUTCMinutes(), 2)
  , DateFormatter.zeroPad(date.getUTCSeconds(), 2)
  , DateFormatter.zeroPad(date.getUTCMilliseconds(), 3)]
}

DateFormatter.getLocalDateParts = function (date) {
  return [
    date.getFullYear()
  , DateFormatter.zeroPad(date.getMonth()+1,2)
  , DateFormatter.zeroPad(date.getDate(),2)
  , DateFormatter.zeroPad(date.getHours(), 2)
  , DateFormatter.zeroPad(date.getMinutes(), 2)
  , DateFormatter.zeroPad(date.getSeconds(), 2)
  , DateFormatter.zeroPad(date.getMilliseconds(), 3)]
}

/**
 * Helper function to pad the digits with 0s to meet date formatting
 * requirements.
 *
 * @param {Number} digit  - The number to pad.
 * @param {Number} length - Length of digit string, prefix with 0s if not
 *                          already length.
 * @return {String}       - String with the padded digit
 */
DateFormatter.zeroPad = function (digit, length) {
  var padded = '' + digit
  while (padded.length < length) {
    padded = '0' + padded
  }

  return padded
}

/**
 * Helper function to get the current timezone to default decoding to
 * rather than UTC. (for backward compatibility)
 *
 * @return {String} - in the format /Z|[+-]\d{2}:\d{2}/
 */
DateFormatter.formatCurrentOffset = function (d) {
  var offset = (d || new Date()).getTimezoneOffset()
  return (offset === 0) ? 'Z' : [
      (offset < 0) ? '+' : '-'
    , DateFormatter.zeroPad(Math.abs(Math.floor(offset/60)),2)
    , ':'
    , DateFormatter.zeroPad(Math.abs(offset%60),2)
  ].join('')
}

module.exports = new DateFormatter()
