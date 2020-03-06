const User = require('../models/User')
const bcrypt = require('bcryptjs')


exports.addUser = (req, res) => {
  if(req.headers.hasOwnProperty('authorization')) {
    let token = req.headers.authorization.split(' ')
    let _usr = new User
    let auth = _usr.checkAuth(token[1])
    if(auth == 'ER_TOKEN') {
      return res.json({ res: 'InvToken' })
    } else if(auth == 'INVALID_USER') {
      return res.json({ res: 'InvUser' })
    } else {
      auth.then((dec) => {
        if(typeof dec != 'string') {
          if(dec.type == 'superAdmin') {
            User.findOne({ username: req.body.username }, (err, user) => {
              if(err) { return res.json({ res: 'ER' }) }
              if(user) { return res.json({ res: 'EX' }) }
              let usr = new User({
                username: req.body.username,
                password: bcrypt.hashSync(req.body.password, 10),
                type: req.body.type,
                fName: req.body.fName,
                mName: req.body.mName,
                lName: req.body.lName,
                addr: req.body.addr,
                contact: req.body.contact,
                activated: req.body.activated
              })
              usr.save()
              return res.json({ res: true })
            })
          } else {
            return res.json({ res: 'AUTH_ERR' })
          }
        } else {
          return res.json({ res: 'InvUser' })
        }
      })
    }
  } else {
    return res.json({ res: 'NoToken' })
  }
}
