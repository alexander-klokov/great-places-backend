const {uuid} = require('uuidv4')
const {validationResult} = require('express-validator')
const mongoose = require('mongoose')

const HttpError = require('../models/http-error')
const getPlaceData = require('../util/location')
const Place = require('../models/place')
const User = require('../models/user')


const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid

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

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid

  let places

  try {
    places = await Place.find({creator: userId})
  } catch (err) {
    return next(
      new HttpError('Fetching places failed.', 500)
    )
  }
  
  if (!places || !places.length) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    )
  }

  res.json({
    places: places.map(place => place.toObject({getters: true}))
  })
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

  let user
  try {
    user = await User.findById(creator)
  } catch (e) {
    return next (
      new HttpError('Creating place failed.', 404)
    )
  }

  // check if the user was found
  if (!user) {
    return next (
      new HttpError('Could not find user for the provided id', 500)
    )
  }

  try {
    const session = await mongoose.startSession()
    session.startTransaction()
    await createdPlace.save({session})
    user.places.push(createdPlace)
    await user.save({session})
    await session.commitTransaction()
  } catch (e) {
    console.error(e)
    return next(
      new HttpError(`Creating place failed`, 500)
    )
  }

  res.status(201).json({place: createdPlace})
}

const updatePlace = async (req, res, next) => {
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

  let placeToUpdate
  try {
    placeToUpdate = await Place.findById(placeId)
  } catch (err) {
    return next(
      new HttpError('Something went wrong, could not find the place', 500)
    )
  }

  if (!placeToUpdate) {
    return next(
      new HttpError('Could not find a place for the provided id.', 404)
    )
  }
  
  placeToUpdate.title = title
  placeToUpdate.description = description

  try {
    await placeToUpdate.save()
  } catch (e) {
    return next(
      new HttpError(`Updating place failed`, 500)
    )
  }

  res.status(200).json({place: placeToUpdate.toObject({getters: true})});
}

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid

  let placeToDelete
  try {
    placeToDelete = await Place.findById(placeId).populate('creator')
  } catch (err) {
    return next(
      new HttpError('Something went wrong, could not find the place', 500)
    )
  }

  // check if the place-to-delete exists
  if (!placeToDelete) {
    return next(
      new HttpError('Could not find the place for the provided id', 500)
    )
  }

  try {
    const session = await mongoose.startSession()
    session.startTransaction()
    await placeToDelete.remove({session})
    placeToDelete.creator.places.pull(placeToDelete)
    await placeToDelete.creator.save({session})
    session.commitTransaction()
  } catch (error) {
    console.error(error)
    return next(
      new HttpError('Something went wrong, could not delete the place', 500)
    )
  }

  res.status(200).json({message: `Delete place ${placeId}`})
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace