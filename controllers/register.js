const User = require('../models/User')
const bcrypt = require('bcryptjs')


exports.addUser = (req, res) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if(err) { return res.json({ res: 'ER' }) }
    if(user) { return res.json({ res: 'EX' }) }
    let usr = new User({
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password, 10),
      type: 'admin',
      fName: req.body.fName,
      mName: req.body.mName,
      lName: req.body.lName,
      addr: req.body.addr,
      contact: req.body.contact
    })
    usr.save()
  })
}

exports.testAuth = (req, res, next) => {
  let user = new User
  let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiZk5hbWUiOiIiLCJtTmFtZSI6IiIsImxOYW1lIjoiIiwiYWRkciI6IiIsImNvbnRhY3QiOiIiLCJpYXQiOjE1Nzg4OTc2NzV9.IB7KEVIn5u6HE8dOxWi1rQ93Gpxz7bIkEKq0grzidho'
  let auth = user.checkAuth(token)
  return res.json({ res: auth })
}
