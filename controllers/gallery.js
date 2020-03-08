const Gallery = '../models/Gallery'
const User = require('../models/User')
exports.addImg = (req, res, next) => {
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
            let gall = new Gallery({
              image: req.body.image,
              uploader: dec.username
            })
            gall.save()
            return res.json({ res: true })
          } else {
            return res.json({ res: 'NACT' })
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
