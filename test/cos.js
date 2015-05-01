var expect   = require('chai').expect;
var CoS = require('../index').CoS;
var Key = require('../index').Key;

describe('CoS', function() {

  describe('constructor', function() {
    it('should allow numbers', function() {
      new CoS(2);
    });

    it('should allow strings representing numbers', function() {
      new CoS('2');
    });

    it('should allow ARC prefixes with appropriate schemas', function() {
      new CoS('ARC14+4', 18);
      new CoS('ARC14+4', 24);
    });

    it('should throw an error if an array is passed', function() {
      expect(function(){new CoS([])}).to.throw(Error);
    });

    it('should throw an error if an unparseable string is passed', function() {
      expect(function(){new CoS('azeb')}).to.throw(Error);
    });

    it('should throw an error if the scheme does not work with the ARC value', function() {
      expect(function(){new CoS('ARC14+4', 12)}).to.throw(Error);
    });

  });

  describe('#transformKey(key)', function() {
    describe('type: arc', function() {
      it('should return a new key when given a key', function() {
        var k = new Key('B5EE17AD7B2BBB71A0ACB8829403866370B50D00');
        var c = new CoS('ARC14+4', 24);
        expect(c.transformKey(k)).to.be.instanceof(Key);
      });

      it('should return a key with the correct value', function() {
        var k = new Key('B5EE17AD7B2BBB71A0ACB8829403866370B50D00');
        var c = new CoS('ARC14+4', 24);
        var expected = 'b5ee17ad7b2bbb71a0acb800000000c038418070'
        expect(c.transformKey(k).toHexPadded()).to.equal(expected);
      });

    });

    describe('type: classic', function() {
      it('should return a new key when given a key', function() {
        var k = new Key('B5EE17AD7B2BBB71A0ACB8829403866370B50D00');
        var c = new CoS(2);
        expect(c.transformKey(k)).to.be.instanceof(Key);
      });

      it('should return a key with the correct value', function() {
        var k = new Key('B5EE17AD7B2BBB71A0ACB8829403866370B50D00');
        var c = new CoS(2);
        var expected = 'b5ee17ad7b2bbb71a0acb8829403866370b50d20'
        expect(c.transformKey(k).toHexPadded()).to.equal(expected);
      });

    });

  });
});
