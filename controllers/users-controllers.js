const {uuid} = require('uuidv4')
const {validationResult} = require('express-validator')

const HttpError = require('../models/http-error')
const User = require('../models/user')

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Max Swartz',
        email: 'max@test.com',
        password: 'password-max'
    },
    {
        id: 'u2',
        name: 'Lev Tolstoi',
        email: 'lev@test.com',
        password: 'password-lev'
    },
]

const getUsers = (req, res, next) => {
    res.json({users: DUMMY_USERS})
}

const signup = async (req, res, next) => {
  // check if any error detected
  const errors = validationResult(req)
  console.log(errors)
  if (!errors.isEmpty()) {
    return next(
      new HttpError(`Could not create the user, invalid input: ${errors.array()[0].param}`, 422)
    )
  }

  const {name, email, password, places} = req.body

  // check if the email is already used
  let emailUsed

  try {
    emailUsed = await User.findOne({email})
  } catch (err) {
    return next(
        new HttpError('Signing up failed', 500)
    )              
  }

  if (emailUsed) {
    return next(
        new HttpError('Could not create the user, the email is already used', 422)
    )        
  }

    // the user may be created
    const userCreated = new User ({
        name,
        email,
        password,
        image: 'https://image.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg',
        places
    })
  
    try {
        await userCreated.save()
    } catch (e) {
        return next(
          new HttpError(`Signing up failed`, 500)
        )
    }
    
    res.status(201).json({user: userCreated.toObject({getters: true})})
}

const login = async (req, res, next) => {
    const {email, password} = req.body

    // check if the email is already used
    let userIdentified

    try {
      userIdentified = await User.findOne({email})
    } catch (err) {
      return next(
        new HttpError('Logging in failed', 500)
      )              
    }

    if (!userIdentified || userIdentified.password !== password) {
        return next(
            new HttpError('Could not identify a user, credentials seem wrong', 401)
        )        
    }

    res.json({message: "Logged in"})

}

exports.getUsers = getUsers
exports.signup = signup
exports.login = login