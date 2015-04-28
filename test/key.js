var expect = require('chai').expect,
    key    = require('../index').key;

describe('key', function() {

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
    it('should initially be zero when unspecified', function() {
      var k = new key('ABCD');
      expect(k.class).to.equal(0);
    });

    it('should be taken from the second-to-last digit of a 40-digit hex key', function() {
      var k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D20');
      expect(k.class).to.equal(2);

      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D00');
      expect(k.class).to.equal(0);

      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D30');
      expect(k.class).to.equal(3);

      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50DA0');
      expect(k.class.toString(16)).to.equal('a');
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
      expect(k.next).to.equal(null);
    });

  });

  describe('.replicas', function() {
    it('should be an array', function() {
      var k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D21');
      expect(k.replicas).to.be.an.instanceof(Array);
    });

    it('should contain the accessing key', function() {
      var k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D21');
      expect(k.replicas).to.contain(k);
    });

    // there are few enough of these that I am going to test them all
    it('should have a length of class+1 when class < 6 and replica is 0', function() {
      var k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D00');
      expect(k.replicas).to.have.length(1);
      expect(k.replicas.length).to.equal(k.class + 1);

      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D10');
      expect(k.replicas).to.have.length(2);
      expect(k.replicas.length).to.equal(k.class + 1);

      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D20');
      expect(k.replicas).to.have.length(3);
      expect(k.replicas.length).to.equal(k.class + 1);

      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D30');
      expect(k.replicas).to.have.length(4);
      expect(k.replicas.length).to.equal(k.class + 1);

      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D40');
      expect(k.replicas).to.have.length(5);
      expect(k.replicas.length).to.equal(k.class + 1);

      k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D50');
      expect(k.replicas).to.have.length(5);
      expect(k.replicas.length).to.equal(k.class + 1);
    });

    // TODO: Python test handles last two digits '12' as having 3 replicas,
    // but seems counter-intuitive and is not mentioned in UKS PDF.
    // Should this even be allowed, as 10 and 11 only give two replicas?

    it('should contain both .prev and .next items when .prev and .next exist', function() {
      var k = new key('B5EE17AD7B2BBB71A0ACB8829403866370B50D21');
      expect(k.replicas).to.contain(k.prev);
      expect(k.replicas).to.contain(k.next);
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
      expect(k2.isBetween(k2, k2)).to.be.true;
    });

    it('should return falsee when the key is not between order-sensitive keys', function() {
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
