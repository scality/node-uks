var expect   = require('chai').expect;

describe('Key', function() {
  var key = require('../index').Key;

  describe('constructor', function() {
    it('should allow for a string of hex digits', function() {
      new key('ABCD');
      new key('1234');
      new key('A1B2');
    });

    it('should allow for an integer', function() {
      new key(1234);
    });

    it('should allow for passing another key in', function() {
      new key( new key(1234) );
    });

    it('should throw an error when a key is less than 1', function() {
      expect(function(){new key('-1')}).to.throw(Error);
    });

    it('should throw an error if no parameter is passed', function() {
      expect(function(){new key()}).to.throw(Error);
    });

    it('should throw an error if hex value is too long', function() {
      v = '10000000000000000000000000000000000000000'; // 2^160
      expect(function(){new key(v)}).to.throw(Error);
    });

  });

  // note: cannot just do a .value.toString(16) because of 32-bit constraints in JavaScript
  describe('#toHex', function() {
    it('should have a length less than 40', function() {
      var k = new key('1234');
      expect(k.toHex()).to.have.length.below(40);
    });

  });

  describe('#toHexPadded', function() {
    it('should have a length equal than 40', function() {
      var k = new key('1234');
      expect(k.toHexPadded()).to.have.length(40);

      k = new key('12345');
      expect(k.toHexPadded()).to.have.length(40);

      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D20');
      expect(k.toHexPadded()).to.have.length(40);
    });

  });

  describe('.class', function() {
    it('should be undefined when class arithmetic returns an invalid class', function() {
      var k = new key('ABCD');
      expect(k.class).to.be.undefined;

      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50DA0');
      expect(k.class).to.be.undefined;
    });

    it('should be taken from the second-to-last digit of a 40-digit hex key', function() {
      var k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D20');
      expect(k.class).to.equal(2);

      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D00');
      expect(k.class).to.equal(0);

      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D30');
      expect(k.class).to.equal(3);
    });

  });

  describe('.replica_number', function() {
    it('should be taken from the last digit of the 40-digit hex key when class is not 7', function() {
      var k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D20');
      expect(k.replica_number).to.equal(0);
    });

    it('should perform dark magic when class is 7', function() {
      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D70');
      expect(k.replica_number).to.equal(208); // exact number Python code gives

      k = new key('C93AC3EC755EF83FAC62D900000000512430C070');
      expect(k.replica_number).to.equal(0); // exact number Python code gives
    });

  });

  describe('.next', function() {
    it('should be a reference to the next replica', function() {
      var k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D20');
      expect(k.next.replica_number).to.equal(1);
    });

    it('should be null if there is not another replica', function() {
      var k = new key('014');
      expect(k.next).to.equal(null);
    });

  });

  describe('.prev', function() {
    it('should be a reference to the previous replica', function() {
      var k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D21');
      expect(k.prev.replica_number).to.equal(0);
    });

    it('should be null if there is not a previous replica', function() {
      var k = new key('014');
      expect(k.prev).to.equal(null);
    });

  });

  describe('.getReplicas(includeSelf, class1translate)', function() {
    it('should be an array', function() {
      var k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D21');
      expect(k.getReplicas(false, false)).to.be.an.instanceof(Array);
    });

    it('should contain the accessing key when includeSelf is true', function() {
      var k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D21');
      expect(k.getReplicas(true)).to.contain(k);
    });

    // there are few enough of these that I am going to test them all
    it('should have a length of class+1 when class < 6, replica is 0, and includeSelf is true', function() {
      var k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D00');
      expect(k.getReplicas(true)).to.have.length(k.class + 1);

      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D10');
      expect(k.getReplicas(true).length).to.equal(k.class + 1);

      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D20');
      expect(k.getReplicas(true).length).to.equal(k.class + 1);

      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D30');
      expect(k.getReplicas(true).length).to.equal(k.class + 1);

      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D40');
      expect(k.getReplicas(true).length).to.equal(k.class + 1);

      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D50');
      expect(k.getReplicas(true).length).to.equal(k.class + 1);
    });

    // TODO: Python test handles last two digits '12' as having 3 replicas,
    // but seems counter-intuitive and is not mentioned in UKS PDF.
    // Should this even be allowed, as 10 and 11 only give two replicas?

    it('should contain both .prev and .next items when .prev and .next exist', function() {
      var k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D21');
      expect(k.getReplicasAsHexValues()).to.contain(k.prev.toHex());
      expect(k.getReplicasAsHexValues()).to.contain(k.next.toHex());
    });

  });

  describe('#isBetween(key1, key2)', function() {
    it('should return true when the key is between order-sensitive keys', function() {
      var k0 = new key(0);
      var k1 = new key(1);
      var k2 = new key(2);

      expect(k1.isBetween(k0, k2)).to.be.true;
      expect(k0.isBetween(k2, k1)).to.be.true;
      expect(k0.isBetween(k2, k2)).to.be.true;
    });

    it('should return true when the two given keys are identical', function() {
      var k0 = new key(0);
      var k1 = new key(1);
      var k2 = new key(2);
      expect(k0.isBetween(k2, k2)).to.be.true;
      expect(k1.isBetween(k2, k2)).to.be.true;
      expect(k2.isBetween(k2, k2)).to.be.true;
      expect(k2.isBetween(k1, k1)).to.be.true;
    });

    it('should return false when the key is not between order-sensitive keys', function() {
      var k0 = new key(0);
      var k1 = new key(1);
      var k2 = new key(2);

      expect(k0.isBetween(k1, k2)).to.be.false;
    });

    it('should enable the use of hex values as parameters', function() {
      var k = new key("C93AC3EC755EF83FAC62D900000000512430C070");
      expect(k.isBetween("80", "071C71C700000000000000000000000000000080")).to.be.false;
    });

  });

});

