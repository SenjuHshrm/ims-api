const Default = require('../models/Default')
const User = require('../models/User')

exports.getDef = (req, res, next) => {
  if(req.headers.hasOwnProperty('authorization')) {
    let token = req.headers.authorization.split(' ')
    let usr = new User
    let auth = usr.checkAuth(token[1])
    if(auth == 'ER_TOKEN') {
      return res.json({ res: 'InvToken' })
    } else {
      auth.then(dec => {
        if(typeof dec != 'string') {
          if(dec.activated == true) {
            Default.find({}).then(def => {
              return res.json(def[0])
            })
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
