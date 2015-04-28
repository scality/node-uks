var assert = require('assert');
const MAX_KEY_BITS = 160; // 40 hex digits
const BITS_PER_CHAR = 4;

module.exports = Key;

function Key(value) {
  assert(isValidKeyType(value), 'Passed value is not a valid key type');
  assert(isValidValue(value), 'Value must be positive and within ' + MAX_KEY_BITS +
    ' bits. Value passed: ' + value);
};

function isValidKeyType(value) {
 return typeof value === 'string' || typeof value === 'number' || value instanceof Key;
};

function isValidValue(value) {
  if(value instanceof Key) {
    return true;
  }

  switch(typeof value) {
    case 'string':
      return value[0] !== '-' && value.length <= MAX_KEY_BITS/BITS_PER_CHAR;
      break;
    case 'number':
      return value >= 0;
      break;
    default:
      return false;
      break;
  }
};
