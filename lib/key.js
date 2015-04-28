var assert = require('assert');
var bignum = require('bignum');

const MAX_KEY_BITS = 160; // 40 hex digits
const BITS_PER_CHAR = 4;

const CHUNKID_BITS = 160;
const CHUNKID_ENTROPY_BITS = 152;
const CHUNKID_ENTROPY_MAX = bignum('1').shiftLeft(CHUNKID_ENTROPY_BITS).sub(1);
const CHUNKID_ENTROPY_MOD = bignum('1').shiftLeft(CHUNKID_ENTROPY_BITS);
const CHUNKID_EXTRA_BITS = CHUNKID_BITS - CHUNKID_ENTROPY_BITS;
const CHUNKID_REPLICA_BITS = 4;
const CHUNKID_CLASS_BITS = 4;
const CHUNKID_CLASS_RAIN = 0x7;
const CHUNKID_RAIN_K_BITS = 6;
const CHUNKID_RAIN_M_BITS = 6;
const CHUNKID_RAIN_SCHEMA_BITS = 8;
const CHUNKID_RAIN_REPLICA_MSB_BITS = 4;
const CHUNKID_RAIN_EXTRA_BITS = (CHUNKID_RAIN_K_BITS +
                           CHUNKID_RAIN_M_BITS +
                           CHUNKID_RAIN_SCHEMA_BITS +
                           CHUNKID_RAIN_REPLICA_MSB_BITS +
                           CHUNKID_EXTRA_BITS);
const CHUNKID_RAIN_ENTROPY_BITS = (CHUNKID_BITS - CHUNKID_RAIN_EXTRA_BITS);
const CHUNKID_RAIN_ENTROPY_MAX = bignum('1').shiftLeft(CHUNKID_RAIN_ENTROPY_BITS).sub(1);
const CHUNKID_RAIN_ENTROPY_MOD = bignum('1').shiftLeft(CHUNKID_RAIN_ENTROPY_BITS);

var replica_schemes = {
  3: { 'scheme': 5, 'replicaposition': [ 0, 3, 2, 5 ] },
  4: { 'scheme': 5, 'replicaposition': [ 0, 3, 2, 5, 1 ] },
  6: { 'scheme': 3, 'replicaposition': [ 0, 2, 3 ] },
  8: { 'scheme': 5, 'replicaposition': [ 0, 3, 2 ] }
};

function Key(value) {
  var dispersion = null,
      payload    = null,
      replica    = null,
      _lvalue     = null;

  assert(isValidKeyType(value), 'Passed value is not a valid key type');
  assert(isValidValue(value), 'Value must be positive and within ' + MAX_KEY_BITS +
    ' bits. Value passed: ' + value);

  if(typeof value === 'string') {
    // assume hex
    _lvalue = bignum(value, 16);
  }
  else if(value instanceof Key) {
    _lvalue = bignum(value.value);
  }
  else {
    // assume another bignum or decimal number (default radix)
    _lvalue = bignum(value);
  }

  Object.defineProperties(this, {
    'value': {
      get: function() {
        return _lvalue;
      }
    },
    'next': {
      get: function() {
        // TODO
      }
    },
    'prev': {
      get: function() {
        // TODO
      }
    },
    'class': {
      get: function() {
        var c = _lvalue.and(0xF0).shiftRight(CHUNKID_REPLICA_BITS);
        var cNum = Number(c.toString(10));
        if(isValidClass(cNum)) {
          return cNum;
        }
        return undefined;
      }
    },
    'replica_number': {
      get: function() {
        var cl = this.class;
        var rep = _lvalue.and(0x0F);
        if(cl === CHUNKID_CLASS_RAIN) {
          // TODO with bignum's methods, nesting these looks awfully ugly
          var val = _lvalue.shiftRight(CHUNKID_EXTRA_BITS).and(
            bignum(1).shiftLeft(CHUNKID_RAIN_REPLICA_MSB_BITS).sub(1)
          ).shiftLeft(CHUNKID_REPLICA_BITS);
          rep = rep.add(val);
        }
        return Number(rep.toString(10));
      }
    },
    'replicas': {
      get: function() {
        // TODO
      }
    }
  });

  this.toHex = function() {
    return this.toString(16);
  };

  this.toString = function(radix) {
    radix == radix || 10;
    return _lvalue.toString(radix)
  }

  this.toHexPadded = function() {
    var str = this.toHex(16);
    for(var i = str.length-1; i<MAX_KEY_BITS/BITS_PER_CHAR-1; i++) {
      str += '0';
    }
    return str;
  };

  this.isBetween = function(key1, key2) {
    var start = new Key(key1),
        end   = new Key(key2);

    if(start.value.eq(end.value)) {
      return true;
    }

    if(start.value.gt(end.value)) {
      if(_lvalue.gt(start.value) || _lvalue.le(end.value)) {
        return true;
      }
    }

    if(start.value.le(_lvalue) && _lvalue.le(end.value)) {
      return true;
    }

    return false;
  };

};



function isValidKeyType(value) {
 return typeof value === 'string' || typeof value === 'number' || value instanceof Key;
};

function isValidValue(value) {
  if(value instanceof Key || value instanceof bignum) {
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

function isValidClass(c) {
    return (
      (c >= 0 && c <= 5) ||
      (replica_schemes[c] !== undefined) ||
      (c === CHUNKID_CLASS_RAIN)
    );
}

module.exports = Key;
