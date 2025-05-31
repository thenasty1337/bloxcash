/**
 * SpinShield Game Routes
 * Allows users to interact with SpinShield casino games
 */
const express = require('express');
const router = express.Router();
const { sql } = require('../database');
const { ApiClient } = require('../utils/spin-shield');
const { isAuthed } = require('./auth/functions');

// Get all available games
router.get('/games', async (req, res) => {
    try {
        const [games] = await sql.query('SELECT * FROM spinshield_games WHERE active = 1 ORDER BY game_name ASC');
        res.json({ success: true, games });
    } catch (error) {
        console.error('Error fetching SpinShield games:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get game categories
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await sql.query(
            'SELECT DISTINCT category, COUNT(*) as count FROM spinshield_games GROUP BY category ORDER BY category'
        );
        
        const [providers] = await sql.query(
            'SELECT DISTINCT provider, COUNT(*) as count FROM spinshield_games GROUP BY provider ORDER BY provider'
        );
        
        res.json({
            success: true,
            categories,
            providers,
        });
    } catch (error) {
        console.error('Error fetching game categories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Launch demo game
router.get('/demo/:gameId', isAuthed, async (req, res) => {
    try {
        const { gameId } = req.params;
        
        // Get API settings
        const [[settings]] = await sql.query(
            'SELECT api_login, api_password, endpoint FROM spinshield_settings WHERE active = 1 LIMIT 1'
        );
        
        if (!settings) {
            return res.status(400).json({ error: 'SpinShield integration is not configured' });
        }
        
        // Check if game exists
        const [[game]] = await sql.query('SELECT * FROM spinshield_games WHERE game_id = ? AND active = 1', [gameId]);
        
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        
        const apiClient = new ApiClient({
            api_login: settings.api_login,
            api_password: settings.api_password,
            endpoint: settings.endpoint
        });
        
        // Site URLs for the game
        const homeUrl = `${process.env.FRONTEND_URL || 'https://NOVACASINO.com'}`;
        const cashierUrl = `${process.env.FRONTEND_URL || 'https://NOVACASINO.com'}/deposit`;
        
        // Get demo game URL
        const response = await apiClient.getGameDemo(
            gameId,
            'USD', // Default currency
            homeUrl,
            cashierUrl,
            'en' // Default language
        );
        
        if (response.error !== 0) {
            return res.status(400).json({ 
                error: 'Failed to launch demo game',
                details: response
            });
        }
        
        // Save demo session
        await sql.query(
            `INSERT INTO spinshield_sessions (
                user_id, game_id, session_id, is_demo, game_url, status, currency
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                gameId,
                response.session_id,
                1, // Is demo
                response.response, // Game URL
                'active',
                'USD'
            ]
        );
        
        res.json({
            success: true,
            game: {
                id: game.id,
                name: game.game_name,
                provider: game.provider,
                gameUrl: response.response
            }
        });
    } catch (error) {
        console.error('Error launching demo game:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Launch real money game
router.get('/play/:gameId', isAuthed, async (req, res) => {
    try {
        const { gameId } = req.params;
        
        // Get API settings
        const [[settings]] = await sql.query(
            'SELECT api_login, api_password, endpoint FROM spinshield_settings WHERE active = 1 LIMIT 1'
        );
        
        if (!settings) {
            return res.status(400).json({ error: 'SpinShield integration is not configured' });
        }
        
        // Check if game exists
        const [[game]] = await sql.query('SELECT * FROM spinshield_games WHERE game_id = ? AND active = 1', [gameId]);
        
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        
        // Check user balance
        const [[user]] = await sql.query('SELECT id, username, balance FROM users WHERE id = ?', [req.user.id]);
        
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        // Generate secure user password for SpinShield
        const userPassword = `user_${user.id}_pass`;
        
        // Use a more reliable format for SpinShield username
        // Format: SS_{userId}_{original username}
        // This way we can always extract userId reliably from the prefix
        const userName = `SS_${user.id}_${user.username}`;
        
        console.log(`Creating SpinShield player: ${userName} (original username: ${user.username}, ID: ${user.id})`);
        
        const apiClient = new ApiClient({
            api_login: settings.api_login,
            api_password: settings.api_password,
            endpoint: settings.endpoint
        });
        
        try {
            // First create/ensure player exists in SpinShield
            const createPlayerResponse = await apiClient.createPlayer(
                userName,
                userPassword,
                user.username,
                'USD'
            );
            
            if (createPlayerResponse.error !== 0 && createPlayerResponse.error !== 1) { // Error 1 means player already exists
                return res.status(400).json({ 
                    error: 'Failed to create player',
                    details: createPlayerResponse
                });
            }
            
            // Site URLs for the game
            const homeUrl = `${process.env.FRONTEND_URL || 'https://NOVACASINO.com'}`;
            const cashierUrl = `${process.env.FRONTEND_URL || 'https://NOVACASINO.com'}/deposit`;
            
            // Get real money game URL
            const response = await apiClient.getGame(
                userName,
                userPassword,
                gameId,
                'USD', // Default currency
                homeUrl,
                cashierUrl,
                0, // Not play for fun (real money)
                'en' // Default language
            );
            
            if (!response || typeof response !== 'object') {
                return res.status(500).json({ 
                    error: 'Invalid response from SpinShield API'
                });
            }
            
            if (response.error !== 0 || !response.response || !response.session_id) {
                return res.status(400).json({ 
                    error: 'Failed to launch game',
                    details: response
                });
            }
            
            // Save session
            await sql.query(
                `INSERT INTO spinshield_sessions (
                    user_id, game_id, session_id, is_demo, game_url, status, currency
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    user.id,
                    gameId,
                    response.session_id,
                    0, // Not demo (real money)
                    response.response, // Game URL
                    'active',
                    'USD'
                ]
            );
            
            res.json({
                success: true,
                game: {
                    id: game.id,
                    name: game.game_name,
                    provider: game.provider,
                    gameUrl: response.response
                }
            });
        } catch (apiError) {
            // Handle API-specific errors
            console.error('SpinShield API Error:', apiError);
            
            // Check if the error has response data from the API
            if (apiError.response && apiError.response.data) {
                return res.status(500).json({ 
                    error: 'SpinShield API error', 
                    details: apiError.response.data
                });
            }
            
            return res.status(500).json({ 
                error: 'Failed to communicate with SpinShield API',
                message: apiError.message || 'Unknown error'
            });
        }
    } catch (error) {
        console.error('Error launching game:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message || 'Unknown error'
        });
    }
});

// Get user's active free spins
router.get('/freespins', isAuthed, async (req, res) => {
    try {
        // Get user's active free spins
        const [freespins] = await sql.query(
            `SELECT f.*, g.game_name, g.image_url
             FROM spinshield_freespins f
             LEFT JOIN spinshield_games g ON f.game_id = g.game_id
             WHERE f.user_id = ? AND f.active = 1 AND f.valid_until > NOW()
             ORDER BY f.created_at DESC`,
            [req.user.id]
        );
        
        res.json({ success: true, freespins });
    } catch (error) {
        console.error('Error fetching user freespins:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's game history
router.get('/history', isAuthed, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const offset = page * limit;
        
        // Get user's game sessions
        const [sessions] = await sql.query(
            `SELECT s.*, g.game_name, g.image_url
             FROM spinshield_sessions s
             LEFT JOIN spinshield_games g ON s.game_id = g.game_id
             WHERE s.user_id = ?
             ORDER BY s.started_at DESC
             LIMIT ? OFFSET ?`,
            [req.user.id, limit, offset]
        );
        
        // Get total count
        const [[count]] = await sql.query(
            'SELECT COUNT(*) as total FROM spinshield_sessions WHERE user_id = ?',
            [req.user.id]
        );
        
        res.json({
            success: true,
            sessions,
            pagination: {
                page,
                limit,
                total: count.total,
                pages: Math.ceil(count.total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching user game history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's transaction history
router.get('/transactions', isAuthed, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const offset = page * limit;
        
        // Get user's transactions
        const [transactions] = await sql.query(
            `SELECT t.*, g.game_name
             FROM spinshield_transactions t
             LEFT JOIN spinshield_games g ON t.game_id = g.game_id
             WHERE t.user_id = ?
             ORDER BY t.created_at DESC
             LIMIT ? OFFSET ?`,
            [req.user.id, limit, offset]
        );
        
        // Get total count
        const [[count]] = await sql.query(
            'SELECT COUNT(*) as total FROM spinshield_transactions WHERE user_id = ?',
            [req.user.id]
        );
        
        res.json({
            success: true,
            transactions,
            pagination: {
                page,
                limit,
                total: count.total,
                pages: Math.ceil(count.total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching user transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
