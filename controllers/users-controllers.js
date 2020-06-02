const {validationResult} = require('express-validator')
const bcrypth = require('bcryptjs')

const HttpError = require('../models/http-error')
const User = require('../models/user')

const getUsers = async (req, res, next) => {
  // fetch users
  let users
  try {
    users = await User.find({}, '-password')
  } catch (e) {
    console.error(e)
    return next(
      new HttpError(`Fetching users failed`, 500)
    )
  }

  // respond with the list of users
  res.json({
    users: users.map(user => user.toObject({getters: true}))
  })
}

const signup = async (req, res, next) => {
  // check if any validation error detected
  const validationErrors = validationResult(req)
  if (!validationErrors.isEmpty()) {
    return next(
      new HttpError(`Could not create the user, invalid input: ${validationErrors.array()[0].param}`, 422)
    )
  }

  const {name, email, password} = req.body

  // check if the email is already used
  let emailUsed
  try {
    emailUsed = await User.findOne({email})
  } catch (e) {
    console.error(e)
    return next(
        new HttpError('Checking email failed', 500)
    )              
  }

  if (emailUsed) {
    return next(
        new HttpError('Could not create the user, the email is already used', 422)
    )        
  }

  let hashedPassword

  try {
    hashedPassword = await bcrypth.hash(password, 12)
  } catch (e) {
    return next(
      new HttpError('Could not create the user', 500)
    )        
  }

  // create a new user
  const userCreated = new User ({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: []
  })
  
  // save the user
  try {
    await userCreated.save()
  } catch (e) {
    console.error(e)
    return next(
      new HttpError(`Saving the new user failed`, 500)
    )
  }
    
  // respond with the user created
  res.status(201).json({user: userCreated.toObject({getters: true})})
}

const login = async (req, res, next) => {
    const {email, password} = req.body

    // fetch the user
    let userIdentified
    try {
      userIdentified = await User.findOne({email})
    } catch (e) {
      console.error(e)
      return next(
        new HttpError('Fetching the user failed', 500)
      )              
    }

    // check if the user identified and the password valid
    if (!userIdentified || userIdentified.password !== password) {
        return next(
            new HttpError('Could not identify a user, credentials seem wrong', 401)
        )        
    }

    // respond with a message
    res.json({user: userIdentified.toObject({getters: true})})
}

exports.getUsers = getUsers
exports.signup = signup
exports.login = login