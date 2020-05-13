const express = require('express')
const bodyParser = require('body-parser')

const placeRoutes = require('./routes/places-routes')

const server = express()

server.use('/api/places', placeRoutes)

server.listen(5000)