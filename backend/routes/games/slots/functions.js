const { sql } = require('../../../database');
const { ApiClient } = require('../../../utils/spin-shield');
const slots = {};

async function cacheSlots() {
    // Get games from spinshield_games table instead
    const [all] = await sql.query(`SELECT * FROM spinshield_games WHERE active = 1 ORDER BY id ASC`);
    all.forEach(e => slots[e.game_id_hash] = e);
}

async function createGameSession(userId, gameId, currency = 'USD', isDemo = false) {
    try {
        // Get SpinShield settings
        const [[settings]] = await sql.query(
            'SELECT api_login, api_password, endpoint, callback_url FROM spinshield_settings WHERE active = 1'
        );
        
        if (!settings) {
            throw new Error('SpinShield is not configured');
        }
        
        // Get user details
        const [[user]] = await sql.query('SELECT id, username, balance FROM users WHERE id = ?', [userId]);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // Create API client
        const apiClient = new ApiClient({
            api_login: settings.api_login,
            api_password: settings.api_password,
            endpoint: settings.endpoint
        });
        
        // Generate user password (example method - ensure this matches your authentication approach)
        const userPassword = `user_${userId}_pass`;
        
        // Create or update player in SpinShield
        await apiClient.createPlayer(
            user.username,
            userPassword,
            user.username,
            currency
        );
        
        // Launch game
        const gameResponse = await apiClient.launchGame(
            user.username,
            userPassword,
            gameId,
            currency,
            settings.callback_url,
            isDemo
        );
        
        if (gameResponse.error !== 0) {
            throw new Error(gameResponse.message || 'Error launching game');
        }
        
        // Store session in database
        await sql.query(
            `INSERT INTO spinshield_sessions 
             (user_id, game_id, session_id, currency, play_for_fun, is_demo, game_url, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId, 
                gameId, 
                gameResponse.response.session_id,
                currency,
                false,
                isDemo ? 1 : 0,
                gameResponse.response.game_url,
                'active'
            ]
        );
        
        return {
            success: true,
            session_id: gameResponse.response.session_id,
            game_url: gameResponse.response.game_url
        };
    } catch (error) {
        console.error('Error creating game session:', error);
        throw error;
    }
}

module.exports = {
    slots,
    cacheSlots,
    createGameSession
}