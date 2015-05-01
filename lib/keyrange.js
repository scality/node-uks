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

KeyRange.prototype.getRangeOverlap = function(r2) {
  if(this.start.isBetween(r2.start, r2.end)) {
    if(this.end.isBetween(r2.start, r2.end)) {
      if(r2.start.isBetween(this.start, this.end)) {
        return [new KeyRange(this.start, r2.end), new KeyRange(r2.start, this.end)];
      } else{
        return [new KeyRange(this.start, this.end)];
      }
    } else {
      return [new KeyRange(this.start, r2.end)];
    }
  } else {
    if(this.end.isBetween(r2.start, r2.end)) {
      return [new KeyRange(r2.start, this.end)];
    } else if(r2.start.isBetween(this.start, this.end)) {
      return [new KeyRange(r2.start, r2.end)];
    }
  }
  return null;
};

module.exports = KeyRange;
