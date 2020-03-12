const Gallery = require('../models/Gallery')
const User = require('../models/User')

exports.getImg = (req, res, next) => {
  Gallery.find({})
    .then(gallery => {
      return res.json(gallery)
    }).catch(err => {
      return res.json({ res: false })
    })
}

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
            let ln = req.body.img.length
            for(let i = 0; i < ln; i++) {
              let gall = new Gallery({
                image: req.body.img[i],
                uploader: (dec.mName == '') ? dec.fName + ' ' + dec.lName : dec.fName + ' ' + dec.mName.charAt(0) + '. ' + dec.lName
              })
              gall.save()
            }
            return res.json(true)
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

exports.deleteImg = (req, res, next) => {
  Gallery.deleteOne({ _id: req.body._id }).then(gallery => {
    return res.json(true)
  })
}
