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
      var expectedJSON = '"\\u0000\\u0000\\u0000\\u0000\\u0005mdver\\u0000\\u0000\\u0000\\u0004\\u0000\\u0000\\u0000\\u0004\\u0000\\u0000\\u0000\\u0000\\u0006mflags\\u0000\\u0000\\u0000\\u0004\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0005atime\\u0000\\u0000\\u0000\\b\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0005mtime\\u0000\\u0000\\u0000\\b\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0005ctime\\u0000\\u0000\\u0000\\b\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0003crf\\u0000\\u0000\\u0000\\u0004\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0007version\\u0000\\u0000\\u0000\\u0004\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u000bdataversion\\u0000\\u0000\\u0000\\u0004\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0005crc32\\u0000\\u0000\\u0000\\u0004\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0004size\\u0000\\u0000\\u0000\\u0004\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\tarchidlen\\u0000\\u0000\\u0000\\u0004\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0006archid\\u0000\\u0000\\u0000\\u0014\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u0000\\u000barchversion\\u0000\\u0000\\u0000\\u0004\\u0000\\u0000\\u0000\\u0000"';
      var result = keyutils.serializeMd();
      var str = '';
      result.forEach(function(a) {
        str += String.fromCharCode(a);
      });
      var JSONresult = JSON.stringify(str);
      expect(JSONresult).to.equal(expectedJSON);
    });
  });
});
