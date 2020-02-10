const mongoose = require('mongoose')
const Schema = mongoose.Schema
const moment = require('moment')

var logSchema = new Schema({
  type: String,
  prod: String,
  cat: String,
  name: String,
  received: Number,
  sold: Number,
  income: String,
  encoder: String
}, { timestamps: true })

var Log = mongoose.model('log', logSchema)

module.exports = Log
