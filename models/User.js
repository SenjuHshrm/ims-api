const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Schema = mongoose.Schema

var userSchema = new Schema({
  username: String,
  password: String,
  type: String,
  fName: String,
  mName: String,
  lName: String,
  addr: String,
  contact: String,
  activated: Boolean,
  hasOpenedNotif:Boolean,
  notif: Array
}, { timestamps: true })

userSchema.methods.comparePass = function comparePass(inp) {
  return bcrypt.compareSync(inp, this.password)
}

userSchema.methods.generateJWT = function generateJWT() {
  return jwt.sign(
    {
      type: this.type,
      username: this.username,
      fName: this.fName,
      mName: this.mName,
      lName: this.lName,
      addr: this.addr,
      contact: this.contact
    },
    process.env.JWT_SECRET
  )
}

userSchema.methods.checkAuth = function checkAuth(token) {
  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET)
    return User.findOne({ username: decoded.username }).then((user) => {
      if(user) {
        return user;
      } else {
        return 'INVALID_USER'
      }
    })
  } catch(e) {
    return 'ER_TOKEN'
  }
}

userSchema.methods.superAdminAuth = function superAdminAuth(token) {
  let resp = jwt.verify(token, process.env.JWT_SECRET)
  if(!resp) { return false }
  if(resp.type == 'superAdmin') {
    return true;
  } else {
    return false
  }
}

var User = mongoose.model('User', userSchema)

module.exports = User
