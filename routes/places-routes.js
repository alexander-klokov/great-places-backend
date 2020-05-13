const express = require('express')

const DUMMY_PLACES = require ('./dummy_places')

const router = express.Router()

router.get('/:pid', (req, res, next) => {
    const placeId = req.params.pid
    const place = DUMMY_PLACES.find(place => place.id === placeId)

    res.json({place})
})

module.exports = router