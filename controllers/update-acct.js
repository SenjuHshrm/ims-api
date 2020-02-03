const User = require('../models/User')
const bcrypt = require('bcryptjs')

exports.update = (req, res, next) => {

  User.findOne({ username: req.body.username }, (err, user) => {
    if(err) { return res.json({ res: 'ER' }) }
    if(user != null) {
      user.username = req.body.username,
      user.password = (req.body.password != '') ? bcrypt.hashSync(req.body.password, 10) : user.password,
      user.fName = req.body.fName,
      user.mName = req.body.mName,
      user.lName = req.body.lName,
      user.addr = req.body.addr,
      user.contact = req.body.contact
      user.save()
      return res.json({ res: user.generateJWT() })
    }
    return res.json({ res: 'N' })
  })
}
