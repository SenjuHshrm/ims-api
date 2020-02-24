const express = require('express')
const dotenv = require('dotenv')
const logger = require('morgan')
const mongoose = require('mongoose')
const bluebird = require('bluebird')
const cors = require('cors')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const path = require('path')
const User = require('./models/User')

const app = express()

dotenv.config('.env')

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
    contact: ''
  })
  usr.save()

})

const LoginCtrl = require('./controllers/login.js')
const RegCtrl = require('./controllers/register.js')
const UpdCtrl = require('./controllers/update-acct.js')
const DefCtrl = require('./controllers/get-defs.js')
const ItemCtrl = require('./controllers/items.js')
const LogCtrl = require('./controllers/logs.js')

app.set('port', process.env.PORT)
app.use(bodyParser.json({ limit: '50mb' }))
app.use(logger('dev'))
app.use(cors())
app.use(express.static('app'))
app

  .get('/api/get-def', DefCtrl.getDef )
  .post('/api/login', LoginCtrl.authUser)
  .post('/api/update', UpdCtrl.update)
  .post('/api/register', RegCtrl.addUser)
  .post('/api/add-item', ItemCtrl.add)
  .post('/api/update-item', ItemCtrl.updateItem)
  .post('/api/set-feature', ItemCtrl.updateToFeature)
  .post('/api/add-sold', ItemCtrl.addSold)
  .post('/api/add-rec', ItemCtrl.addRec)
  .post('/api/gen-report', LogCtrl.search)
  .post('/api/search-item', ItemCtrl.search)
  .get('/api/get-logs', LogCtrl.getAll)
  .get('/api/get-income-mon', LogCtrl.getMonthlyIncome)
  .get('/api/search-item/name/:name', ItemCtrl.searchByName)
  .get('/api/get-feat', ItemCtrl.getFeat)
  .get('/api/test-check-auth', RegCtrl.testAuth)

  .get('/api/all-prod', ItemCtrl.allItems)
  .get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/app/index.html'))
  })

app.listen(app.get('port'), () => {
  console.log('App running at port %d', app.get('port'))
})

module.exports = app
