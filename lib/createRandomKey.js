var crypto = require('crypto'),
    assert = require('assert'),
    Key = require('./key').Key;
    utils = require('./key').utils;

module.exports = function createRandomKey(c) {
  return new Key(utils.genId(c));
};
