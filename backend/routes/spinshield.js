/**
 * SpinShield API Callback Handler
 * Processes callbacks from SpinShield game server
 */
const express = require('express');
const router = express.Router();
const { sql } = require('../database');
const { Helpers } = require('../utils/spin-shield');

// SpinShield callback handler
router.get('/callback', async (req, res) => {
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
        
        // Get user by username
        const [[user]] = await sql.query('SELECT id, balance FROM users WHERE username = ?', [username]);
        
        if (!user) {
            console.error('User not found:', username);
            return res.json({ error: 2, balance: 0 });
        }
        
        // Convert user balance from dollars to cents
        const balanceInCents = Math.round(user.balance * 100);
        
        // Process different callback actions
        switch (action) {
            case 'balance':
                // Record balance check in transactions
                await sql.query(
                    `INSERT INTO spinshield_transactions 
                     (user_id, game_id, call_id, action, amount, balance_before, balance_after, currency, timestamp, type) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [user.id, game_id, call_id, 'balance', 0, balanceInCents, balanceInCents, currency, timestamp, type || null]
                );
                
                return res.json({ error: 0, balance: balanceInCents });
                
            case 'debit':
                // Check for free spins if type is 'bonus_fs'
                if (type === 'bonus_fs') {
                    // Free spin bet - don't deduct balance
                    await sql.query(
                        `INSERT INTO spinshield_transactions 
                         (user_id, game_id, round_id, call_id, action, amount, balance_before, 
                          balance_after, currency, timestamp, type, gameplay_final, is_freespin) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [user.id, game_id, round_id, call_id, 'debit', amount, balanceInCents, balanceInCents, 
                         currency, timestamp, type, gameplay_final ? 1 : 0, 1]
                    );
                    
                    // If freespins details are provided, update the free spins record
                    if (callbackData.freespins) {
                        await sql.query(
                            `UPDATE spinshield_freespins 
                             SET freespins_performed = ?, updated_at = NOW()
                             WHERE user_id = ? AND game_id = ? AND active = 1 
                             ORDER BY id DESC LIMIT 1`,
                            [callbackData.freespins.performed, user.id, game_id]
                        );
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
                         newBalanceAfterDebit, currency, timestamp, type || null, gameplay_final ? 1 : 0]
                    );
                    
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
                         newBalanceAfterCredit, currency, timestamp, type || null, gameplay_final ? 1 : 0, isFreespin ? 1 : 0]
                    );
                    
                    // If freespins details are provided, update the free spins wallet
                    if (callbackData.freespins && isFreespin) {
                        await creditConnection.query(
                            `UPDATE spinshield_freespins 
                             SET freespins_performed = ?, freespins_wallet = freespins_wallet + ?, updated_at = NOW()
                             WHERE user_id = ? AND game_id = ? AND active = 1 
                             ORDER BY id DESC LIMIT 1`,
                            [callbackData.freespins.performed, amount, user.id, game_id]
                        );
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
