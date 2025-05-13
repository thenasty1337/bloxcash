const express = require('express');
const router = express.Router();

const { sql, doTransaction } = require('../../../database');
const { sendLog } = require('../../../utils');
const io = require('../../../socketio/server');

const cryptoRoute = require('./crypto');
router.use('/crypto', cryptoRoute);

const resultsPerPage = 10;

router.post('/createGiftCards', async (req, res) => {

    const quantity = parseInt(req.body.quantity);
    if (!quantity || isNaN(quantity)) return res.status(400).json({ error: 'MISSING_QUANTITY' });

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100) return res.status(400).json({ error: 'INVALID_QUANTITY' });

    const amount = parseInt(req.body.amount);
    if (!amount || isNaN(amount)) return res.status(400).json({ error: 'MISSING_AMOUNT' });

    if (amount < 1 || amount > 1000) return res.status(400).json({ error: 'INVALID_AMOUNT' });

    const values = [];
    const codes = [];

    for (let i = 0; i < quantity; i++) {
        const code = [...Array(16)].map(i=>(~~(Math.random()*36)).toString(36)).join('').match(/.{1,4}/g);
        values.push([code.join('').toLowerCase(), amount, 1]);
        codes.push(code.join('-').toUpperCase());
    }

    await sql.query('INSERT INTO giftCards (code, amount, usd) VALUES ?', [values]);

    sendLog('admin', `[\`${req.user.id}\`] *${req.user.username}* created \`${quantity}\` gift cards of $\`${amount}\`usd each`);
    res.json({ success: true, codes, amount });

});

module.exports = router;