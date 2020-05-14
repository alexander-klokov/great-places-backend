const express = require('express')
const bodyParser = require('body-parser')

const HttpError = require('./models/http-error')
const placeRoutes = require('./routes/places-routes')

const server = express()

server.use(bodyParser.json())

server.use('/api/places', placeRoutes)

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

server.listen(5000)