const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

require('dotenv').config()

const HttpError = require('./models/http-error')
const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')

const server = express()

server.use(bodyParser.json())

server.use('/api/places', placesRoutes)
server.use('/api/users', usersRoutes)

server.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404)
    return next(error)
})

server.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error)
    }
    console.error('here', error)
    res.status(error.code || 500)
      .json({message: error.message || 'An unknown error occurred!'})
})

// Mongo
const {MONGO_USERNAME, MONGO_PASSWORD} = process.env
const DB_NAME = 'greatplaces'

const MONGO_URL = 
  `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0-nfxjk.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`

mongoose
  .connect(MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => server.listen(5000))
  .catch(err => console.error(err))
