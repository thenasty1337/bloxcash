const express = require('express');
const router = express.Router();
const { marketplaceListings } = require('./functions');

router.get('/', (req, res) => {
    res.json(Object.values(marketplaceListings));
});

const buyRoute = require('./buy');
const sellRoute = require('./sell');

router.use('/buy', buyRoute);
router.use('/sell', sellRoute);

module.exports = router;