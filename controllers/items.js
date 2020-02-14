const Item = require('../models/Item')
const Log = require('../models/Logs')
const fs = require('fs')
const _ = require('lodash')
const moment = require('moment')
const formatCurr = require('../utils/currency')

exports.search = (req, res, next) => {
  let prod = req.params.prod,
      cat = req.params.cat.replace('-', '/');
  Item.find({ product: prod, category: cat }, (err, item) => {
    if(err) { return res.json({ res: 'ER' }) }
    _.forEach(item, arr => {
      let img = fs.readFileSync(arr.img)
      arr.img = new Buffer.from(img).toString('base64')
    })
    return res.json({ res: item })
  })
}

exports.searchByName = (req, res, next) => {
  Item.find({ name: { $regex: req.params.name, $options: 'i' } }, (err, item) => {
    if(err) { return res.json({ res: 'ER' }) }
    _.forEach(item, arr => {
      let img = fs.readFileSync(arr.img)
      arr.img = new Buffer.from(img).toString('base64')
    })
    return res.json({ res: item })
  })
}

exports.add = (req, res, next) => {
  let tmp = req.body.price.split(',')
  let incm = ((req.body.itemCount * parseFloat(tmp.join(''))).toFixed(2)).toString()
  console.log(incm)
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
      itemCount: req.body.itemCount,
      isAvailable: true
    })
    itm.save()
    let log = new Log({
      type: 'in',
      prod: req.body.prod,
      cat: req.body.cat,
      name: req.body.name,
      received: req.body.itemCount,
      sold: 0,
      income: formatCurr.formatCurrency(incm),
      encoder: req.body.encoder
    })
    log.save()
    return res.json({ res: true })
  })
}

exports.updateAvail = (req, res, next) => {
  Item.findOne({ _id: req.body._id }, (err, item) => {
    if(err) { return res.json({ res: 'ER' }) }
    if(item) {
      item.isAvailable = req.body.isAvailable
      item.save()
      return res.json({ res: true })
    }
  })
}

exports.updateItem = (req, res, next) => {
  Item.findOne({ _id: req.body.id }, (err, item) => {
    if(err) { return res.json({ res: 'ER' }) }
    if(item != null) {
      let name = '', filename = '';
      if(req.body.xobj.format != 'nochange') {
        fs.unlinkSync(item.img)
        name = req.body.xobj.name.replace(/\s/g, '_')
        filename = './img/' + name + req.body.xobj.format
        fs.writeFileSync(filename, req.body.xobj.img, 'base64')
      } else {
        item.product = req.body.xobj.prod,
        item.category = req.body.xobj.cat,
        item.name = req.body.xobj.name,
        item.color = req.body.xobj.color,
        item.price = req.body.xobj.price,
        item.desc = req.body.xobj.desc,
        item.img = (req.body.xobj.format == 'nochange') ? item.img : filename,
        item.itemCount = req.body.xobj.itemCount
        item.isAvailable = (req.body.xobj.itemCount > 0) ? true : false
        item.save()
        return res.json({ res: true })
      }
    }
    return res.json({ res: false })
  })
}

exports.addSold = (req, res, next) => {
  Item.findOne({ _id: req.body.id }, (err, item) => {
    if(err) { return res.json({ res: 'ER' }) }
    item.itemCount = req.body.remItem,
    item.isAvailable = (req.body.remItem > 0) ? true : false
    let log = new Log({
      type: 'out',
      prod: item.product,
      cat: item.category,
      name: item.name,
      received: 0,
      sold: req.body.amt,
      income: req.body.totalPrc,
      encoder: req.body.encoder
    })
    item.save()
    log.save()
    return res.json({ res: true })
  })
}

exports.addRec = (req, res, next) => {
  Item.findOne({ _id: req.body.id }, (err, item) => {
    if(err) { return res.json({ res: 'ER' }) }
    item.itemCount = req.body.remItem,
    item.isAvailable = (req.body.remItem > 0) ? true : false
    let log = new Log({
      type: 'in',
      prod: item.product,
      cat: item.category,
      name: item.name,
      received: 0,
      sold: req.body.amt,
      income: req.body.totalPrc,
      encoder: req.body.encoder
    })
    item.save()
    log.save()
    return res.json({ res: true })
  })
}

exports.allItems = (req, res, next) => {
  Item.find({}, (err, item) => {
    if(err) { return res.json({ res: 'ER' })}
    _.forEach(item, arr => {
      let img = fs.readFileSync(arr.img)
      arr.img = new Buffer.from(img).toString('base64')
    })
    return res.json(item)
  })
}
