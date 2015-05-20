var key =  require('./lib/key');

module.exports = {
  Key: key.Key,
  keyutils: key.utils,
  KeyRange: require('./lib/keyrange'),
  createKeyArc: key.createKeyArc,
  createKeyArc_NoCheck: key.createKeyArc_NoCheck,
  createRandomKey: require('./lib/createRandomKey'),
  CoS: require('./lib/cos')
}
