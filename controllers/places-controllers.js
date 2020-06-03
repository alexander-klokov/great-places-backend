const fs = require('fs')
const {validationResult} = require('express-validator')
const mongoose = require('mongoose')

const HttpError = require('../models/http-error')
const getPlaceData = require('../util/location')
const Place = require('../models/place')
const User = require('../models/user')


const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid

  // find the place
  let place
  try {
    place = await Place.findById(placeId)
  } catch (e) {
    console.error(e)
    return next(
      new HttpError('Fetching place failed', 500)
    )
  }

  // the place was fetched, check if valid
  if (!place) {
    return next(
      new HttpError('The place was fetched, but not valid', 404)
    )
  }

  // respond with the place found
  res.json({
    place: place.toObject({getters: true})
  })
}

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid

  // get the user
  let userWithPlaces
  try {
    userWithPlaces = await User.findById(userId).populate('places')
  } catch (e) {
    console.error(e)
    return next(
      new HttpError('Fetching user failed', 500)
    )
  }
  
  // the user was fetched, check it has valid places
  if (!userWithPlaces || !userWithPlaces.places || !userWithPlaces.places.length) {
    return next(
      new HttpError('Could not find places for the provided user id', 404)
    )
  }

  // respond with a list of places associated with the user
  res.json({
    places: userWithPlaces.places.map(place => place.toObject({getters: true}))
  })
}

const createPlace = async (req, res, next) => {
  // check if any validation error detected
  const validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    return next(
      new HttpError(`Invalid value: ${validationErrors.array()[0].param}`, 422)
    )
  }

  // req.body is valid
  const {
    title, 
    description, 
    address, 
    creator
  } = req.body

  // placeDate = location (lat and lng) + formatted address
  let placeData
  try {
    placeData = await getPlaceData(address)
  } catch (e) {
    console.error(e)
    return next(
      new HttpError('Could not get location and/or formatted address', 404)
    )
  }

  // place data fetched - create the new place
  const [location, formattedAddress] = placeData
  const createdPlace = new Place({
    title,
    description,
    location,
    address: formattedAddress,
    image: req.file.path,
    creator
  })

  // fetch the user associated with the place created
  let user
  try {
    user = await User.findById(creator)
  } catch (e) {
    return next (
      new HttpError('Could not fetch the user associated with the place created', 404)
    )
  }

  // check if the user was found
  if (!user) {
    return next (
      new HttpError('Could not find user for the provided id', 500)
    )
  }

  // save the place created and attach it to the associated user
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
      new HttpError(`Saving place failed`, 500)
    )
  }

  // respond with the place created
  res.status(201).json({place: createdPlace})
}

const updatePlace = async (req, res, next) => {
  // check if any validation error detected
  const validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    return next(
      new HttpError(`Invalid value: ${validationErrors.array()[0].param}`, 422)
    )
  }
  
  // req.body is valid
  const {title, description} = req.body
  const placeId = req.params.pid

  // fetch the place-to-update
  let placeToUpdate
  try {
    placeToUpdate = await Place.findById(placeId)
  } catch (e) {
    console.error(e)
    return next(
      new HttpError('Fething place-to-update failed', 500)
    )
  }

  // place-to-update fetched, check if valid
  if (!placeToUpdate) {
    return next(
      new HttpError('Could not find a place for the provided id.', 404)
    )
  }

  if (placeToUpdate.creator.toString() !== req.userData.userId) {
    return next(
      new HttpError('You are not allowed to edit this place.', 401)
    )
  }
  
  // update the place
  placeToUpdate.title = title
  placeToUpdate.description = description

  // save the place updated
  try {
    await placeToUpdate.save()
  } catch (e) {
    console.error(e)
    return next(
      new HttpError(`Saving place failed`, 500)
    )
  }

  // respond with the place updated
  res.status(200).json({place: placeToUpdate.toObject({getters: true})});
}

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid

  // fetch the place-to-delete
  let placeToDelete
  try {
    placeToDelete = await Place.findById(placeId).populate('creator')
  } catch (e) {
    console.error(e)
    return next(
      new HttpError('Fetching place failed', 500)
    )
  }

  // place-to-delete is fetched, check if valid 
  if (!placeToDelete) {
    return next(
      new HttpError('Could not find the place for the provided id', 500)
    )
  }

  const imagePath = placeToDelete.image

  // delete the place and adjust the associated user info
  try {
    const session = await mongoose.startSession()
    session.startTransaction()
    await placeToDelete.remove({session})
    placeToDelete.creator.places.pull(placeToDelete)
    await placeToDelete.creator.save({session})
    session.commitTransaction()
  } catch (e) {
    console.error(e)
    return next(
      new HttpError('Failed on deleting place', 500)
    )
  }

  fs.unlink(imagePath, e => console.error(e))

  // respond with the message
  res.status(200).json({message: `Delete place ${placeId}`})
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.createPlace = createPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace