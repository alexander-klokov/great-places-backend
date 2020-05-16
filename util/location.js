const axios = require('axios')
const HttpError = require('../models/http-error')

const {API_KEY} = process.env

async function getPlaceData(address) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}
    &key=${API_KEY}`
  )

  const data = response.data

  if (!data || data.status === 'ZERO_RESULTS') {
    return next(
        new HttpError('Could not find location for the specified address.', 422)
      )
  }

  const location = data.results[0].geometry.location
  const formattedAddress = data.results[0].formatted_address

  return [location, formattedAddress]
}

module.exports = getPlaceData