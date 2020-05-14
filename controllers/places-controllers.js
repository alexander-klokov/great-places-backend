const {uuid} = require('uuidv4')
const HttpError = require('../models/http-error')

const DUMMY_PLACES = require ('./dummy_places')


const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid

  const place = DUMMY_PLACES.find(p => p.id === placeId)

  if (!place) {
    throw new HttpError('Could not find a place for the provided id.', 404)
  }

  res.json({place})
}

const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid

  const places = DUMMY_PLACES.filter(p => p.creator === userId)

  if (!places) {
    return next(
      new HttpError('Could not find a place for the provided user id.', 404)
    )
  }

  res.json({places})
}

const createPlace = (req, res, next) => {
  const { 
    title, 
    description, 
    coordinates, 
    address, 
    creator
  } = req.body

  const createdPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator
  }

  DUMMY_PLACES.push(createdPlace)

  res.status(201).json({place: createdPlace})
}

exports.getPlaceById = getPlaceById
exports.getPlaceByUserId = getPlaceByUserId
exports.createPlace = createPlace