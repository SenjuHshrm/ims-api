const Item = require('../models/Item')
const fs = require('fs')
const _ = require('lodash')

exports.search = (req, res, next) => {
  Item.find({ product: req.params.prod, category: req.params.cat }, (err, item) => {
    if(err) { return res.json({ res: 'ER' }) }
    _.forEach(item, arr => {
      let img = fs.readFileSync(arr.img)
      arr.img = new Buffer(img).toString('base64')
    })
    return res.json({ res: item })
  })
}

exports.add = (req, res, next) => {
  let name = req.body.name.replace(/\s/g, '_')
  let filename = './img/' + name + req.body.format
  fs.writeFile(filename, req.body.img, 'base64', (err) => {
    if(err) { return res.json({ res: false }) }
    let itm = new Item({
      product: req.body.prod,
      category: req.body.cat,
      name: req.body.name,
      color: req.body.color,
      price: req.body.price,
      desc: req.body.desc,
      img: filename,
      itemCount: req.body.itemCount
    })
    itm.save()
    return res.json({ res: true })
  })
}
