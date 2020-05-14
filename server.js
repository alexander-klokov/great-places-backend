const express = require('express')
const bodyParser = require('body-parser')

const placeRoutes = require('./routes/places-routes')

const server = express()

server.use(bodyParser.json())

server.use('/api/places', placeRoutes)

server.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error)
    }
    console.error('here', error)
    res.status(error.code || 500)
      .json({message: error.message || 'An unknown error occurred!'})
})

server.listen(5000)