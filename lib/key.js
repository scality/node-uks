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

  assert(utils.isValidKeyType(value), 'Passed value is not a valid key type');
  assert(utils.isValidValue(value), 'Value must be positive and within ' + MAX_KEY_BITS +
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
        return this.getReplicas().pop() || null;
      }
    },
    'prev': {
      get: function() {
      }
    },
    'class': {
      get: function() {
        var c = _lvalue.and(0xF0).shiftRight(CHUNKID_REPLICA_BITS);
        var cNum = Number(c.toString(10));
        if(utils.isValidClass(cNum)) {
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
    }
  });

  this.getReplicas = function(includeSelf, class1translate) {
    var translate = class1translate || this.toHex().slice(-2) == "12";
    var reps = [];
    var clt = null;

    if(includeSelf) {
      reps.push(this);
    }

    if(translate && this.class === 1) {
      clt = 6;
    }
    else
    {
      clt = this.class;
    }

    var nreplicas = 0;
    if(replica_schemes[clt] !== undefined) {
      nreplicas = replica_schemes[clt]['replicaposition'].length;
    }
    else if(clt === CHUNKID_CLASS_RAIN) {
      var val = utils.getRainK(this.value).sum(utils.getRainM(this.value));
      nreplicas = Number(val.toString(10));
    } else {
      nreplicas = clt + 1;
    }

    for(var i = 0; i<nreplicas-1; i++) { // TODO: verify this is working correctly
      // TODO: this repeats itself!!
      reps.push(utils.getNextReplica(this.value, Number(translate)));
    }

    return reps;
  };

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

function toBignum(value) {
  if(value instanceof Key) {
    return value.value
  } else if(value instanceof bignum) {
    return value;
  } else if(typeof value === "string") {
    return bignum(value, 16);
  } else if(typeof value === "number") {
    return bignum(value);
  }
  throw new Error("Could not convert " + value + " to a bignum");
};

