const Item = require('../models/Item')
const Log = require('../models/Logs')
const fs = require('fs')
const _ = require('lodash')
const moment = require('moment')
const formatCurr = require('../utils/currency')

exports.search = (req, res, next) => {
  Item.find(req.body).then((item) => {
    return res.json(item)
  })
}

exports.searchByName = (req, res, next) => {
  Item.find({ name: { $regex: req.params.name, $options: 'i' } })
    .then((item) => {
        return res.json({ res: item })
    })
    .catch(err => {
      return res.json({ res: 'ER' })
    })
}

exports.add = (req, res, next) => {
  let itm = new Item({
    product: req.body.prod,
    category: req.body.cat,
    name: req.body.name,
    color: req.body.color,
    price: req.body.price,
    desc: req.body.desc,
    img: req.body.img,
    itemCount: 0,
    featureToSite: false,
    isAvailable: false
  })
  itm.save()
  return res.json({ res: true })
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

exports.updateToFeature = (req, res, next) => {
  Item.find({}).then((item) => {
    let obj = JSON.parse(JSON.stringify(item))
    let ft = _.filter(obj, { featureToSite: true })
    Item.findOne({ _id: req.body.id }).then((itm) => {
      if(req.body.feature === true) {
        if(ft.length < 4) {
          itm.featureToSite = req.body.feature
          itm.save()
          return res.json({ res: true })
        } else if(ft.length >= 4) {
          return res.json({ res: false })
        }
      } else {
        itm.featureToSite = req.body.feature
        itm.save()
        return res.json({ res: true })
      }
    })
  })
}

exports.updateItem = (req, res, next) => {
  Item.findOne({ _id: req.body.id }).then((item) => {
    if(item != null) {
      let name = '', filename = '';
      // if(req.body.xobj.format != 'nochange') {
      //   fs.unlinkSync(item.img)
      //   name = req.body.xobj.name.replace(/\s/g, '_')
      //   filename = './img/' + name + req.body.xobj.format
      //   fs.writeFileSync(filename, req.body.xobj.img, 'base64')
      // }
      item.product = req.body.xobj.prod
      item.category = req.body.xobj.cat
      item.name = req.body.xobj.name
      item.color = req.body.xobj.color
      item.price = req.body.xobj.price
      item.desc = req.body.xobj.desc
      item.img = req.body.xobj.img
      item.save()
      return res.json({ res: true })
    }
    return res.json({ res: false })
  })
}

exports.addSold = (req, res, next) => {
  Item.findOne({ _id: req.body.id }).then((item) => {
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
  Item.findOne({ _id: req.body.id }).then((item) => {
    item.itemCount = req.body.remItem,
    item.isAvailable = (req.body.remItem > 0) ? true : false
    let log = new Log({
      type: 'in',
      prod: item.product,
      cat: item.category,
      name: item.name,
      received: req.body.amt,
      sold: 0,
      income: req.body.totalPrc,
      encoder: req.body.encoder
    })
    item.save()
    log.save()
    return res.json({ res: true })
  })
}

exports.allItems = (req, res, next) => {
  Item.find({})
    .then(item => {
      // _.forEach(item, arr => {
      //   let img = fs.readFileSync(arr.img)
      //   arr.img = new Buffer.from(img).toString('base64')
      // })
      return res.json(item)
    })
    .catch(err => {
      return res.json({ res: 'ER' })
    })
}

exports.getFeat = (req, res, next) => {
  Item.find({ featureToSite: true })
    .then((item) => {
      // _.forEach(item, arr => {
      //   let img = fs.readFileSync(arr.img)
      //   arr.img = new Buffer.from(img).toString('base64')
      // })
      return res.json(item)
    })
    .catch(err => {
      return res.json({ res: 'ER' })
    })
}

exports.delItem = (req, res, next) => {
  Item.deleteOne({ _id: req.body._id}).then(item => {
    return res.json(true)
  })
}
