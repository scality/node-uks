var expect       = require('chai').expect,
    createKeyArc = require('../index').createKeyArc;

describe('createKeyArc(value, options)', function() {
  it('should return a key arc when appropriate values are passed', function() {
    expect(createKeyArc('ABC')).to.be.an('object');
    expect(createKeyArc('0')).to.be.an('object');
  });

  it('should throw an error for values less than 0', function() {
    expect(createKeyArc('-1')).to.throw(Error);
    expect(createKeyArc(-1)).to.throw(Error);
  });

  it('should throw an error for keys greater than given range', function() {
    // NOTE: JavaScript does NOT allow for numbers outside of the 32-bit range,
    // regardless of system architecture. The Python tests specify 1 << 90,
    // but that overflows. Instead, use a string.
    // 1 << 90 is equal to 0x40000000000000000000000
    var val = "40000000000000000000000";
    expect(createKeyArc(val)).to.throw(Error);
  });

  it('should throw an error for an invalid version', function() {
    expect(createKeyArc(1, {version: -1})).to.throw(Error);
  });

  it('should throw an error for an invalid k parameter', function() {
    expect(createKeyArc(1, {k: -1})).to.throw(Error);
  });

  it('should throw an error for an invalid sid', function() {
    expect(createKeyArc(1, {sid: -1})).to.throw(Error);
  });

  it('should throw an error for an invalid m parameter', function() {
    expect(createKeyArc(1, {m: -1})).to.throw(Error);
  });

  it('should throw an error for an invalid schema', function() {
    expect(createKeyArc(1, {schema: -1})).to.throw(Error);
    expect(createKeyArc(1, {schema: 256})).to.throw(Error);
  });

  it('should throw an error for an invalid replica', function() {
    expect(createKeyArc(1, {replica: -1})).to.throw(Error);
    expect(createKeyArc(1, {replica: 63})).to.throw(Error);
  });

  it('should throw an error for an invalid combination of options', function() {
    // pulled from Python unit tests
    var options = { // TODO: find documentation on why these are invalid
      k: 3,
      m: 3,
      schema: 5
    }
    expect(createKeyArc(1, options)).to.throw(Error);
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
