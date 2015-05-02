var expect   = require('chai').expect;
var keyutils = require('../index').keyutils;

describe('keyutils', function() {
  describe('flattenSequence', function() {
    it('should return a flat array from an n-dimensional array', function() {
      var ar = [1,2,[3,4],[[5],6],[[7,8],9]];
      var expected = [1,2,3,4,5,6,7,8,9];
      expect(keyutils.flattenSequence(ar)).to.deep.equal(expected);
    });
  });

  describe('pack754', function() {
    it('should return 1 when f is 0', function() {
      expect(keyutils.pack754(0, 1, 1)).to.equal(0);
    });

    it('should return expected values', function() {
      expect(keyutils.pack754(2, 5, 1).toString()).to.equal('8');
      expect(keyutils.pack754(-2, 12, 11).toString()).to.equal('3072');
      expect(keyutils.pack754(0.4, 12, 11).toString()).to.equal('1021');
      expect(keyutils.pack754(24, 53, 11).toString()).to.equal('2259496395079680');
    });
  });

  describe('unpack754', function() {
    it('should return 1 when i is 0', function() {
      expect(keyutils.unpack754(0, 1, 1)).to.equal(0);
    });

    it('should return expected values', function() {
      expect(keyutils.unpack754(2,5,4).toString()).to.equal('0.03125');
      expect(keyutils.unpack754(-2, 3, 2).toString()).to.equal('-2');
      expect(keyutils.unpack754(2, 10, 4).toString()).to.equal('0.00830078125');
      expect(keyutils.unpack754(-1, 4, 1).toString()).to.equal('-3.5');
    });
  });

  describe('uksGenRaw', function() {
    it('should return a 40-character key', function() {
      expect(keyutils.uksGenRaw('ABC', 3, 12, 15, 2, 1)).to.have.length(40);
    });
  });
  describe('uksGen', function() {
    it('should return a 40-character key', function() {
      expect(keyutils.uksGenRaw(3, 12, 15, 2, 1)).to.have.length(40);
    });
  });

  describe('serializeMd', function() {
    it('should return an array', function() {
      expect(keyutils.serializeMd()).to.be.an.instanceof(Array);
    });

    it('should return default values when nothing passed', function() {
      var expected = [0, 0, 0, 0, 5, 109, 100, 118, 101, 114, 0, 0, 0, 4, 0, 0, 0, 4, 0, 0, 0, 0, 6, 109, 102, 108, 97, 103, 115, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 5, 97, 116, 105, 109, 101, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 109, 116, 105, 109, 101, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 99, 116, 105, 109, 101, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 99, 114, 102, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 7, 118, 101, 114, 115, 105, 111, 110, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 11, 100, 97, 116, 97, 118, 101, 114, 115, 105, 111, 110, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 5, 99, 114, 99, 51, 50, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 4, 115, 105, 122, 101, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 9, 97, 114, 99, 104, 105, 100, 108, 101, 110, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 6, 97, 114, 99, 104, 105, 100, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11, 97, 114, 99, 104, 118, 101, 114, 115, 105, 111, 110, 0, 0, 0, 4, 0, 0, 0, 0];
      var result = keyutils.serializeMd();
      expect(result).to.deep.equal(expected);
    });
  });
});