// modularized for easier unit testing
var utils = {
  /**
   * Returns the next replica for key, calling this function recursively
   * is infinite as this will loop over all keys, even for a class 0.
   */
  getNextReplica: function(value, cls1) {
    var k = new Key(value);
    var c = k.class;
    var clt = null;

    assert(utils.isValidClass(c));
    var replica = k.replica_number;

    if(cls1 === 1 && c === 1) {
      clt = 6;
    }
    else
    {
      clt = c;
    }

    var entropyKey = null;
    var scheme = null;
    var nreplicas = null;
    var nextReplica = null;
    var nextKey = null;

    if(replica_schemes[clt] !== undefined) {
      entropyKey = toBignum(k).shiftRight(CHUNKID_EXTRA_BITS);
      scheme = replica_schemes[clt];
      nextReplica = (replica + 1) % scheme['replicaposition'].length;
      nextKey = utils.getNextReplicaInt(entropyKey,
                                     scheme['scheme'],
                                     scheme['replicaposition'][replica],
                                     scheme['replicaposition'][nextReplica]);

      nextKey = nextKey.shiftLeft(CHUNKID_EXTRA_BITS).or(
        bignum(c).shiftLeft(CHUNKID_REPLICA_BITS)).or(nextReplica);
    } else if(clt === CHUNKID_CLASS_RAIN) {
        entropyKey = toBignum(k).shiftRight(CHUNKID_RAIN_EXTRA_BITS);
        scheme = utils.getRainSchema(k);
        nreplicas = Number(utils.getRainK(k).add(utils.getRainM(k)).toString(10));
        nextReplica = (replica + 1) % nreplicas;
        nextKey = utils.getNextRainReplicaInt(entropyKey,
                                            scheme,
                                            replica, nextReplica);



        // bignum doesn't support bitwise operations on negatives, so we have to go native.
        // Because the value of `op2` is just -4096, it's insignificant enough
        // to we can work with without moving into 64-bit territory and without
        // accidentally overflowing anything
        var shifted = nextKey.shiftLeft(CHUNKID_RAIN_EXTRA_BITS);
        // shifted works

        var subbed = bignum(1).shiftLeft(CHUNKID_RAIN_EXTRA_BITS).sub(1);

        var op1 = k.value.and(subbed);

        // -4096
        var op2 = ~((1 << (CHUNKID_EXTRA_BITS + CHUNKID_RAIN_REPLICA_MSB_BITS)) - 1);

        var digits_to_use = Number.MAX_SAFE_INTEGER.toString(16).length;
        if(op1.lt(0)) {
          throw Error("Not implemented.");
        }
        var hex = op1.toString(16).slice(-digits_to_use);

        nextKey = shifted.or(op2 & parseInt(hex, 16)).or(
          bignum(nextReplica).shiftRight(CHUNKID_REPLICA_BITS).shiftLeft(CHUNKID_EXTRA_BITS)
        ).or(
          bignum(c).shiftLeft(CHUNKID_REPLICA_BITS)
        ).or(
          bignum(nextReplica).and(
            bignum(1).shiftLeft(CHUNKID_REPLICA_BITS).sub(1)
          )
        )
    }
    else
    {
      entropyKey = new Key(k.value.shiftRight(CHUNKID_EXTRA_BITS));
      nextReplica = (replica + 1) % (clt+1);
      nextKey = utils.getNextReplicaInt(entropyKey, clt, replica, nextReplica)

      var op1 = nextKey.shiftLeft(CHUNKID_EXTRA_BITS);

      var op2 = bignum(c).shiftLeft(CHUNKID_REPLICA_BITS);

      nextKey = op1.or(op2).or(nextReplica);
    }

    return new Key(nextKey);
  },

  getRainK: function(value) {
    value = toBignum(value);
    var toShiftRight = bignum(CHUNKID_EXTRA_BITS)
      .add(CHUNKID_RAIN_REPLICA_MSB_BITS)
      .add(CHUNKID_RAIN_SCHEMA_BITS)
      .add(CHUNKID_RAIN_M_BITS);

    var toAnd = bignum(1).shiftLeft(CHUNKID_RAIN_K_BITS).sub(1);

    return value.shiftRight(toShiftRight).and(toAnd);
  },

  getRainM: function(value) {
    value = toBignum(value);
    var toShiftRight = bignum(CHUNKID_EXTRA_BITS)
      .add(CHUNKID_RAIN_REPLICA_MSB_BITS)
      .add(CHUNKID_RAIN_SCHEMA_BITS);

    var toAnd = bignum(1).shiftLeft(CHUNKID_RAIN_M_BITS).sub(1);

    return value.shiftRight(toShiftRight).and(toAnd);
  },

  getNextReplicaInt: function(entropyKey, cl, replica, nextReplica) {
    entropyKey = toBignum(entropyKey);
    var toSubtract = bignum(CHUNKID_ENTROPY_MOD).mul(replica).div(cl+1);
    var toAdd = bignum(CHUNKID_ENTROPY_MOD).mul(nextReplica).div(cl+1);
    var nextKey = entropyKey.sub(toSubtract).add(toAdd);

    if (nextKey.lt(0)) {
      nextKey = nextKey.add(CHUNKID_ENTROPY_MOD);
    } else if(nextKey.ge(CHUNKID_ENTROPY_MOD)) {
      nextKey = nextKey.sub(CHUNKID_ENTROPY_MOD);
    }

    return nextKey;
  },

  getNextRainReplicaInt: function(entropyKey, schema, replica, nextReplica) {
    entropyKey = toBignum(entropyKey);
    var toSubtract = bignum(CHUNKID_RAIN_ENTROPY_MOD).mul(replica).div(schema);
    var toAdd = bignum(CHUNKID_RAIN_ENTROPY_MOD).mul(nextReplica).div(schema);

    var nextKey = entropyKey.sub(toSubtract)
                  .add(toAdd);

    if (nextKey.lt(0)) {
      nextKey = nextKey.add(CHUNKID_RAIN_ENTROPY_MOD);
    } else if(nextKey.ge(CHUNKID_RAIN_ENTROPY_MOD)) {
      nextKey = nextKey.sub(CHUNKID_RAIN_ENTROPY_MOD);
    }

    return nextKey;
  },

  isValidKeyType: function(value) {
   return typeof value === 'string' || typeof value === 'number' ||
          value instanceof Key || value instanceof bignum;
  },

  isValidValue: function(value) {
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
  },

  isValidClass: function(c) {
      return (
        (c >= 0 && c <= 5) ||
        (replica_schemes[c] !== undefined) ||
        (c === CHUNKID_CLASS_RAIN)
      );
  },

  getRainK: function(value) {
    value = toBignum(value);
    return value.shiftRight(
             CHUNKID_EXTRA_BITS +
             CHUNKID_RAIN_REPLICA_MSB_BITS +
             CHUNKID_RAIN_SCHEMA_BITS +
             CHUNKID_RAIN_M_BITS)
           .and(
             bignum(1).shiftLeft(CHUNKID_RAIN_M_BITS).sub(1)
            );
  },

  getRainM: function(value) {
    value = toBignum(value);
    return value.shiftRight(
             CHUNKID_EXTRA_BITS +
             CHUNKID_RAIN_REPLICA_MSB_BITS +
             CHUNKID_RAIN_SCHEMA_BITS)
           .and(
             bignum(1).shiftLeft(CHUNKID_RAIN_M_BITS).sub(1)
            );
  },

  getRainSchema: function(value) {
    value = toBignum(value);
    return value.shiftRight(
             CHUNKID_EXTRA_BITS +
             CHUNKID_RAIN_REPLICA_MSB_BITS)
           .and(
             bignum(1).shiftLeft(CHUNKID_RAIN_M_BITS).sub(1)
            );
  }
};

module.exports = {Key: Key, utils: utils};
