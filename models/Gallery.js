const mongoose = require('mongoose')
const Schema = mongoose.Schema

var gallerySchema = new Schema({
  image: String,
  uploader: String
}, { timestamps: true })

var Gallery = mongoose.model('gallery', gallerySchema)

module.exports = Gallery
