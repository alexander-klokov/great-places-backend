const {uuid} = require('uuidv4')
const {validationResult} = require('express-validator')

const HttpError = require('../models/http-error')
const getPlaceData = require('../util/location')
const Place = require('../models/place')

let DUMMY_PLACES = require ('./dummy_places')

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid

  console.error('GET B')

  let place
  try {
    place = await Place.findById(placeId)
  } catch (err) {
    return next(
      new HttpError('Something went wrong, could not find the place', 500)
    )
  }

  if (!place) {
    return next(
      new HttpError('Could not find a place for the provided id.', 404)
    )
  }

  res.json({
    place: place.toObject({getters: true})
  })
}

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid

  const places = DUMMY_PLACES.filter(p => p.creator === userId)

  if (!places || !places.length) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    )
  }

  res.json({places})
}

const createPlace = async (req, res, next) => {

  // check if any error detected
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError(`Invalid value: ${errors.array()[0].param}`, 422)
    )
  }

  // req.body is valid
  const {
    title, 
    description, 
    address, 
    creator
  } = req.body

  let placeData
  try {
    placeData = await getPlaceData(address)
  } catch (error) {
    return next(error) 
  }

  const [location, formattedAddress] = placeData
  const createdPlace = new Place({
    title,
    description,
    location,
    address: formattedAddress,
    image: '//upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/500px-Empire_State_Building_%28aerial_view%29.jpg',
    creator
  })

  try {
    await createdPlace.save()
  } catch (e) {
    return next(
      new HttpError(`Creating place failed`, 500)
    )
  }

  res.status(201).json({place: createdPlace})
}

const updatePlace = (req, res, next) => {
  // check if any error detected
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return next(
      new HttpError(`Invalid value: ${errors.array()[0].param}`, 422)
    )
  }
  
  // req.body is valid
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

  if (!DUMMY_PLACES.find(place => place.id === placeId)) {
    return next(
      new HttpError('Could not find a place for the provided id.', 404)
    )
  }

  DUMMY_PLACES = DUMMY_PLACES.filter(place => place.id !== placeId)

  res.status(200).json({message: `Delete place ${placeId}`})
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace