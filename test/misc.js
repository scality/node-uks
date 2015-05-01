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
});
