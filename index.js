module.exports = {
  Key: require('./lib/key').Key,
  keyutils: require('./lib/key').utils,
  keyrange: require('./lib/keyrange'),
  createKeyArc: require('./lib/key').createKeyArc,
  createRandomKey: require('./lib/createRandomKey'),
  CoS: require('./lib/cos')
}
