var bignum = require('bignum');

module.exports = function createKeyArc(md5Hash, options) {
  var defaults = {
    version: 0,
    sid: 0xC0,
    k: 9,
    m: 3,
    schema: 12,
    replica: 0
  };

  // since options are mutable, make a copy
  options = options || {};
  var o = {};
  Object.keys(defaults).forEach(function(k) {
    if(options[k] === undefined) {
      o[k] = defaults[k];
    }
    else
    {
      o[k] = options[k];
    }
  });

  var cos = 7;

  if(o.sid < 0 || o.sid > 255) {
    throw new Error("invalid service id")
  }
  if(o.version < 0 || bignum(o.version).ge(bignum(1).shiftLeft(32))) {
    throw new Error("invalid version");
  }
  if(o.replica < 0 || o.replica > 255) {
    throw new Error("invalid replica");
  }
  if(o.k <= 0 || o.k >= 64) {
    throw new Error("invalid number of data part");
  }
  if(o.m <= 0 || o.m >= 64) {
    throw new Error("invalid number of coding part");
  }
  if(o.k + o.m > o.schema) {
    throw new Error("invalid schema (too low)");
  }
  if(o.schema <= 0 || o.schema > 255) {
    throw new Error("invalid schema");
  }
  if(o.replica < 0 || o.replica >= o.k + o.m) {
    throw new Error("invalid replica number");
  }

  md5Hash = bignum(md5Hash);
  if(bignum(md5Hash).lt(0) || bignum(md5Hash).ge(bignum(1).shiftLeft(88))) {
    throw new Error("Invalid hash");
  }
};
