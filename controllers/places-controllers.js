const {uuid} = require('uuidv4')
const HttpError = require('../models/http-error')

let DUMMY_PLACES = require ('./dummy_places')


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

const updatePlace = (req, res, next) => {
  const {title, description} = req.body
  const placeId = req.params.pid

  const placeToUpdate = DUMMY_PLACES.find(p => p.id === placeId)

  if (!placeToUpdate) {
    return next(
      new HttpError('Could not find a place for the provided id.', 404)
    )
  }
  
  const placeUpdated = Object.assign({}, placeToUpdate, {title, description})
  const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId)
  
  DUMMY_PLACES[placeIndex] = placeUpdated
  
  res.status(200).json({place: placeUpdated});
}

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid

  DUMMY_PLACES = DUMMY_PLACES.filter(place => place.id !== placeId)

  res.status(200).json({message: `Delete place ${placeId}`})
}

exports.getPlaceById = getPlaceById
exports.getPlaceByUserId = getPlaceByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace