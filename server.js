const express = require('express')
const bodyParser = require('body-parser')

const placeRoutes = require('./routes/places-routes')

const server = express()

server.use(placeRoutes)

server.listen(5000)