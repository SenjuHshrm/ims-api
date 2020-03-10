const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Schema = mongoose.Schema

var visitorSchema = new Schema({
  sessionId: String
}, { timestamps: true })

visitorSchema.methods.genSessionId = function genSessionId(str) {
  return jwt.sign({
      id: str
    },
    process.env.JWT_SECRET
  )
}

var Visitor = mongoose.model('visitor', visitorSchema)

module.exports = Visitor
