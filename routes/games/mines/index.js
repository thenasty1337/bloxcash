const express = require('express');
const router = express.Router();

const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
	windowMs: 100,
	max: 1,
	message: { error: 'SLOW_DOWN' },
	standardHeaders: false,
	legacyHeaders: false,
    keyGenerator: (req, res) => req.user.id
});

const { newBets } = require('../../../socketio/bets');
const { isAuthed } = require('../../auth/functions');
const { enabledFeatures, xpMultiplier } = require('../../admin/config');
const { generateMinePositions, calculateMultiplier, totalTiles, houseEdge } = require('./functions');
const io = require('../../../socketio/server');

const { sql, doTransaction } = require('../../../database');
const { roundDecimal, xpChanged } = require('../../../utils');

router.use(isAuthed);

router.get('/', async (req, res) => {

    const [[activeGame]] = await sql.query('SELECT minesCount, revealedTiles, amount FROM mines WHERE endedAt IS NULL AND userId = ?', [req.user.id]);
    if (!activeGame) return res.json({ activeGame: false });

    // Try parsing revealedTiles, default to [] on error
    let parsedRevealedTiles = [];
    try {
        // Only parse if a non-empty string
        if (typeof activeGame.revealedTiles === 'string' && activeGame.revealedTiles.trim() !== '') {
             parsedRevealedTiles = JSON.parse(activeGame.revealedTiles);
        }
    } catch (e) {
        console.error(`Failed to parse revealedTiles for mines game (User: ${req.user.id}, Value: ${activeGame.revealedTiles}):`, e);
        // Keep parsedRevealedTiles as [] if parsing failed
    }
    activeGame.revealedTiles = parsedRevealedTiles;

    activeGame.multiplier = calculateMultiplier(activeGame.minesCount, activeGame.revealedTiles.length);
    activeGame.currentPayout = roundDecimal(activeGame.amount * activeGame.multiplier);

    res.json({ activeGame });

});

