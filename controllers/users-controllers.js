const {uuid} = require('uuidv4')

const HttpError = require('../models/http-error')

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

const signup = (req, res, next) => {
    const {name, email, password} = req.body

    // check if the email is already used
    const emailUsed = DUMMY_USERS.some(user => user.email === email)
    if (emailUsed) {
        return next(
            new HttpError('Could not create the user, the email is already used', 422)
        )        
    }

    // the user may be created

    const userCreated = {
        id: uuid(),
        name,
        email,
        password
    }

    DUMMY_USERS.push(userCreated)

    res.status(201).json({user: userCreated})
}

const login = (req, res, next) => {
    const {email, password} = req.body

    const userIdentified = DUMMY_USERS.find(user => user.email === email)

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