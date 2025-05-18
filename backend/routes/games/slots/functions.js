/**
 * SpinShield Slot Games Service
 * Functions for interacting with SpinShield slot games API
 */
const { sql } = require('../../../database');
const { ApiClient } = require('../../../utils/spin-shield');
const { generateBlurHash } = require('../../../utils/blurhash');
const slots = {};

// Session tracking - just record sessions and their timestamps, no active pinging
const activeSessions = {};

// Setup cleanup interval - remove expired sessions every 5 minutes
const cleanupIntervalId = setInterval(() => {
    const now = Date.now();
    const sessionsToRemove = [];
    
    for (const sessionId in activeSessions) {
        const session = activeSessions[sessionId];
        
        // If session is older than 2 hours (7200000ms), remove it
        if (now - session.createdAt > 7200000) {
            sessionsToRemove.push(sessionId);
            console.log(`Removing expired session ${sessionId}`);
        }
    }
    
    // Remove expired sessions
    sessionsToRemove.forEach(id => delete activeSessions[id]);
}, 300000); // Check every 5 minutes

// Make sure to clean up on process exit
process.on('SIGINT', () => {
    clearInterval(cleanupIntervalId);
    process.exit(0);
});

async function cacheSlots() {
    try {
        // Get games from spinshield_games table 
        const [all] = await sql.query(`SELECT * FROM spinshield_games WHERE active = 1 ORDER BY id ASC`);
        
        // First store all the data we already have
        all.forEach(e => slots[e.game_id_hash] = e);
        
        // Check if we have blurhash column in the table
        let hasBlurHashColumn = false;
        try {
            const [columnsInfo] = await sql.query(`SHOW COLUMNS FROM spinshield_games LIKE 'image_blurhash'`);
            hasBlurHashColumn = columnsInfo.length > 0;
        } catch (e) {
            console.log('BlurHash column check failed, will use in-memory storage instead:', e.message);
        }
        
        // Generate missing BlurHash values for images
        for (const game of all) {
            if (!game.image_blurhash) {
                try {
                    // Determine which image to use for BlurHash - using the same priority as the frontend
                    const imageUrl = ['readyplay', 'wizard', 'retrogaming', 'caleta'].includes(game.provider?.toLowerCase())
                        ? (game.image_url || game.image_square || '/public/slots/default.png')
                        : (game.image_long || game.image_url || game.image_square || '/public/slots/default.png');
                    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.SERVER_URL || 'http://localhost:3000'}${imageUrl}`;
                    
                    // Generate BlurHash
                    const blurhash = await generateBlurHash(fullImageUrl);
                    
                    // Store in memory
                    slots[game.game_id_hash].image_blurhash = blurhash;
                    
                    // If database has the column, update it
                    if (hasBlurHashColumn) {
                        await sql.query(`UPDATE spinshield_games SET image_blurhash = ? WHERE game_id_hash = ?`, 
                            [blurhash, game.game_id_hash]);
                        console.log(`Updated BlurHash for game ${game.game_id_hash}`);
                    }
                } catch (err) {
                    console.error(`Failed to generate BlurHash for slot ${game.game_id_hash}:`, err);
                }
            }
        }
        
        console.log(`Cached ${all.length} slot games, processed BlurHash values`);
    } catch (error) {
        console.error('Error caching slots:', error);
    }
}

async function createGameSession(userId, gameIdHash, currency = 'USD', isDemo = false) {
    try {
        // Get SpinShield settings
        const [[settings]] = await sql.query(
            'SELECT api_login, api_password, endpoint, callback_url FROM spinshield_settings WHERE active = 1'
        );
        
        // Development fallback settings if none exist in the database
        const useSettings = settings || {
            api_login: process.env.SPINSHIELD_API_LOGIN || 'demo_login',
            api_password: process.env.SPINSHIELD_API_PASSWORD || 'demo_password',
            endpoint: process.env.SPINSHIELD_ENDPOINT || 'https://api.spinshield.com/v1/api.php',
            callback_url: process.env.SPINSHIELD_CALLBACK_URL || 'http://localhost:3000/spinshield/callback'
        };
        
        if (!useSettings) {
            throw new Error('SpinShield is not configured');
        }
        
        console.log('Using settings:', {
            api_login: useSettings.api_login,
            endpoint: useSettings.endpoint,
            callback_url: useSettings.callback_url
        });
        
        // Get user details
        const [[user]] = await sql.query('SELECT id, username, balance FROM users WHERE id = ?', [userId]);
        
        if (!user) {
            throw new Error('User not found');
        }
        
        // Get additional game details from the slots cache if needed
        const gameInfo = slots[gameIdHash];
        if (!gameInfo) {
            throw new Error(`Game with ID hash "${gameIdHash}" not found in database`);
        }
        
        // Create API client
        const apiClient = new ApiClient({
            api_login: useSettings.api_login,
            api_password: useSettings.api_password,
            endpoint: useSettings.endpoint
        });
        
        // Generate user password (example method - ensure this matches your authentication approach)
        const userPassword = `user_${userId}_pass`;
        
        // Use a more reliable format for SpinShield username
        // Format: SS_{userId}_{original username}
        // This way we can always extract userId reliably from the prefix
        const userName = `SS_${userId}_${user.username}`;
        
        console.log(`Creating SpinShield player: ${userName} (original username: ${user.username}, ID: ${userId})`);
        
        // Create or update player in SpinShield
        const createPlayerResponse = await apiClient.createPlayer(
            userName,
            userPassword,
            user.username,
            currency
        );
        
        // Check if player creation was successful
        if (createPlayerResponse.error !== 0 && createPlayerResponse.error !== 1) {
            // Error 1 means player already exists, which is fine
            console.error('SpinShield API Error:', createPlayerResponse);
            throw new Error(createPlayerResponse.message || `Error creating player (code: ${createPlayerResponse.error})`);
        }
        
        // Launch game - Use getGame instead of launchGame
        console.log('Attempting to launch game:', {
            username: userName,
            gameIdHash: gameIdHash,
            currency: currency,
            isDemo: isDemo,
            callbackUrl: useSettings.callback_url
        });
        
        try {
            // Try to launch game with specified mode (real or demo)
            let gameResponse;
            
            if (isDemo) {
                // Launch demo game directly
                gameResponse = await apiClient.getGameDemo(
                    gameIdHash, // Use the game ID hash (string)
                    currency,
                    useSettings.callback_url, // homeurl
                    useSettings.callback_url, // cashierurl
                    'en' // language
                );
            } else {
                // Launch real money game
                gameResponse = await apiClient.getGame(
                    userName,
                    userPassword,
                    gameIdHash, // Use the game ID hash (string) 
                    currency,
                    useSettings.callback_url, // homeurl
                    useSettings.callback_url, // cashierurl
                    0, // play_for_fun = 0 (real money)
                    'en' // language
                );
            }
            
            console.log('API Response:', JSON.stringify(gameResponse, null, 2));
            
            // Check if the response is valid and has the expected properties
            if (!gameResponse || typeof gameResponse !== 'object') {
                throw new Error('Invalid response from SpinShield API');
            }
            
            // Check for error in the response
            if (gameResponse.error !== 0 || !gameResponse.response) {
                console.error('SpinShield API Error:', gameResponse);
                throw new Error(gameResponse.message || `Error launching game (code: ${gameResponse.error || 'unknown'})`);
            }
            
            // Generate a local session ID if the API doesn't provide one
            const sessionId = gameResponse.session_id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Store session in database
            await sql.query(
                `INSERT INTO spinshield_sessions 
                 (user_id, game_id, session_id, currency, play_for_fun, is_demo, game_url, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId, 
                    gameInfo.game_id, // Use the numeric game_id from the gameInfo object
                    sessionId,
                    currency,
                    isDemo, // play_for_fun matches isDemo
                    isDemo ? 1 : 0,
                    gameResponse.response,
                    'active'
                ]
            );
            
            // Store session info for tracking
            activeSessions[sessionId] = {
                userId,
                gameId: gameInfo.game_id,
                gameIdHash: gameIdHash,
                username: userName,
                createdAt: Date.now(),
                isDemo: isDemo
            };
            
            return {
                success: true,
                session_id: sessionId,
                game_url: gameResponse.response,
                is_demo: isDemo
            };
        } catch (gameError) {
            // If real money game failed, try to fallback to demo mode
            if (!isDemo) {
                try {
                    console.log('Real money game failed, attempting to load demo version instead');
                    
                    // Try to get demo game URL as fallback
                    const demoResponse = await apiClient.getGameDemo(
                        gameIdHash, // Use the game ID hash (string)
                        currency,
                        useSettings.callback_url, // homeurl 
                        useSettings.callback_url, // cashierurl
                        'en' // language
                    );
                    
                    console.log('Demo API Response:', JSON.stringify(demoResponse, null, 2));
                    
                    if (!demoResponse || typeof demoResponse !== 'object') {
                        throw new Error('Invalid response from SpinShield API (demo mode)');
                    }
                    
                    if (demoResponse.error !== 0 || !demoResponse.response) {
                        console.error('SpinShield API Error (demo mode):', demoResponse);
                        throw new Error(demoResponse.message || `Error launching demo game (code: ${demoResponse.error || 'unknown'})`); 
                    }
                    
                    // Generate a local session ID if the API doesn't provide one
                    const demoSessionId = demoResponse.session_id || `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    
                    // Store demo session in database
                    await sql.query(
                        `INSERT INTO spinshield_sessions 
                         (user_id, game_id, session_id, currency, play_for_fun, is_demo, game_url, status)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            userId, 
                            gameInfo.game_id, // Use the numeric game_id from the gameInfo object
                            demoSessionId,
                            currency,
                            true, // play for fun
                            1, // Is demo
                            demoResponse.response,
                            'active'
                        ]
                    );
                    
                    // Store session info for tracking
                    activeSessions[demoSessionId] = {
                        userId,
                        gameId: gameInfo.game_id,
                        gameIdHash: gameIdHash,
                        username: userName,
                        createdAt: Date.now(),
                        isDemo: true
                    };
                    
                    return {
                        success: true,
                        session_id: demoSessionId,
                        game_url: demoResponse.response,
                        is_demo: true,
                        fallback_message: "Using demo mode due to error with real money game."
                    };
                } catch (demoError) {
                    console.error('Failed to get demo game from SpinShield:', demoError);
                    // Continue to throw the original error below
                }
            }
            
            // Handle special case where the API returns a JSON error message
            if (gameError.response && gameError.response.data) {
                console.error('SpinShield API Error in getGame:', gameError.response.data);
                throw new Error(gameError.response.data.message || 'Error launching game');
            }
            
            // Otherwise, log and rethrow the error
            console.error('Failed to get game from SpinShield:', gameError);
            throw gameError;
        }
    } catch (error) {
        console.error('Error creating game session:', error);
        throw error;
    }
}

module.exports = {
    slots,
    cacheSlots,
    createGameSession,
    activeSessions
}