describe('keyutils', function() {
  var keyutils = require('../index').keyutils,
      bignum = require('bignum'),
      Key = require('../index').Key;

  describe('#isValidKeyType', function() {
    it('should allow strings', function() {
      expect(keyutils.isValidKeyType('abcd')).to.be.ok;
    });

    it('should allow numbers', function() {
      expect(keyutils.isValidKeyType(1234)).to.be.ok;
    });

    it('should allow other keys', function() {
      expect(keyutils.isValidKeyType(new Key(1234))).to.be.ok;
    });

    it('should allow bignums', function() {
      expect(keyutils.isValidKeyType(bignum(1234))).to.be.ok;
    });

    it('should not allow arbitrary objects', function() {
      expect(keyutils.isValidKeyType({})).to.not.be.ok;
      expect(keyutils.isValidKeyType([])).to.not.be.ok;
    });

  });

  describe('#getNextReplica(key, cls1)', function() {
    it('should work when cls1 is 0', function() {
      // expected results pulled from Python code
      var key = new Key("B5EE17AD7B2BBB71A0ACB8829403866370B50D12");
      var rep = keyutils.getNextReplica(key, 0);
      var expected = "35ee17ad7b2bbb71a0acb8829403866370b50d11";
      expect(rep.toHexPadded()).to.equal(expected);

      key = new Key("C93AC3EC755EF83FAC62D900000000512430C070");
      rep = keyutils.getNextReplica(key, 0);
      expected = "de901941cab44d9501b82e55555555a62430c071";
      expect(rep.toHexPadded()).to.equal(expected);
    });

    it('should work when cls1 is 1', function() {
      // expected results pulled from Python code
      var key = new Key("B5EE17AD7B2BBB71A0ACB8829403866370B50D12");
      var rep = keyutils.getNextReplica(key, 0);
      var expected = "35ee17ad7b2bbb71a0acb8829403866370b50d11";
      expect(rep.toHexPadded()).to.equal(expected);

      key = new Key("C93AC3EC755EF83FAC62D900000000512430C070");
      rep = keyutils.getNextReplica(key, 1);
      expected = "de901941cab44d9501b82e55555555a62430c071";
      expect(rep.toHexPadded()).to.equal(expected);
    });
  });

  describe('getNextReplicaInt', function() {
    it('should return expected values', function() {
      var k = new Key("b5ee17ad7b2bbb71a0acb8829403866370b50d");
      var nextKey = keyutils.getNextReplicaInt(k, 3, 3, 0);
      var expected = "f5ee17ad7b2bbb71a0acb8829403866370b50d";
      expect(nextKey.toString(16)).to.equal(expected);

      k = new Key("c93ac3ec755ef83fac62d90000000051")
      nextKey = keyutils.getNextReplicaInt(k, 12, 0, 1);
      expected = '13b13bdcebff00269a0bf0e7768a3b13b13b64';
      expect(nextKey.toString(16)).to.equal(expected);

      k = new Key("B5EE17AD7B2BBB71A0ACB8829403866370B50D12")
      nextKey = keyutils.getNextReplicaInt(k, 1, 2, 1);
      expected = 'b46e17ad7b2bbb71a0acb8829403866370b50d12';
      expect(nextKey.toString(16)).to.equal(expected);
    });

  });

  describe('getNextRainReplicaInt', function() {
    it('should return expected values', function() {
      var k = new Key("b5ee17ad7b2bbb71a0acb8829403866370b50d");
      var nextKey = keyutils.getNextRainReplicaInt(k, 3, 3, 0);
      var expected = "b5ee15ad7b2bbb71a0acb8829403866370b50d";
      expect(nextKey.toString(16)).to.equal(expected);
    });

  });

  describe('getRainK', function() {
    it('should return expected values', function() {
      var k = new Key("b5ee17ad7b2bbb71a0acb8829403866370b50d");
      var nextKey = keyutils.getRainK(k);
      var expected = "18";
      expect(nextKey.toString(16)).to.equal(expected);
    });

  });

  describe('getRainM', function() {
    it('should return expected values', function() {
      var k = new Key("b5ee17ad7b2bbb71a0acb8829403866370b50d");
      var nextKey = keyutils.getRainM(k);
      var expected = "37";
      expect(nextKey.toString(16)).to.equal(expected);
    });

  });
});