router.post('/start', apiLimiter, async (req, res) => {

    if (!enabledFeatures.mines) return res.status(400).json({ error: 'DISABLED' });

    let { amount, minesCount } = req.body;
    if (!Number.isInteger(minesCount) || minesCount < 1 || minesCount > totalTiles - 1) return res.status(400).json({ error: 'INVALID_MINES_COUNT' });

    amount = roundDecimal(amount);
    if (amount < 1) return res.status(400).json({ error: 'MINES_MIN_BET' });
    if (amount > 20000) return res.status(400).json({ error: 'MINES_MAX_BET' });

    try {

        await doTransaction(async (connection, commit) => {
            const [[activeGame]] = await connection.query('SELECT id FROM mines WHERE userId = ? AND endedAt IS NULL FOR UPDATE', [req.user.id]);
            if (activeGame) return res.status(400).json({ error: 'MINES_GAME_ACTIVE' });

            const [[user]] = await connection.query(`
                SELECT u.id, u.balance, u.xp, ss.seed as serverSeed, ss.id as ssId, ss.nonce, cs.seed as clientSeed, cs.id as csId FROM users u
                INNER JOIN serverSeeds ss ON u.id = ss.userId AND ss.endedAt IS NULL
                INNER JOIN clientSeeds cs ON u.id = cs.userId AND cs.endedAt IS NULL
                WHERE u.id = ? FOR UPDATE
            `,[req.user.id]);

            if (!user) return res.status(404).json({ error: 'UNKNOWN_ERROR' });
            if (amount > user.balance) return res.status(400).json({ error: 'INSUFFICIENT_BALANCE' });

            const nonce = user.nonce + 1;
            const minePositions = generateMinePositions(user.serverSeed, user.clientSeed, nonce, minesCount);

            // --- BEGIN TYPE CHECKING & DEBUG LOGGING ---
            console.log('[DEBUG /mines/start] About to insert new game:');
            console.log('[DEBUG /mines/start] User ID:', req.user.id);
            
            if (!Array.isArray(minePositions)) {
                console.error('[FATAL /mines/start] minePositions IS NOT AN ARRAY! Type:', typeof minePositions, 'Value:', minePositions);
                // Avoid inserting bad data, return an error
                return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to generate game data correctly.' });
            }
            console.log('[DEBUG /mines/start] minePositions (verified array):', minePositions);
            
            const stringifiedMinePositions = JSON.stringify(minePositions);
            if (typeof stringifiedMinePositions !== 'string') {
                 console.error('[FATAL /mines/start] stringifiedMinePositions IS NOT A STRING! Type:', typeof stringifiedMinePositions, 'Value:', stringifiedMinePositions);
                 // Avoid inserting bad data, return an error
                return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Failed to serialize game data correctly.' });
            }
            console.log('[DEBUG /mines/start] stringifiedMinePositions (verified string):', stringifiedMinePositions);
            
            const revealedTilesValue = '[]';
            console.log('[DEBUG /mines/start] revealedTilesValue (string):', revealedTilesValue);
            // --- END TYPE CHECKING & DEBUG LOGGING ---

            const [nonceIncrease] = await connection.query('UPDATE serverSeeds SET nonce = nonce + 1 WHERE id = ?', [user.ssId]);
            if (nonceIncrease.affectedRows != 1) return res.status(404).json({ error: 'UNKNOWN_ERROR' });

            const xp = roundDecimal(amount * xpMultiplier);
            await connection.query('UPDATE users SET balance = balance - ?, xp = xp + ? WHERE id = ?', [amount, xp, req.user.id]);
            const [result] = await connection.query(
                'INSERT INTO mines (userId, amount, clientSeedId, serverSeedId, nonce, minesCount, mines, revealedTiles) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [req.user.id, amount, user.csId, user.ssId, nonce, minesCount, stringifiedMinePositions, revealedTilesValue]
            );

            const edge = roundDecimal(amount * houseEdge);
            await connection.query('INSERT INTO bets (userId, amount, winnings, edge, game, gameId, completed) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.user.id, amount, 0, edge, 'mines', result.insertId, 0]);

            await xpChanged(user.id, user.xp, roundDecimal(user.xp + xp), connection);
            await commit();

            io.to(req.user.id).emit('balance', 'set', roundDecimal(user.balance - amount));
            res.json({ success: true });
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'INTERNAL_ERROR' });
    }

});

router.post('/reveal', apiLimiter, async (req, res) => {

    if (!enabledFeatures.mines) return res.status(400).json({ error: 'DISABLED' });

    const { field } = req.body;
    if (!Number.isInteger(field) || field < 0 || field > totalTiles - 1) return res.status(400).json({ error: 'INVALID_FIELD' });

    try {

        await doTransaction(async (connection, commit) => {

            const [[activeGame]] = await connection.query('SELECT id, mines, revealedTiles, amount, minesCount FROM mines WHERE endedAt IS NULL AND userId = ? FOR UPDATE', [req.user.id]);
            if (!activeGame) return res.status(400).json({ error: 'NO_MINES_GAME_ACTIVE' });
    
            // Try parsing revealedTiles, default to [] on error
            let revealedTiles = [];
            try {
                // Only parse if a non-empty string
                if (typeof activeGame.revealedTiles === 'string' && activeGame.revealedTiles.trim() !== '') {
                    revealedTiles = JSON.parse(activeGame.revealedTiles);
                }
            } catch (e) {
                console.error(`Failed to parse revealedTiles for mines game (User: ${req.user.id}, Value: ${activeGame.revealedTiles}):`, e);
                // Keep revealedTiles as [] if parsing failed
            }

            if (revealedTiles.includes(field)) return res.status(400).json({ error: 'ALREADY_REVEALED' });
    
            // Safely parse minePositions
            let minePositions;
            try {
                if (!activeGame.mines) {
                    throw new Error('Mines data is missing from active game.');
                }
                minePositions = JSON.parse(activeGame.mines);
            } catch (e) {
                console.error(`Failed to parse mines for active game (ID: ${activeGame.id}, User: ${req.user.id}, Value: ${activeGame.mines}):`, e);
                // Rollback transaction implicitly by throwing error
                throw new Error('INVALID_GAME_STATE'); 
            }

            const isMine = minePositions.includes(field);
    
            revealedTiles.push(field);
    
            if (isMine) {
    
                await connection.query('UPDATE mines SET endedAt = NOW(), payout = 0, revealedTiles = ? WHERE id = ?', [JSON.stringify(revealedTiles), activeGame.id]);
                await connection.query('UPDATE bets SET winnings = 0, completed = 1 WHERE game = ? AND gameId = ?', ['mines', activeGame.id]);
            
                const [[user]] = await connection.query('SELECT id, username, role, xp, anon FROM users WHERE id = ?', [req.user.id]);
                await commit();
    
                newBets([{
                    user: user,
                    amount: activeGame.amount,
                    edge: roundDecimal(activeGame.amount * houseEdge),
                    payout: 0,
                    game: 'mines'
                }]);
    
                return res.json({ success: true, isMine, minePositions, revealedTiles });
    
            }
    
            const multiplier = calculateMultiplier(activeGame.minesCount, revealedTiles.length);
            const currentPayout = roundDecimal(activeGame.amount * multiplier);
    
            if (revealedTiles.length == totalTiles - activeGame.minesCount) {
                await doPayout(connection, commit, activeGame, multiplier, currentPayout, req, res, revealedTiles)
            } else {
                await connection.query('UPDATE mines SET revealedTiles = ? WHERE id = ?', [JSON.stringify(revealedTiles), activeGame.id]);
                await commit();
                res.json({ success: true, isMine, revealedTiles, multiplier, currentPayout });
            }

        });

    } catch (e) {
        console.error(e); // Log the original or the thrown INVALID_GAME_STATE error
        // Ensure a generic error is sent to client, even if we threw INVALID_GAME_STATE
        return res.status(500).json({ error: 'INTERNAL_ERROR' });
    }

});

router.post('/cashout', apiLimiter, async (req, res) => {

    try {

        await doTransaction(async (connection, commit) => {
            const [[activeGame]] = await connection.query('SELECT id, mines, revealedTiles, minesCount, amount FROM mines WHERE endedAt IS NULL AND userId = ? FOR UPDATE', [req.user.id]);
            if (!activeGame) return res.status(400).json({ error: 'NO_MINES_GAME_ACTIVE' });

            // Safely parse revealedTiles, default to [] on error or null/empty string
            let revealedTiles = [];
            try {
                if (typeof activeGame.revealedTiles === 'string' && activeGame.revealedTiles.trim() !== '') {
                    revealedTiles = JSON.parse(activeGame.revealedTiles);
                }
            } catch (e) {
                console.error(`Failed to parse revealedTiles during cashout (User: ${req.user.id}, Value: ${activeGame.revealedTiles}):`, e);
                // Default to empty array if parsing fails
            }
            if (revealedTiles.length == 0) return res.status(400).json({ error: 'NO_REVEALED_TILES' });

            const multiplier = calculateMultiplier(activeGame.minesCount, revealedTiles.length);
            const payout = roundDecimal(activeGame.amount * multiplier);

            await doPayout(connection, commit, activeGame, multiplier, payout, req, res)
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'INTERNAL_ERROR' });
    }

});

async function doPayout(connection, commit, activeGame, multiplier, payout, req, res, tiles) {

    if (tiles) {
        await connection.query('UPDATE mines SET endedAt = NOW(), payout = ?, revealedTiles = ? WHERE id = ?', [payout, JSON.stringify(tiles), activeGame.id]);
    } else {
        await connection.query('UPDATE mines SET endedAt = NOW(), payout = ? WHERE id = ?', [payout, activeGame.id]);
    }

    await connection.query('UPDATE bets SET winnings = ?, completed = 1 WHERE game = ? AND gameId = ?', [payout, 'mines', activeGame.id]);

    const [[user]] = await connection.query('SELECT id, username, balance, role, xp, anon FROM users WHERE id = ? FOR UPDATE', [req.user.id]);

    const balance = roundDecimal(user.balance + payout);
    await connection.query('UPDATE users SET balance = ? WHERE id = ?', [balance, req.user.id]);
    await commit();

    io.to(req.user.id).emit('balance', 'set', balance);

    newBets([{
        user: user,
        amount: activeGame.amount,
        edge: roundDecimal(activeGame.amount * houseEdge),
        payout: payout,
        game: 'mines'
    }]);

    res.json({ success: true, payout, multiplier, minePositions: JSON.parse(activeGame.mines) });

}

module.exports = router;