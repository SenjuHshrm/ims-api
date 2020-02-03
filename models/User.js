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
  contact: String
})

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
  return jwt.verify(token, process.env.JWT_SECRET)
}

var User = mongoose.model('User', userSchema)

module.exports = User
