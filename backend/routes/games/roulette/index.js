const express = require('express');
const router = express.Router();

const { doTransaction, sql } = require('../../../database');

const { isAuthed, apiLimiter } = require('../../auth/functions');
const { roundDecimal, xpChanged } = require('../../../utils');
const io = require('../../../socketio/server');
const { roulette, updateRoulette, cacheRoulette } = require('./functions')

// const clientSeed = '00000000000000000003e5a54c2898a18d262eb5860e696441f8a4ebbff03697'; // btc block hash

const { enabledFeatures, xpMultiplier } = require('../../admin/config');

router.use((req, res, next) => {
    if (!enabledFeatures.roulette) return res.status(400).json({ error: 'DISABLED' });
    next();
});

router.post('/bet', isAuthed, apiLimiter, async (req, res) => {

    if (roulette.round.rolledAt) return res.json({ error: 'ALREADY_STARTED' });
    const color = req.body.color;

    if (![0, 1, 2].includes(color)) {
        return res.json({ error: 'INVALID_COLOR' });
    }

    const maxBet = color == 0 ? 7500 : roulette.config.maxBet;
    const amount = roundDecimal(req.body.amount);

    if (!amount || amount < 0.01) {
        return res.json({ error: 'INVALID_AMOUNT' });
    } else if (amount > maxBet) {
        return res.json({ error: 'MAX_BET_ROULETTE' });
    }

    try {

        await doTransaction(async (connection, commit) => {

            const [[user]] = await connection.query('SELECT id, username, balance, xp, perms, sponsorLock, anon FROM users WHERE id = ? FOR UPDATE', [req.user.id]);

            if (user.balance < amount) {
                return res.json({ error: 'INSUFFICIENT_BALANCE' });
            }
    
            // Update DB: Deduct bet amount and add XP
            const xp = roundDecimal(amount * xpMultiplier);
            await connection.query('UPDATE users SET balance = balance - ?, xp = xp + ? WHERE id = ?', [amount, xp, user.id]);
            await xpChanged(user.id, user.xp, roundDecimal(user.xp + xp), connection);
            
            // Get the updated user balance after deduction
            const [[updatedUser]] = await connection.query('SELECT balance FROM users WHERE id = ?', [user.id]);
            
            // Send immediate balance update via socket
            console.log(`Sending balance update after bet: user ${user.id}, new balance ${updatedUser.balance}`);
            io.to(user.id).emit('balance', 'set', updatedUser.balance);
   
            if (color != 0) {
                const oppositeExists = roulette.bets.find(bet => bet.user.id === user.id && bet.color === (color == 1 ? 2 : 1));
                if (oppositeExists) {
                    return res.json({ error: 'ALREADY_BET_ON_OTHER_COLOR' });
                }
            }
            
            const existing = roulette.bets.find(bet => bet.user.id === user.id && bet.color === color);

            if (existing) {
    
                if (!user.sponsorLock && user.perms < 2) {
                    if (existing.amount + amount > maxBet) {
                        return res.json({ error: 'MAX_BET_ROULETTE' });
                    }
                }
    
                await connection.query('UPDATE rouletteBets SET amount = amount + ? WHERE id = ?', [amount, existing.id]);
                await connection.query('UPDATE bets SET amount = amount + ? WHERE userId = ? AND game = ? AND gameId = ?', [amount, user.id, 'roulette', existing.id]);
                await commit();

                existing.amount += amount;
                
                // Log user bet with detailed information
                const colorNames = ['gold', 'green', 'red'];
                console.log(`👤 ${user.username} increased bet to ${existing.amount.toFixed(2)} on ${colorNames[color]} (round ID: ${roulette.round.id})`);
    
                io.to('roulette').emit('roulette:bet:update', {
                    id: existing.id,
                    amount: existing.amount
                });
    
            } else {
    
                const [rouletteBetResult] = await connection.query('INSERT INTO rouletteBets (userId, roundId, color, amount) VALUES (?, ?, ?, ?)', [user.id, roulette.round.id, color, amount]);
                const [betResult] = await connection.query('INSERT INTO bets (userId, amount, edge, game, gameId, completed) VALUES (?, ?, ?, ?, ?, ?)', [user.id, amount, roundDecimal(amount * 0.05), 'roulette', rouletteBetResult.insertId, false]);
                await commit();

                const bet = {
                    id: rouletteBetResult.insertId,
                    user: {
                        id: user.id,
                        username: user.username,
                        xp: user.xp,
                        anon: user.anon
                    },
                    color,
                    amount
                };
                
                // Log user bet with detailed information
                const colorNames = ['gold', 'green', 'red'];
                console.log(`👤 ${user.username} placed new bet of ${amount.toFixed(2)} on ${colorNames[color]} (round ID: ${roulette.round.id})`);
            
                roulette.bets.push(bet);
                io.to('roulette').emit('roulette:bets', [bet]);
    
            }
    
            io.to(user.id).emit('balance', 'set', roundDecimal(user.balance - amount));
            res.json({ success: true });
    
        })
        
    } catch (error) {
        console.error(error);
        res.json({ error: 'INTERNAL_ERROR' });
    }

});

// Debug endpoint to reset the roulette game (temporarily accessible to all users for testing)
router.post('/debug/reset', isAuthed, async (req, res) => {
    try {
        // Temporarily disabled permission check for testing
        // if (!req.user.perms && req.user.role !== 'admin') {
        //     return res.status(403).json({ error: 'UNAUTHORIZED' });
        // }
        
        console.log(`User ${req.user.username} (${req.user.id}) requested roulette reset`);
        
        // End the current round if it exists
        if (roulette.round && roulette.round.id) {
            const now = new Date();
            await sql.query('UPDATE roulette SET endedAt = ? WHERE id = ?', [now, roulette.round.id]);
            
            // Create a new round
            const clientSeedValue = '00000000000000000003e5a54c2898a18d262eb5860e696441f8a4ebbff03697';
            const [result] = await sql.query('INSERT INTO roulette (createdAt, serverSeed, clientSeed, result, color, status) VALUES (?, ?, ?, ?, ?, ?)', [
                now,
                'SERVER_' + Math.random().toString(36).substring(2, 15),
                clientSeedValue,
                Math.floor(Math.random() * 15),
                Math.floor(Math.random() * 3),
                'betting'
            ]);
            
            // Reset the roulette state
            roulette.round = {};
            roulette.bets = [];
            
            // Force update and restart game loop
            await cacheRoulette();
            
            return res.json({ 
                success: true, 
                message: 'Roulette round reset successfully',
                newRoundId: result.insertId
            });
        } else {
            // If no round exists, create a new one and start the game
            const now = new Date();
            const clientSeedValue = '00000000000000000003e5a54c2898a18d262eb5860e696441f8a4ebbff03697';
            const [result] = await sql.query('INSERT INTO roulette (createdAt, serverSeed, clientSeed, result, color, status) VALUES (?, ?, ?, ?, ?, ?)', [
                now,
                'SERVER_' + Math.random().toString(36).substring(2, 15),
                clientSeedValue,
                Math.floor(Math.random() * 15),
                Math.floor(Math.random() * 3),
                'betting'
            ]);
            
            await cacheRoulette();
            return res.json({ success: true, message: 'Roulette refreshed' });
        }
    } catch (error) {
        console.error('Error resetting roulette:', error);
        return res.status(500).json({ error: 'INTERNAL_ERROR' });
    }
});

module.exports = router;