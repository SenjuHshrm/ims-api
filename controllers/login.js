const User = require('../models/User')
const bcrypt = require('bcryptjs')

exports.authUser = (req, res, next) => {
  console.log(req.body)
  User.findOne({ username: req.body.username }, (err, user) => {
    if(err) {
      return res.json({ res: 'ER' })
    }
    if(user != null) {
      if(user.comparePass(req.body.password)) {
        return res.json({ res: user.generateJWT() })
      }
      return res.json({ res: 'WP' })
    }
    return res.json({ res: 'NU' })
  })
}
