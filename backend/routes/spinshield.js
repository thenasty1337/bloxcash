/**
 * SpinShield API Callback Handler
 * Processes callbacks from SpinShield game server
 */
const express = require('express');
const router = express.Router();
const { sql } = require('../database');
const { Helpers } = require('../utils/spin-shield');
const { newBets } = require('../socketio/bets');

// Import the active sessions object from slots functions
const slotsFunctions = require('./games/slots/functions');
const activeSessions = slotsFunctions.activeSessions || {}; // Use empty object as fallback if not defined

// Helper function to get debit amount for a round
async function getDebitAmountForRound(roundId, userId, connection) {
    try {
        const [[debitTransaction]] = await connection.query(
            'SELECT amount FROM spinshield_transactions WHERE round_id = ? AND user_id = ? AND action = "debit" ORDER BY id DESC LIMIT 1',
            [roundId, userId]
        );
        return debitTransaction ? (debitTransaction.amount / 100) : 0; // Convert cents to dollars
    } catch (error) {
        console.error('Error getting debit amount:', error);
        return 0;
        }
}



// SpinShield callback handler
router.get('/', async (req, res) => {
    try {
        const callbackData = req.query;
        console.log('SpinShield Callback:', callbackData);
        
        // Get settings with salt key
        const [[settings]] = await sql.query('SELECT salt_key FROM spinshield_settings WHERE active = 1 LIMIT 1');
        
        if (!settings) {
            console.error('SpinShield settings not found');
            return res.json({ error: 2, balance: 0 });
        }
        
        // Create helpers instance
        const helpers = new Helpers();
        
        // Validate callback signature
        if (!helpers.isValidKey(callbackData.key, callbackData.timestamp, settings.salt_key)) {
            console.error('Invalid SpinShield callback signature');
            return res.json({ error: 2, balance: 0 });
        }
        
        // Extract callback data
        const { username, action, currency, amount, round_id, game_id, call_id, timestamp, type, gameplay_final } = callbackData;
        
        // Convert SpinShield timestamp hash to current timestamp
        const currentTimestamp = Math.floor(Date.now() / 1000).toString();
        
        console.log('Processing callback for username:', username);
        
        // Extract user ID from the SpinShield username format
        // Format: SS_{userId}
        let userId = null;
        let baseUsername = username;
        
        // Check if username is in our specific format
        if (username.startsWith('SS_')) {
            // Extract the ID portion (after SS_)
            const parts = username.split('_');
            if (parts.length >= 2) {
                userId = parts[1];
                console.log('Extracted user ID:', userId, 'From username:', username);
            }
        }
        
        // Try to find the user by ID
        let user;
        
        if (userId) {
            // Find by exact ID
            [[user]] = await sql.query('SELECT id, username, xp, role, avatar, balance FROM users WHERE id = ?', [userId]);
        }
        
        if (!user) {
            console.error('User not found for username:', username, 'Extracted User ID:', userId);
            return res.json({ error: 2, balance: 0 });
        }
        
        // Find session ID for this user/game combination if it exists
        let sessionId = null;
        if (action === 'balance') {
            try {
                const [[session]] = await sql.query(
                    'SELECT session_id FROM spinshield_sessions WHERE user_id = ? AND game_id = ? AND status = "active" ORDER BY id DESC LIMIT 1',
                    [user.id, game_id]
                );
                
                if (session) {
                    sessionId = session.session_id;
                    // Update last_activity timestamp for the session
                    await sql.query(
                        'UPDATE spinshield_sessions SET last_activity = NOW() WHERE session_id = ?',
                        [sessionId]
                    );
                    
                    // Just update the timestamp in our activeSessions object if it exists
                    if (activeSessions[sessionId]) {
                        activeSessions[sessionId].createdAt = Date.now();
                        console.log(`Updated last activity for session ${sessionId}`);
                    }
                }
            } catch (error) {
                console.error('Error updating session activity:', error);
            }
        }
        
        // Convert user balance from dollars to cents
        const balanceInCents = Math.round(user.balance * 100);
        
        // Process different callback actions
        switch (action) {
            case 'balance':
                // Try to get the game ID from the session if not provided
                let gameIdToUse = game_id;
                
                if (!gameIdToUse && sessionId) {
                    try {
                        // Look up game_id from the session
                        const [[sessionData]] = await sql.query(
                            'SELECT game_id FROM spinshield_sessions WHERE session_id = ?',
                            [sessionId]
                        );
                        
                        if (sessionData && sessionData.game_id) {
                            gameIdToUse = sessionData.game_id;
                            console.log(`Using game_id ${gameIdToUse} from session ${sessionId}`);
                        }
                    } catch (err) {
                        console.error('Error retrieving game_id from session:', err);
                    }
                }
                
                // If still no game_id, try to find the most recent active session for this user
                if (!gameIdToUse) {
                    try {
                        const [[lastSession]] = await sql.query(
                            'SELECT game_id FROM spinshield_sessions WHERE user_id = ? AND status = "active" ORDER BY id DESC LIMIT 1',
                            [user.id]
                        );
                        
                        if (lastSession && lastSession.game_id) {
                            gameIdToUse = lastSession.game_id;
                            console.log(`Using game_id ${gameIdToUse} from most recent session for user ${user.id}`);
                        } else {
                            // Use a placeholder value if no game can be found
                            gameIdToUse = 0; // Default placeholder
                            console.log(`Using placeholder game_id ${gameIdToUse} for user ${user.id}`);
                        }
                    } catch (err) {
                        console.error('Error retrieving recent session:', err);
                        gameIdToUse = 0; // Default placeholder
                    }
                }
                
                // Record balance check in transactions
                await sql.query(
                    `INSERT INTO spinshield_transactions 
                     (user_id, game_id, call_id, action, amount, balance_before, balance_after, currency, timestamp, type) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [user.id, gameIdToUse, call_id, 'balance', 0, balanceInCents, balanceInCents, currency, currentTimestamp, type || null]
                );
                
                return res.json({ error: 0, balance: balanceInCents });
                
            case 'debit':
                // Make sure we have a valid game_id, use the one from balance action if needed
                const debitGameId = game_id || gameIdToUse || 0;
                
                // Check for free spins if type is 'bonus_fs'
                if (type === 'bonus_fs') {
                    // Free spin bet - don't deduct balance
                    await sql.query(
                        `INSERT INTO spinshield_transactions 
                         (user_id, game_id, round_id, call_id, action, amount, balance_before, 
                          balance_after, currency, timestamp, type, gameplay_final, is_freespin) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [user.id, debitGameId, round_id, call_id, 'debit', amount, balanceInCents, balanceInCents, 
                         currency, currentTimestamp, type, gameplay_final ? 1 : 0, 1]
                    );
                    
                    // If freespins details are provided, update the free spins record
                    if (callbackData.freespins) {
                        const performed = parseInt(callbackData.freespins.performed);
                        const total = parseInt(callbackData.freespins.total);
                        const isCompleted = performed >= total;
                        
                        console.log(`Updating free spins: performed=${performed}, total=${total}, completed=${isCompleted}, userId=${user.id}, gameId=${debitGameId}`);
                        
                        // Debug: Check what free spins records exist for this user
                        const [debugRecords] = await sql.query(
                            'SELECT id, game_id, freespins_count, freespins_performed, active FROM spinshield_freespins WHERE user_id = ? AND active = 1',
                            [user.id]
                        );
                        console.log('Debug - Active free spins for user:', debugRecords);
                        
                        const updateResult = await sql.query(
                            `UPDATE spinshield_freespins 
                             SET freespins_performed = ?, freespins_bet = freespins_bet + ?, active = ?, updated_at = NOW()
                             WHERE user_id = ? AND game_id = ? AND active = 1 
                             ORDER BY id DESC LIMIT 1`,
                            [performed, amount, isCompleted ? 0 : 1, user.id, debitGameId]
                        );
                        
                        console.log(`Free spins update result: affected rows = ${updateResult.affectedRows}`);
                    }
                    
                    return res.json({ error: 0, balance: balanceInCents });
                }
                
                // Regular bet - check if user has enough balance
                if (balanceInCents < amount) {
                    console.error('Insufficient balance:', username, balanceInCents, amount);
                    return res.json({ error: 1, balance: balanceInCents });
                }
                
                // Deduct balance
                const newBalanceAfterDebit = balanceInCents - amount;
                
                // Begin transaction
                const debitConnection = await sql.getConnection();
                await debitConnection.beginTransaction();
                
                try {
                    // Update user balance
                    await debitConnection.query(
                        'UPDATE users SET balance = ? WHERE id = ?',
                        [newBalanceAfterDebit / 100, user.id]
                    );
                    
                    // Record transaction
                    await debitConnection.query(
                        `INSERT INTO spinshield_transactions 
                         (user_id, game_id, round_id, call_id, action, amount, balance_before, 
                          balance_after, currency, timestamp, type, gameplay_final) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [user.id, game_id, round_id, call_id, 'debit', amount, balanceInCents, 
                         newBalanceAfterDebit, currency, currentTimestamp, type || null, gameplay_final ? 1 : 0]
                    );
                    
                                        // If this is the final gameplay and a loss (no credit coming), create a bet entry
                    if (gameplay_final === '1') {
                        const betAmount = amount / 100; // Convert cents to dollars
                        const winAmount = 0; // Loss
                        const edge = Math.round(betAmount * 0.05 * 100) / 100; // 5% house edge
                        
                        await debitConnection.query(
                            `INSERT INTO bets (userId, amount, winnings, edge, game, gameId, spinshield_round_id, spinshield_game_id, provider, completed, createdAt) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                            [
                                user.id,
                                betAmount,
                                winAmount,
                                edge,
                                'slot',
                                null, // gameId is null for SpinShield bets (we use spinshield_round_id)
                                round_id, // Store actual SpinShield round ID
                                game_id, // Store actual SpinShield game ID
                                'spinshield', // Provider
                                1
                            ]
                        );
                        
                        console.log('✅ Created bet entry for SpinShield round (loss):', round_id, { betAmount, winAmount, edge });
                        
                        // Emit to live feed via newBets (after commit)
                        setTimeout(async () => {
                            // Fetch game details for rich display
                            const [[gameDetails]] = await sql.query(
                                'SELECT game_name, image_url, provider_name FROM spinshield_games WHERE game_id_hash = ?',
                                [game_id]
                            );
                            
                            const betData = {
                                user: user,
                                amount: betAmount,
                                payout: winAmount,
                                edge: edge,
                                game: 'slot'
                            };
                            
                            // Add game details if found
                            if (gameDetails) {
                                betData.gameDetails = {
                                    name: gameDetails.game_name,
                                    image: gameDetails.image_url,
                                    provider: gameDetails.provider_name || 'SpinShield',
                                    gameId: game_id
                                };
                            }
                            
                            newBets([betData]);
                        }, 100); // Small delay to ensure transaction is committed
                    }
                    
                    // Commit transaction
                    await debitConnection.commit();
                    
                    return res.json({ error: 0, balance: newBalanceAfterDebit });
                } catch (error) {
                    // Rollback transaction on error
                    await debitConnection.rollback();
                    console.error('Error processing debit:', error);
                    return res.json({ error: 2, balance: balanceInCents });
                } finally {
                    // Release connection
                    debitConnection.release();
                }
                
            case 'credit':
                // Begin transaction
                const creditConnection = await sql.getConnection();
                await creditConnection.beginTransaction();
                
                try {
                    // Credit user balance
                    const newBalanceAfterCredit = balanceInCents + parseInt(amount, 10);
                    
                    // Update user balance
                    await creditConnection.query(
                        'UPDATE users SET balance = ? WHERE id = ?',
                        [newBalanceAfterCredit / 100, user.id]
                    );
                    
                    // Check if this is a free spins win
                    const isFreespin = type === 'bonus_fs';
                    
                    // Record transaction
                    await creditConnection.query(
                        `INSERT INTO spinshield_transactions 
                         (user_id, game_id, round_id, call_id, action, amount, balance_before, 
                          balance_after, currency, timestamp, type, gameplay_final, is_freespin) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [user.id, game_id, round_id, call_id, 'credit', amount, balanceInCents, 
                         newBalanceAfterCredit, currency, currentTimestamp, type || null, gameplay_final ? 1 : 0, isFreespin ? 1 : 0]
                    );
                    
                    // If freespins details are provided, update the free spins wallet
                    if (callbackData.freespins && isFreespin) {
                        const performed = parseInt(callbackData.freespins.performed);
                        const total = parseInt(callbackData.freespins.total);
                        const isCompleted = performed >= total;
                        
                        console.log(`Updating free spins (credit): performed=${performed}, total=${total}, completed=${isCompleted}, winAmount=${amount}, userId=${user.id}, gameId=${game_id}`);
                        
                        // Debug: Check what free spins records exist for this user
                        const [debugRecords] = await creditConnection.query(
                            'SELECT id, game_id, freespins_count, freespins_performed, active FROM spinshield_freespins WHERE user_id = ? AND active = 1',
                            [user.id]
                        );
                        console.log('Debug - Active free spins for user (credit):', debugRecords);
                        
                        // Update free spins (game_id from callback should now match stored game_id_hash)
                        const updateResult = await creditConnection.query(
                            `UPDATE spinshield_freespins 
                             SET freespins_performed = ?, freespins_wallet = freespins_wallet + ?, active = ?, updated_at = NOW()
                             WHERE user_id = ? AND game_id = ? AND active = 1 
                             ORDER BY id DESC LIMIT 1`,
                            [performed, amount, isCompleted ? 0 : 1, user.id, game_id]
                        );
                        
                        console.log(`Free spins update result (credit): affected rows = ${updateResult.affectedRows}`);
                    }
                    
                    // If this is the final gameplay (round complete), create a bet entry
                    if (gameplay_final === '1') {
                        const betAmount = await getDebitAmountForRound(round_id, user.id, creditConnection);
                        const winAmount = parseInt(amount, 10) / 100; // Convert cents to dollars
                        const edge = Math.round(betAmount * 0.05 * 100) / 100; // 5% house edge
                        
                        await creditConnection.query(
                            `INSERT INTO bets (userId, amount, winnings, edge, game, gameId, spinshield_round_id, spinshield_game_id, provider, completed, createdAt) 
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                            [
                                user.id,
                                betAmount,
                                winAmount,
                                edge,
                                'slot',
                                null, // gameId is null for SpinShield bets (we use spinshield_round_id)
                                round_id, // Store actual SpinShield round ID
                                game_id, // Store actual SpinShield game ID
                                'spinshield', // Provider
                                1
                            ]
                        );
                        
                        console.log('✅ Created bet entry for SpinShield round:', round_id, { betAmount, winAmount, edge });
                        
                        // Emit to live feed via newBets (after commit)
                        setTimeout(async () => {
                            // Fetch game details for rich display
                            const [[gameDetails]] = await sql.query(
                                'SELECT game_name, image_url, provider_name FROM spinshield_games WHERE game_id_hash = ?',
                                [game_id]
                            );
                            
                            const betData = {
                                user: user,
                                amount: betAmount,
                                payout: winAmount,
                                edge: edge,
                                game: 'slot'
                            };
                            
                            // Add game details if found
                            if (gameDetails) {
                                betData.gameDetails = {
                                    name: gameDetails.game_name,
                                    image: gameDetails.image_url,
                                    provider: gameDetails.provider_name || 'SpinShield',
                                    gameId: game_id
                                };
                            }
                            
                            newBets([betData]);
                        }, 100); // Small delay to ensure transaction is committed
                    }
                    
                    // Commit transaction
                    await creditConnection.commit();
                    
                    return res.json({ error: 0, balance: newBalanceAfterCredit });
                } catch (error) {
                    // Rollback transaction on error
                    await creditConnection.rollback();
                    console.error('Error processing credit:', error);
                    return res.json({ error: 2, balance: balanceInCents });
                } finally {
                    // Release connection
                    creditConnection.release();
                }
                
            default:
                console.error('Unknown action:', action);
                return res.json({ error: 2, balance: balanceInCents });
        }
    } catch (error) {
        console.error('SpinShield callback error:', error);
        return res.json({ error: 2, balance: 0 });
    }
});

module.exports = router;
