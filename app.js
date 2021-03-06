const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const dotenv = require('dotenv')
const logger = require('morgan')
const mongoose = require('mongoose')
const bluebird = require('bluebird')
const cors = require('cors')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const path = require('path')
const User = require('./models/User')

dotenv.config('.env')

global.io = io

mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true })
mongoose.Promise = bluebird
mongoose.connection
          .on('open', () => {
            console.log('Connected')
          })
          .on('error', (err) => {
            console.log(err)
          })

User.findOne({ username: process.env.SUPER_ADMIN_USERNAME }, (err, user) => {
  if(user) {
    return null;
  }
  let usr = new User({
    username: process.env.SUPER_ADMIN_USERNAME,
    password: bcrypt.hashSync(process.env.SUPER_ADMIN_PASSWORD, 10),
    type: 'superAdmin',
    fName: '',
    mName: '',
    lName: '',
    addr: '',
    contact: '',
    activated: true,
    hasOpenedNotif: true
  })
  usr.save()

})

const LoginCtrl = require('./controllers/login.js')
const RegCtrl = require('./controllers/register.js')
const UpdCtrl = require('./controllers/update-acct.js')
const DefCtrl = require('./controllers/get-defs.js')
const ItemCtrl = require('./controllers/items.js')
const LogCtrl = require('./controllers/logs.js')
const GallCtrl = require('./controllers/gallery.js')

app.set('port', process.env.PORT)
app.use(bodyParser.json({ limit: '50mb' }))
app.use(logger('dev'))
app.use(cors())
app.use(express.static('app'))
// app.use(function(req, res, next) {
//   req.io = io;
//   next();
// })
app
  .get('/api/get-def', DefCtrl.getDef ) //suAdmin, admin, encoder
  .post('/api/login', LoginCtrl.authUser)
  .post('/api/update', UpdCtrl.update) //suAdmin, admin, encoder
  .post('/api/register', RegCtrl.addUser) //suAdmin
  .post('/api/add-item', ItemCtrl.add) //suAdmin, admin, encoder
  .post('/api/update-item', ItemCtrl.updateItem) //suAdmin, admin, encoder
  .post('/api/set-feature', ItemCtrl.updateToFeature) //suAdmin, admin, encoder
  .post('/api/add-sold', ItemCtrl.addSold) //suAdmin, admin, encoder
  .post('/api/add-rec', ItemCtrl.addRec) //suAdmin, admin, encoder
  .post('/api/gen-report', LogCtrl.search) //suAdmin, admin, encoder
  .post('/api/search-item', ItemCtrl.search) //suAdmin, admin, encoder
  .post('/api/acct-activation', LoginCtrl.actvt) //suAdmin
  .post('/api/add-photo', GallCtrl.addImg)
  .post('/api/delete-photo', GallCtrl.deleteImg)
  .post('/api/delete-item', ItemCtrl.delItem)
  .post('/api/visitor-session', LogCtrl.genId)
  .post('/api/close-notif', LoginCtrl.notifOpen)
  .post('/api/delete-notifs', LoginCtrl.delNotif)
  .get('/api/get-logs', LogCtrl.getAll) //suAdmin, admin
  .get('/api/get-income-mon', LogCtrl.getMonthlyIncome) //suAdmin, admin
  .get('/api/search-item/name/:name', ItemCtrl.searchByName) //suAdmin, admin, encoder
  .get('/api/get-feat', ItemCtrl.getFeat)
  .get('/api/get-users', LoginCtrl.getUsers) //suAdmin
  .get('/api/all-prod', ItemCtrl.allItems)
  .get('/api/get/visitors', LogCtrl.getVisitors)
  .get('/api/get-photos', GallCtrl.getImg)
  .get('/api/get-notifs/:username', LoginCtrl.getNotifs)
  .get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/app/index.html'))
  })

io.on('connection', socket => {
  socket.emit('test event', 'Here is your f*cking data')
})

http.listen(app.get('port'), () => {
  console.log('App running at port %d', app.get('port'))
})

module.exports = app
