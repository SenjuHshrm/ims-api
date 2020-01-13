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
  let name = (this.mName != '') ? this.fName + ' ' + this.mName.charAt(0) + '. ' + this.lName : this.fName + ' ' + this.lName;
  return jwt.sign(
    {
      username: this.username,
      name: name
    },
    process.env.JWT_SECRET
  )
}

var User = mongoose.model('User', userSchema)

module.exports = User
