const express = require('express')

const DUMMY_PLACES = require ('./dummy_places')

const router = express.Router()

router.get('/:pid', (req, res, next) => {
    const placeId = req.params.pid
    const place = DUMMY_PLACES.find(place => place.id === placeId)

    res.json({place})
})

router.get('/user/:uid', (req, res, next) => {
    const userId = req.params.uid
    const places = DUMMY_PLACES.filter(place => place.creator === userId)

    res.json({places})
})

module.exports = router