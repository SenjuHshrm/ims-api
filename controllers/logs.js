const Log = require('../models/Logs')
const moment = require('moment')
const pdfMake = require('../pdfmake/pdfmake')
const vfsFonts = require('../pdfmake/vfs_fonts')
const _ = require('lodash')
const formatCurr = require('../utils/currency')

pdfMake.vfs = vfsFonts.pdfMake.vfs

exports.search = (req, res, next) => {
  console.log(new Date(new Date(req.body.dateFrom).setHours(00,00,00)))
  Log.find({ createdAt: {
    $gte: new Date(new Date(req.body.dateFrom).setHours(00,00,00)),
    $lt: new Date(new Date(req.body.dateTo).setHours(23,59,59))
  }, type: req.body.type }, (err, resp) => {
    if(err) { return res.json({ errors: err }) }
    console.log(resp)
    let title = (req.body.type == 'in') ? 'Inbound sales report' : 'Outbound sales report',
      dateFrom = moment(req.body.dateFrom).format('MM/DD/YYYY'),
      dateTo = moment(req.body.dateTo).format('MM/DD/YYYY'),
      totalItem = 0,
      totalAmount = 0,
      totalRec = 0

    _.forEach(resp, arr => {
      switch(req.body.type) {
        case "in":
          totalRec = totalRec + arr.received
          break;
        case "out":
          totalItem = totalItem + arr.sold;
          totalAmount = totalAmount + +arr.income;
          break
      }
    })
    let docDef = {
      header: { text: title, style: 'header' },
      content: [
        {
          text: 'As of ' + dateFrom + ' up to ' + dateTo + '\n'
        },
        {
          layout: 'lightHorizontalLines',
          table: {
            headerRows: 1,
            widths: [150, 150],
            body: [
              [((req.body.type=='in') ? 'Amount of items received' : 'Amount of items sold') , 'Income' ],
              [((req.body.type=='in') ? totalRec : totalItem ), ((req.body.type=='in') ? '₱ 0.00' : formatCurr.formatCurrency((totalAmount.toFixed(2)).toString() ))]
            ]
          }
        }
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          alignment: 'center'
        }
      }
    }
    const pdfDoc = pdfMake.createPdf(docDef)
    pdfDoc.getBase64((data) => {
      // res.writeHead(200, {
      //   'Content-Type': 'application/pdf',
      //   'Content-Disposition': 'attachment;filename="filename.pdf"'
      // })
      //let file = new Buffer.from(data).toString('base64')
      res.json({ res: data })
    })

  })
}
