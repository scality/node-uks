var expect       = require('chai').expect,
    createKeyArc = require('../index').createKeyArc,
    Key          = require('../index').Key;

describe('createKeyArc(value, options)', function() {
  it('should return a key when appropriate values are passed', function() {
    var arc = createKeyArc('ABC');
    var expected = '0000000000000000000abc00000000c02430c070'.toUpperCase();
    expect(arc).to.be.an.instanceof(Key);
    expect(arc.toHexPadded()).to.equal(expected);

    arc = createKeyArc('0')
    expected = '000000000000000000000000000000c02430c070'.toUpperCase();
    expect(arc).to.be.an.instanceof(Key);
    expect(arc.toHexPadded()).to.equal(expected);

    arc = createKeyArc('124', {
      version: 0,
      k: 3,
      m: 3,
      schema: 6,
      replica: 1
    });
    expected = '000000000000000000012400000000c00c306071'.toUpperCase();
    expect(arc).to.be.an.instanceof(Key);
    expect(arc.toHexPadded()).to.equal(expected);
  });

  it('should throw an error for values less than 0', function() {
    expect(function(){createKeyArc('-1')}).to.throw(Error);
    expect(function(){createKeyArc(-1)}).to.throw(Error);
  });

  it('should throw an error for keys greater than given range', function() {
    // NOTE: JavaScript does NOT allow for numbers outside of the 32-bit range,
    // regardless of system architecture. The Python tests specify 1 << 90,
    // but that overflows. Instead, use a bignum.
    // 1 << 90 is equal to 1237940039285380274899124224
    var val = "1237940039285380274899124224";
    expect(function(){createKeyArc(val)}).to.throw(Error);
  });

  it('should throw an error for an invalid version', function() {
    expect(function(){createKeyArc(1, {version: -1})}).to.throw(Error);
  });

  it('should throw an error for an invalid k parameter', function() {
    expect(function(){createKeyArc(1, {k: -1})}).to.throw(Error);
  });

  it('should throw an error for an invalid sid', function() {
    expect(function(){createKeyArc(1, {sid: -1})}).to.throw(Error);
  });

  it('should throw an error for an invalid m parameter', function() {
    expect(function(){createKeyArc(1, {m: -1})}).to.throw(Error);
  });

  it('should throw an error for an invalid schema', function() {
    expect(function(){createKeyArc(1, {schema: -1})}).to.throw(Error);
    expect(function(){createKeyArc(1, {schema: 256})}).to.throw(Error);
  });

  it('should throw an error for an invalid replica', function() {
    expect(function(){createKeyArc(1, {replica: -1})}).to.throw(Error);
    expect(function(){createKeyArc(1, {replica: 63})}).to.throw(Error);
  });

  it('should throw an error for an invalid combination of options', function() {
    // pulled from Python unit tests
    var options = { // TODO: find documentation on why these are invalid
      k: 3,
      m: 3,
      schema: 5
    }
    expect(function(){createKeyArc(1, options)}).to.throw(Error);
  });

  it('should return an object when using correct options', function() {
    // pulled from Python unit tests
    var options = { // these pulled
      version: 0,
      k: 3,
      m: 3,
      schema: 6,
      replica: 1
    }
    expect(createKeyArc(1, options)).to.be.an('object');
  });

});
