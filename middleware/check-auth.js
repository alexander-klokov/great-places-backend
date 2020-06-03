const jwt = require('jsonwebtoken')

const HttpError = require('../models/http-error')

const {JWT_KEY} = process.env

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next()
  }
  try {
    const token = req.headers.authorization // 'Bearer TOKEN'
      .split(' ')[1]
    if (!token) {
        throw new Error('Authentification failed.')
    }
    const decodedToken = jwt.verify(token, JWT_KEY)
    const {userId} = decodedToken
    req.userData = {userId}
    next()
  } catch (e) {
    return next(
        new HttpError('Authentification failed', 401)
    )
  }
}