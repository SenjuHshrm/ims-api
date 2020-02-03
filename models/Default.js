const mongoose = require('mongoose')
const Schema = mongoose.Schema

var defSchema = new Schema({
  Bikes: Array,
  Accessories: Array,
  Wheels: Array,
  Components: Array,
  Workshop: Array,
})

var Default = mongoose.model('default', defSchema);

module.exports = Default
