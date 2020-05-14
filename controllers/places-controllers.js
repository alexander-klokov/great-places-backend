const HttpError = require('../models/http-error');

const DUMMY_PLACES = require ('./dummy_places')

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid

  const place = DUMMY_PLACES.find(p => {
    return p.id === placeId
  });

  if (!place) {
    throw new HttpError('Could not find a place for the provided id.', 404)
  }

  res.json({place})
}

const getPlaceByUserId = (req, res, next) => {
  const userId = req.params.uid

  const place = DUMMY_PLACES.find(p => {
    return p.creator === userId
  });

  if (!place) {
    return next(
      new HttpError('Could not find a place for the provided user id.', 404)
    );
  }

  res.json({ place })
};

exports.getPlaceById = getPlaceById
exports.getPlaceByUserId = getPlaceByUserId