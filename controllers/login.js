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
        if(user.activated) {
          return res.json({ res: user.generateJWT() })
        } else {
          return res.json({ res: 'NACT' })
        }
      }
      return res.json({ res: 'WP' })
    }
    return res.json({ res: 'NU' })
  })
}

exports.getUsers = (req, res, next) => {
  if(req.headers.hasOwnProperty('authorization')) {
    let token = req.headers.authorization.split(' ')
    let usr = new User
    let auth = usr.checkAuth(token[1])
    if(auth == 'ER_TOKEN') {
      return res.json({ res: 'InvToken' })
    } else {
      auth.then(dec => {
        if(typeof dec != 'string') {
          if(dec.type == 'superAdmin' && dec.activated == true) {
            User.find({ type: ['admin', 'encoder'] })
              .then((users) => {
                return res.json(users)
              })
              .catch((err) => {
                return res.json({ res: 'ER' })
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

exports.actvt = (req, res, next) => {
  if(req.headers.hasOwnProperty('authorization')) {
    let token = req.headers.authorization.split(' ')
    let usr = new User
    let auth = usr.checkAuth(token[1])
    if(auth == 'ER_TOKEN') {
      return res.json({ res: 'InvToken' })
    } else {
      auth.then(dec => {
        if(typeof dec != 'string') {
          if(dec.type == 'superAdmin' && dec.activated == true) {
            User.findOne({ _id: req.body.id }).then(user => {
              user.activated = req.body.activated
              user.save()
              return res.json(true)
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

exports.notifOpen = (req, res, next) => {
  User.update({ username: req.body.username }, { hasOpenedNotif: true }).then(user => {
    return res.json(true)
  })
}

exports.getNotifs = (req, res, next) => {
  User.findOne({ username: req.params.username }).then(user => {
    return res.json(user.notif)
  })
}

exports.delNotif = (req, res, next) => {
  User.update({ username: req.body.username }, {  $set: { notif: [] } }).then(user => {
    return res.json(true)
  })
}
