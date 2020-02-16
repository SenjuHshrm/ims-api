const mongoose = require('mongoose')
const Schema = mongoose.Schema

var itemSchema = new Schema({
  product: String,
  category: String,
  name: String,
  color: String,
  price: String,
  desc: Array,
  img: String,
  itemCount: Number,
  featureToSite: Boolean,
  isAvailable: Boolean
})

var Item = mongoose.model('item', itemSchema)

module.exports = Item
