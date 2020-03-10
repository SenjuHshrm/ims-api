const Log = require('../models/Logs')
const User = require('../models/User')
const Visitor = require('../models/Visitor')
const moment = require('moment')
const pdfMake = require('../pdfmake/pdfmake')
const vfsFonts = require('../pdfmake/vfs_fonts')
const _ = require('lodash')
const formatCurr = require('../utils/currency')

pdfMake.vfs = vfsFonts.pdfMake.vfs

exports.getAll = (req, res, next) => {
  if(req.headers.hasOwnProperty('authorization')) {
    let token = req.headers.authorization.split(' ')
    let usr = new User
    let auth = usr.checkAuth(token[1])
    if(auth == 'ER_TOKEN') {
      return res.json({ res: 'InvToken' })
    } else {
      auth.then(dec => {
        if(typeof dec != 'string') {
          if(dec.type == 'superAdmin' || dec.type == 'admin') {
            Log.find({}, (err, log) => {
              if(err) { return res.json({ res: 'ER' }) }
              return res.json(log)
            })
          } else {
            return res.json({ res: 'AUTH_ERR' })
          }
        } else {
          return res.json({ res: 'InvUser' })
        }
      })
    }
  } else {
    return res.json({ res: 'NoToken' })
  }
}

exports.search = (req, res, next) => {
  Log.find({ createdAt: {
    $gte: new Date(new Date(req.body.dateFrom).setHours(00,00,00)),
    $lt: new Date(new Date(req.body.dateTo).setHours(23,59,59))
  }, type: req.body.type }, (err, resp) => {
    if(err) { return res.json({ errors: err }) }
    let rep = (req.body.type == 'in') ? 'Inbound sales report' : 'Outbound sales report',
      title = 'Green Planet Bikeshop',
      dateFrom = moment(req.body.dateFrom).format('MMMM DD, YYYY'),
      dateTo = moment(req.body.dateTo).format('MMMM DD, YYYY'),
      totalItem = 0,
      totalAmount = 0,
      bodyPrep = []
      body = [
        ['Item', ((req.body.type=='in') ? 'Amount received' : 'Amount sold') , ((req.body.type=='in') ? 'Amount Paid' : 'Income') ]
      ]

    _.forEach(resp, arr => {
      switch(req.body.type) {
        case "in":
          let iObj = _.find(bodyPrep, { name: arr.name})
          if(iObj) {
            iObj.amt = iObj.amt + arr.received
            iObj.total = (parseFloat(iObj.total) + parseFloat(arr.income)).toFixed(2)
          } else {
            bodyPrep.push({
              name: arr.name,
              amt: arr.received,
              total: arr.income
            })
          }
          break;
        case "out":
          let oObj = _.find(bodyPrep, { name: arr.name})
          if(oObj) {
            oObj.amt = oObj.amt + arr.sold
            oObj.total = (parseFloat(oObj.total) + parseFloat(arr.income)).toFixed(2)
          } else {
            bodyPrep.push({
              name: arr.name,
              amt: arr.sold,
              total: arr.income
            })
          }
          break;
      }
    })
    _.forEach(bodyPrep, arr => {
      body.push([
        arr.name,
        arr.amt,
        '₱ ' + formatCurr.formatCurrency(arr.total)
      ])
      totalItem = totalItem + arr.amt
      totalAmount = totalAmount + parseFloat(arr.total)
    })
    body.push(['Sub Total', totalItem, '₱ ' + formatCurr.formatCurrency((totalAmount.toFixed(2)).toString())])
    //['Item', ((req.body.type=='in') ? 'Amount received' : 'Amount sold') , ((req.body.type=='in') ? 'Amount Paid' : 'Income') ]
    let docDef = {
      header: { text: title, style: 'header' },
      content: [
        { text: rep, style: 'subhd' },
        {
          text: 'From: ' + dateFrom + '\nTo: ' + dateTo + '\n\n'
        },
        {
          layout: 'lightHorizontalLines',
          table: {
            headerRows: 1,
            widths: ['40%', '30%', '30%'],
            body: body
          }
        }
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          alignment: 'center',
          margin: [0, 10, 0, 20]
        },
        subhd: {
          fontSize: 18,
          bold: false,
          alignment: 'center',
          margin: [0, 10, 0, 20]
        }
      }
    }
    const pdfDoc = pdfMake.createPdf(docDef)
    pdfDoc.getBase64((data) => {
      let filename = title + ' (' + dateFrom + ' - ' + dateTo + ').pdf';
      res.json({ res: data, filename: filename })
    })

  })
}

exports.getMonthlyIncome = (req, res, next) => {
  if(req.headers.hasOwnProperty('authorization')) {
    let token = req.headers.authorization.split(' ')
    let usr = new User
    let auth = usr.checkAuth(token[1])
    if(auth == 'ER_TOKEN') {
      return res.json({ res: 'InvToken' })
    } else {
      auth.then(dec => {
        if(typeof dec != 'string') {
          if(dec.type == 'superAdmin' || dec.type == 'admin') {
            Log.find({}).then((log) => {
              let obj = JSON.parse(JSON.stringify(log))
              let month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              let respIncm = {
                Jan: 0,
                Feb: 0,
                Mar: 0,
                Apr: 0,
                May: 0,
                Jun: 0,
                Jul: 0,
                Aug: 0,
                Sep: 0,
                Oct: 0,
                Nov: 0,
                Dec: 0
              }
              let respLoss = {
                Jan: 0,
                Feb: 0,
                Mar: 0,
                Apr: 0,
                May: 0,
                Jun: 0,
                Jul: 0,
                Aug: 0,
                Sep: 0,
                Oct: 0,
                Nov: 0,
                Dec: 0
              }
              let currYr = new Date().getFullYear('YYYY')
              for(let i = 0; i < 12; i++) {
                _.forEach(obj, arr => {
                  if(new Date(arr.createdAt).getMonth() == i && new Date(arr.createdAt).getFullYear() == currYr) {
                    switch(arr.type) {
                      case 'out':
                        respIncm[month[i]] += parseFloat(arr.income)
                        break;
                      case 'in':
                        respLoss[month[i]] += parseFloat(arr.income)
                        break;
                    }
                  }
                })
              }
              let response = {
                respIncm: respIncm,
                respLoss: respLoss
              }
              return res.json(response)
            })
          } else {
            return res.json({ res: 'AUTH_ERR' })
          }
        } else {
          return res.json({ res: 'InvUser' })
        }
      })
    }
  } else {
    return res.json({ res: 'NoToken' })
  }
}

exports.genId = (req, res, next) => {
  let vst = new Visitor({
    sessionId: req.body.sessId
  })
  vst.save()
  return res.json(vst.genSessionId(req.body.sessId))
}

exports.getVisitors = (req, res, next) => {
  Visitor.find({}).then(visitor => {
    return res.json(visitor)
  }).catch(err => {
    return res.json(err)
  })
}
