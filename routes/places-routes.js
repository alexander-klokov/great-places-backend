const express = require('express')

const DUMMY_PLACES = require ('./dummy_places')

const router = express.Router()

router.get('/:pid', (req, res, next) => {
    const placeId = req.params.pid
    const place = DUMMY_PLACES.find(place => place.id === placeId)

    if (!place) {
        const error = new Error ("Could not find a place for the provided id.")
        error.code = 404

        return next(error)
    }

    res.json({place})
})

router.get('/user/:uid', (req, res, next) => {
    const userId = req.params.uid
    const places = DUMMY_PLACES.filter(place => place.creator === userId)

    if (!places || !places.length) {
        const error = new Error ("Could not find a place for the provided user id.")
        error.code = 404
        
        return next(error)
    }

    res.json({places})
})

module.exports = router