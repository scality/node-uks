var Key = require('./key').Key,
    createKeyArc = require('./key').createKeyArc;

function CoS(cos, schema) {
  this.type = null;
  this.value = null;

  if(!isNaN(parseInt(cos,10))) {
    this.value = parseInt(cos, 10);
    this.type = 'classic';
    return;
  }
  if(cos.indexOf('ARC') === 0) {
    matches = cos.match(/^ARC([1-9][0-9]?)\+([1-9][0-9]?)$/);
    if(matches === null) {
      throw new Error("cos not recognized");
    }
    this.type = 'arc';
    this.k = parseInt(matches[1], 10);
    this.m = parseInt(matches[2], 10);
    this.schema = schema;
    if(!schema || this.k + this.m > parseInt(schema, 0)) {
      throw new Error("invalid schema");
    }
    return;
  }

  throw new Error("cos not recognized");
};

CoS.prototype.transformKey = function(key) {
  var hex = key.toHexPadded();

  if(this.type === 'classic') {
    return new Key(hex.substr(0,hex.length-2) + this.value + '0');
  }
  else if(this.type === 'arc') {
    var md5hash = hex.substr(0,22);
    return createKeyArc(md5hash, {
      k: this.k,
      m: this.m,
      schema: this.schema
    });
  }

  throw new Error("CoS transformation not implemented for type " + this.type);
};

module.exports =  CoS;
