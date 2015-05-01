var Key = require('./key').Key;
function KeyRange(key1, key2) {
  if(arguments.length !== 2) {
    throw new Error("Wrong number of arguments. (Expected 2, got " + arguments.length + ")");
  }
  this.start = new Key(key1);
  this.end = new Key(key2);
};

KeyRange.prototype.eq = function(r2) {
  return (
    this.start.value.eq(r2.start.value) &&
    this.end.value.eq(r2.end.value)
  )
};

module.exports = KeyRange;
