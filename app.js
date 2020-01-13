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
          .on('error', () => {
            console.log('Error')
          })
User.findOne({ username: 'admin' }, (err, user) => {
  if(user) {
    return null;
  }
  let usr = new User({
    username: 'admin',
    password: bcrypt.hashSync('1234', 10),
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

app.set('port', process.env.PORT)
app.use(bodyParser.json())
app.use(logger('dev'))
app.use(cors())
app.use(express.static('app'))
app
  .get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/app/index.html'))
  })
  .post('/api/login', LoginCtrl.authUser)
  .post('/api/register', RegCtrl.addUser)

app.listen(app.get('port'), () => {
  console.log('App running at port %d', app.get('port'))
})

module.exports = app
