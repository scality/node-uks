var KeyRange = require('../index').KeyRange,
    Key      = require('../index').Key;

var expect   = require('chai').expect;

describe('KeyRange', function() {
  describe('constructor', function() {
    it('should allow integers or Keys as parameters', function() {

      expect(new KeyRange(0, 1)).to.be.ok;
      expect(new KeyRange(0, 0)).to.be.ok;
      expect(new KeyRange(new Key(0), new Key(1))).to.be.ok;
      expect(new KeyRange(new Key(0), 1)).to.be.ok;
      expect(new KeyRange(0, new Key(1))).to.be.ok;
    });

  });

  describe('#eq(KeyRange)', function() {
    it('should return true if the ranges are identical', function() {
      expect(new KeyRange(1,8).eq(new KeyRange(1,8))).to.be.true;

      var kr = new KeyRange(1,8);
      expect(kr.eq(kr)).to.be.ok;

      expect(new KeyRange(5,20).eq(new KeyRange(5,20))).to.be.true;
      expect(new KeyRange(2,10).eq(new KeyRange(2,10))).to.be.true;
    });

    it('should return true if the ranges are identical', function() {
      expect(new KeyRange(1,8).eq(new KeyRange(5,8))).to.be.false;
      expect(new KeyRange(5,20).eq(new KeyRange(8,18))).to.be.false;
      expect(new KeyRange(2,10).eq(new KeyRange(1,15))).to.be.false;
    });

  });

  describe('#getRangeOverlap(KeyRange)', function() {
    it('should throw an error if something besides a KeyRange is given', function() {
      var kr = new KeyRange(0, 1);
      expect(function(){kr.getRangeOverlap('hello')}).to.throw.an.Error;
    });

    it('should return an array of KeyRanges', function() {
      var kr1 = new KeyRange(1, 10);
      var kr2 = new KeyRange(9, 20);
      var results = kr1.getRangeOverlap(kr2);
      expect(results).to.be.an.instanceof(Array);
      expect(results[0]).to.be.an.instanceof(KeyRange);
    });

    function getoverlap(k1, k2, k3, k4){
      return new KeyRange(k1, k2).getRangeOverlap(new KeyRange(k3, k4))
    }

    it('should return null when there is no overlap', function() {
      expect(getoverlap(1, 8, 9, 20)).to.equal(null);
      expect(getoverlap(2, 10, 11, 1)).to.equal(null);
      expect(getoverlap(11, 1, 2, 10)).to.equal(null);
    });

    it('should return expected KeyRanges when there is overlap', function() {
        var ol = getoverlap(1, 10, 9, 20);
        var kr = new KeyRange(9, 10);
        expect(ol[0].eq(kr)).to.be.true;

        ol = getoverlap(1, 6, 5, 10);
        kr = new KeyRange(5, 6);
        expect(ol[0].eq(kr)).to.be.true;

        ol = getoverlap(5, 10, 1, 6);
        kr = new KeyRange(5, 6);
        expect(ol[0].eq(kr)).to.be.true;

        ol = getoverlap(5, 10, 1, 11);
        kr = new KeyRange(5, 10);
        expect(ol[0].eq(kr)).to.be.true;

        ol = getoverlap(1, 11, 5, 10);
        kr = new KeyRange(5, 10);
        expect(ol[0].eq(kr)).to.be.true;

        ol = getoverlap(5, 10, 6, 8);
        kr = new KeyRange(6, 8);
        expect(ol[0].eq(kr)).to.be.true;

        ol = getoverlap(6, 8, 5, 10);
        kr = new KeyRange(6, 8);
        expect(ol[0].eq(kr)).to.be.true;

        ol = getoverlap(2, 10, 9, 1);
        kr = new KeyRange(9, 10);
        expect(ol[0].eq(kr)).to.be.true;

        ol = getoverlap(9, 1, 2, 10);
        kr = new KeyRange(9, 10);
        expect(ol[0].eq(kr)).to.be.true;

        ol = getoverlap(2, 10, 11, 3);
        kr = new KeyRange(2, 3);
        expect(ol[0].eq(kr)).to.be.true;

        ol = getoverlap(11, 3, 2, 10);
        kr = new KeyRange(2, 3);
        expect(ol[0].eq(kr)).to.be.true;

        ol = getoverlap(1, 1, 2, 10);
        kr = new KeyRange(2, 10);
        expect(ol[0].eq(kr)).to.be.true;

        ol = getoverlap(2, 10, 1, 1);
        kr = new KeyRange(2, 10);
        expect(ol[0].eq(kr)).to.be.true;

        // TODO
        //getoverlap(1, 10, 9, 2) == [KeyRange(1, 2), KeyRange(9, 10)]
        //getoverlap(9, 2, 1, 10) == [KeyRange(1, 2), KeyRange(9, 10)]
    });

  });
});
