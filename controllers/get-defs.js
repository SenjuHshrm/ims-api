const Default = require('../models/Default')

exports.getDef = (req, res, next) => {
  Default.find({}).then(def => {
    return res.json(def[0])
  })
}
