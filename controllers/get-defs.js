const Default = require('../models/Default')

exports.getDef = (req, res, next) => {
  Default.find({}, (err, def) => {
    if(err) { return res.json({ res: 'ER' }) }
    return res.json({ res: def[0] })
  })
}
