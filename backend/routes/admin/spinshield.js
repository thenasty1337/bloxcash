const express = require('express');
const router = express.Router();
const { sql } = require('../../database');
const { ApiClient } = require('../../utils/spin-shield');
const { sendLog } = require('../../utils');

// Get SpinShield settings
router.get('/settings', async (req, res) => {
    try {
        const [settings] = await sql.query('SELECT id, api_login, endpoint, callback_url, salt_key, active, created_at, updated_at FROM spinshield_settings ORDER BY id DESC LIMIT 1');
        
        // Don't return api_password for security
        return res.json({ settings: settings[0] || {} });
    } catch (error) {
        console.error('Error fetching SpinShield settings:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Save or update SpinShield settings
router.post('/settings', async (req, res) => {
    try {
        const { api_login, api_password, endpoint, callback_url, salt_key, active } = req.body;
        
        // Validate required fields
        if (!api_login || !api_password || !endpoint || !callback_url || !salt_key) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Check if settings already exist
        const [existingSettings] = await sql.query('SELECT id FROM spinshield_settings LIMIT 1');
        
        if (existingSettings.length > 0) {
            // Update existing settings
            await sql.query(
                'UPDATE spinshield_settings SET api_login = ?, api_password = ?, endpoint = ?, callback_url = ?, salt_key = ?, active = ?',
                [api_login, api_password, endpoint, callback_url, salt_key, active]
            );
            
            sendLog('admin', `[${req.user.id}] ${req.user.username} updated SpinShield settings.`);
            return res.json({ success: true, message: 'SpinShield settings updated successfully' });
        } else {
            // Create new settings
            await sql.query(
                'INSERT INTO spinshield_settings (api_login, api_password, endpoint, callback_url, salt_key, active) VALUES (?, ?, ?, ?, ?, ?)',
                [api_login, api_password, endpoint, callback_url, salt_key, active]
            );
            
            sendLog('admin', `[${req.user.id}] ${req.user.username} created SpinShield settings.`);
            return res.json({ success: true, message: 'SpinShield settings created successfully' });
        }
    } catch (error) {
        console.error('Error saving SpinShield settings:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Toggle SpinShield active status
router.post('/toggle', async (req, res) => {
    try {
        const { active } = req.body;
        
        await sql.query('UPDATE spinshield_settings SET active = ?', [active]);
        
        const status = active ? 'enabled' : 'disabled';
        sendLog('admin', `[${req.user.id}] ${req.user.username} ${status} SpinShield integration.`);
        return res.json({ success: true, active });
    } catch (error) {
        console.error('Error toggling SpinShield status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Get game list from SpinShield API and update local database
router.post('/sync-games', async (req, res) => {
    try {
        // Get API credentials
        const [settings] = await sql.query('SELECT api_login, api_password, endpoint FROM spinshield_settings LIMIT 1');
        
        if (!settings.length) {
            return res.status(400).json({ error: 'SpinShield settings not configured' });
        }
        
        const config = {
            api_login: settings[0].api_login,
            api_password: settings[0].api_password,
            endpoint: settings[0].endpoint
        };
        
        // Create SpinShield API client
        const apiClient = new ApiClient(config);
        
        // Get game list from API
        const gameListResponse = await apiClient.getGameList('USD', 1);
        console.log(gameListResponse)
        
        if (gameListResponse.error !== 0) {
            return res.status(400).json({ error: 'Failed to fetch games from SpinShield' });
        }
        
        // Convert object-based response to array (if needed)
        const games = Array.isArray(gameListResponse.response) 
            ? gameListResponse.response 
            : Object.values(gameListResponse.response);
        
        // Start a transaction
        const connection = await sql.getConnection();
        await connection.beginTransaction();
        
        try {
            // Clear existing games
            await connection.query('DELETE FROM spinshield_games');
            
            // Prepare batch insert values
            const insertValues = [];
            
            // Process each game
            for (const game of games) {
                // Default RTP value (you might want to update this with actual values later)
                const rtp = game.rtp || 0;
                
                insertValues.push([
                    game.id,
                    game.id_hash,
                    game.name,
                    game.category || game.provider,
                    game.provider_name || game.category,
                    game.type,
                    game.category,
                    game.subcategory || null,
                    game.new || false,
                    game.mobile || false,
                    game.freerounds_supported || false,
                    game.featurebuy_supported || false,
                    game.has_jackpot || false,
                    game.play_for_fun_supported || true,
                    game.image || null,
                    game.image_square || game.image || null,
                    game.image_portrait || game.image || null,
                    game.image_long || game.image || null,
                    game.source || null,
                    game.system || null,
                    game.ts || null,
                    rtp,
                    true, // active
                    game.created_at || null
                ]);
            }
            
            // Batch insert all games
            if (insertValues.length > 0) {
                await connection.query(
                    `INSERT INTO spinshield_games (
                        game_id, game_id_hash, game_name, provider, provider_name, 
                        \`type\`, category, subcategory, is_new, is_mobile, 
                        freerounds_supported, featurebuy_supported, has_jackpot,
                        play_for_fun_supported, image_url, image_square, 
                        image_portrait, image_long, source, \`system\`, \`timestamp\`,
                        rtp, active, external_created_at
                    ) VALUES ?`,
                    [insertValues]
                );
            }
            
            await connection.commit();
            sendLog('admin', `[${req.user.id}] ${req.user.username} synced ${games.length} games from SpinShield.`);
            return res.json({ 
                success: true, 
                message: `Successfully synced ${games.length} games from SpinShield` 
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error syncing SpinShield games:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get a single game by ID
router.get('/games/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [game] = await sql.query('SELECT * FROM spinshield_games WHERE id = ?', [id]);
        
        if (!game.length) {
            return res.status(404).json({ error: 'Game not found' });
        }
        
        return res.json({ game: game[0] });
    } catch (error) {
        console.error('Error fetching SpinShield game:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Update a game
router.put('/games/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            game_name, provider, provider_name, type, category, subcategory,
            is_new, is_mobile, freerounds_supported, featurebuy_supported, 
            has_jackpot, play_for_fun_supported, image_url, image_square, 
            image_portrait, image_long, source, system, rtp, active 
        } = req.body;
        
        // Validate that game exists
        const [existingGame] = await sql.query('SELECT id FROM spinshield_games WHERE id = ?', [id]);
        
        if (!existingGame.length) {
            return res.status(404).json({ error: 'Game not found' });
        }
        
        // Update game in database
        await sql.query(
            `UPDATE spinshield_games SET 
                game_name = ?, 
                provider = ?, 
                provider_name = ?, 
                type = ?, 
                category = ?, 
                subcategory = ?, 
                is_new = ?, 
                is_mobile = ?, 
                freerounds_supported = ?, 
                featurebuy_supported = ?, 
                has_jackpot = ?, 
                play_for_fun_supported = ?, 
                image_url = ?, 
                image_square = ?, 
                image_portrait = ?, 
                image_long = ?, 
                source = ?, 
                \`system\` = ?, 
                rtp = ?, 
                active = ?, 
                updated_at = NOW() 
            WHERE id = ?`,
            [
                game_name, 
                provider, 
                provider_name, 
                type, 
                category, 
                subcategory, 
                is_new ? 1 : 0, 
                is_mobile ? 1 : 0, 
                freerounds_supported ? 1 : 0, 
                featurebuy_supported ? 1 : 0, 
                has_jackpot ? 1 : 0, 
                play_for_fun_supported ? 1 : 0, 
                image_url, 
                image_square, 
                image_portrait, 
                image_long, 
                source, 
                system, 
                rtp, 
                active ? 1 : 0,
                id
            ]
        );
        
        sendLog('admin', `[${req.user.id}] ${req.user.username} updated SpinShield game: ${game_name}`);
        
        return res.json({ 
            success: true, 
            message: 'Game updated successfully' 
        });
    } catch (error) {
        console.error('Error updating SpinShield game:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get games list from database with filtering, sorting, and pagination
router.get('/games', async (req, res) => {
    try {
        const { 
            page = 0, 
            limit = 20, 
            sort = 'game_name', 
            order = 'asc',
            search = '',
            provider = '',
            category = '',
            features = ''
        } = req.query;
        
        const offset = parseInt(page) * parseInt(limit);
        const parsedLimit = parseInt(limit);
        
        // Build base query
        let query = `
            SELECT * 
            FROM spinshield_games 
            WHERE 1=1
        `;
        
        const queryParams = [];
        
        // Add search condition if provided
        if (search) {
            query += ` AND game_name LIKE ? `;
            queryParams.push(`%${search}%`);
        }
        
        // Add provider filter if provided
        if (provider) {
            query += ` AND provider = ? `;
            queryParams.push(provider);
        }
        
        // Add category filter if provided
        if (category) {
            query += ` AND category = ? `;
            queryParams.push(category);
        }
        
        // Add features filter if provided
        if (features) {
            const featureFilters = features.split(',');
            for (const feature of featureFilters) {
                switch(feature) {
                    case 'mobile':
                        query += ` AND is_mobile = 1 `;
                        break;
                    case 'freerounds':
                        query += ` AND freerounds_supported = 1 `;
                        break;
                    case 'featurebuy':
                        query += ` AND featurebuy_supported = 1 `;
                        break;
                    case 'jackpot':
                        query += ` AND has_jackpot = 1 `;
                        break;
                }
            }
        }
        
        // Add sorting
        const validSortFields = ['game_name', 'provider', 'category', 'rtp', 'created_at'];
        const validSortOrders = ['asc', 'desc'];
        
        const sortField = validSortFields.includes(sort) ? sort : 'game_name';
        const sortOrder = validSortOrders.includes(order.toLowerCase()) ? order.toLowerCase() : 'asc';
        
        query += ` ORDER BY ${sortField} ${sortOrder}`;
        
        // Count total records for pagination
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await sql.query(countQuery, queryParams);
        const totalGames = countResult[0].total;
        
        // Add pagination
        query += ` LIMIT ? OFFSET ?`;
        queryParams.push(parsedLimit, offset);
        
        // Execute final query
        const [games] = await sql.query(query, queryParams);
        
        // Get unique providers and categories for filters
        const [providers] = await sql.query('SELECT DISTINCT provider FROM spinshield_games ORDER BY provider');
        const [categories] = await sql.query('SELECT DISTINCT category FROM spinshield_games ORDER BY category');
        
        return res.json({ 
            games,
            pagination: {
                total: totalGames,
                page: parseInt(page),
                limit: parsedLimit,
                pages: Math.ceil(totalGames / parsedLimit)
            },
            filters: {
                providers: providers.map(p => p.provider),
                categories: categories.map(c => c.category)
            }
        });
    } catch (error) {
        console.error('Error fetching SpinShield games:', error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get game sessions
router.get('/sessions', async (req, res) => {
    try {
        const { page = 0, limit = 20, userId = null } = req.query;
        const offset = page * limit;
        
        let query = `
            SELECT s.*, u.username, g.game_name
            FROM spinshield_sessions s
            LEFT JOIN users u ON s.user_id = u.id
            LEFT JOIN spinshield_games g ON s.game_id = g.game_id
        `;
        
        const queryParams = [];
        
        if (userId) {
            query += ' WHERE s.user_id = ?';
            queryParams.push(userId);
        }
        
        query += ' ORDER BY s.started_at DESC LIMIT ? OFFSET ?';
        queryParams.push(Number(limit), Number(offset));
        
        const [sessions] = await sql.query(query, queryParams);
        
        // Get total count for pagination
        const [countResult] = await sql.query(
            `SELECT COUNT(*) as total FROM spinshield_sessions ${userId ? 'WHERE user_id = ?' : ''}`,
            userId ? [userId] : []
        );
        
        return res.json({ 
            sessions,
            pagination: {
                total: countResult[0].total,
                page: Number(page),
                limit: Number(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching SpinShield sessions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Get transactions
router.get('/transactions', async (req, res) => {
    try {
        const { page = 0, limit = 20, userId = null, gameId = null, sessionId = null } = req.query;
        const offset = page * limit;
        
        let query = `
            SELECT t.*, u.username, g.game_name
            FROM spinshield_transactions t
            LEFT JOIN users u ON t.user_id = u.id
            LEFT JOIN spinshield_games g ON t.game_id = g.game_id
            WHERE 1=1
        `;
        
        const queryParams = [];
        
        if (userId) {
            query += ' AND t.user_id = ?';
            queryParams.push(userId);
        }
        
        if (gameId) {
            query += ' AND t.game_id = ?';
            queryParams.push(gameId);
        }
        
        if (sessionId) {
            query += ' AND t.session_id = ?';
            queryParams.push(sessionId);
        }
        
        query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
        queryParams.push(Number(limit), Number(offset));
        
        const [transactions] = await sql.query(query, queryParams);
        
        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM spinshield_transactions WHERE 1=1';
        const countParams = [];
        
        if (userId) {
            countQuery += ' AND user_id = ?';
            countParams.push(userId);
        }
        
        if (gameId) {
            countQuery += ' AND game_id = ?';
            countParams.push(gameId);
        }
        
        if (sessionId) {
            countQuery += ' AND session_id = ?';
            countParams.push(sessionId);
        }
        
        const [countResult] = await sql.query(countQuery, countParams);
        
        return res.json({ 
            transactions,
            pagination: {
                total: countResult[0].total,
                page: Number(page),
                limit: Number(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching SpinShield transactions:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Get free spins
router.get('/freespins', async (req, res) => {
    try {
        const { page = 0, limit = 20, userId = null } = req.query;
        const offset = page * limit;
        
        let query = `
            SELECT f.*, u.username, g.game_name
            FROM spinshield_freespins f
            LEFT JOIN users u ON f.user_id = u.id
            LEFT JOIN spinshield_games g ON f.game_id = g.game_id
        `;
        
        const queryParams = [];
        
        if (userId) {
            query += ' WHERE f.user_id = ?';
            queryParams.push(userId);
        }
        
        query += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
        queryParams.push(Number(limit), Number(offset));
        
        const [freespins] = await sql.query(query, queryParams);
        
        // Get total count for pagination
        const [countResult] = await sql.query(
            `SELECT COUNT(*) as total FROM spinshield_freespins ${userId ? 'WHERE user_id = ?' : ''}`,
            userId ? [userId] : []
        );
        
        return res.json({ 
            freespins,
            pagination: {
                total: countResult[0].total,
                page: Number(page),
                limit: Number(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching SpinShield free spins:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Add free spins to a user
router.post('/add-freespins', async (req, res) => {
    try {
        const { userId, gameId, freespinsCount, betLevel, validDays } = req.body;
        
        // Validate required fields
        if (!userId || !gameId || !freespinsCount || betLevel === undefined) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Check if game exists
        const [gameCheck] = await sql.query('SELECT game_id FROM spinshield_games WHERE game_id = ?', [gameId]);
        if (!gameCheck.length) {
            return res.status(400).json({ error: 'Game not found' });
        }
        
        // Check if user exists
        const [userCheck] = await sql.query('SELECT id, username FROM users WHERE id = ?', [userId]);
        if (!userCheck.length) {
            return res.status(400).json({ error: 'User not found' });
        }
        
        // Get API credentials
        const [settings] = await sql.query('SELECT api_login, api_password, endpoint FROM spinshield_settings LIMIT 1');
        
        if (!settings.length) {
            return res.status(400).json({ error: 'SpinShield settings not configured' });
        }
        
        // Get user details needed for API
        const [userDetails] = await sql.query(
            'SELECT id, username FROM users WHERE id = ?',
            [userId]
        );
        
        if (!userDetails.length) {
            return res.status(400).json({ error: 'User not found' });
        }
        
        // Generate user password (this would typically be retrieved from your user authentication system)
        const userPassword = `user_${userDetails[0].id}_pass`; // Example only - implement your own secure method
        
        const config = {
            api_login: settings[0].api_login,
            api_password: settings[0].api_password,
            endpoint: settings[0].endpoint
        };
        
        // Create SpinShield API client
        const apiClient = new ApiClient(config);
        
        try {
            // Create player first (required by SpinShield API)
            await apiClient.createPlayer(
                userDetails[0].username,
                userPassword,
                userDetails[0].username,
                'USD'
            );
            
            // Add free spins
            const response = await apiClient.addFreeRounds(
                userDetails[0].username,
                userPassword,
                gameId,
                'USD',
                Number(freespinsCount),
                Number(betLevel),
                Number(validDays || 7)
            );
            
            if (response.error !== 0) {
                return res.status(400).json({ 
                    error: 'Failed to add free spins through API',
                    apiResponse: response
                });
            }
            
            // Store free spins record in database
            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + (validDays || 7));
            
            await sql.query(
                `INSERT INTO spinshield_freespins (
                    user_id, game_id, freespins_count, bet_level, 
                    currency, active, valid_until
                ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId, 
                    gameId, 
                    freespinsCount, 
                    betLevel, 
                    'USD', 
                    true, 
                    validUntil
                ]
            );
            
            sendLog('admin', `[${req.user.id}] ${req.user.username} added ${freespinsCount} free spins for user ${userDetails[0].username}`);
            
            return res.json({ 
                success: true, 
                message: `Successfully added ${freespinsCount} free spins for ${userDetails[0].username}`,
                apiResponse: response.response
            });
        } catch (error) {
            console.error('SpinShield API error:', error);
            return res.status(500).json({ error: 'Error communicating with SpinShield API', details: error.message });
        }
    } catch (error) {
        console.error('Error adding free spins:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user summary
router.get('/user-summary/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get user details
        const [userDetails] = await sql.query(
            'SELECT id, username FROM users WHERE id = ?',
            [userId]
        );
        
        if (!userDetails.length) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Get session count
        const [sessionCount] = await sql.query(
            'SELECT COUNT(*) as count FROM spinshield_sessions WHERE user_id = ?',
            [userId]
        );
        
        // Get total bet amount
        const [betTotal] = await sql.query(
            'SELECT SUM(amount) as total FROM spinshield_transactions WHERE user_id = ? AND action = "debit"',
            [userId]
        );
        
        // Get total win amount
        const [winTotal] = await sql.query(
            'SELECT SUM(amount) as total FROM spinshield_transactions WHERE user_id = ? AND action = "credit"',
            [userId]
        );
        
        // Get active free spins
        const [activeFreespins] = await sql.query(
            'SELECT COUNT(*) as count, SUM(freespins_count) as total FROM spinshield_freespins WHERE user_id = ? AND active = 1 AND valid_until > NOW()',
            [userId]
        );
        
        return res.json({
            user: userDetails[0],
            stats: {
                sessionCount: sessionCount[0].count || 0,
                totalBet: betTotal[0].total || 0,
                totalWin: winTotal[0].total || 0,
                profit: (winTotal[0].total || 0) - (betTotal[0].total || 0),
                activeFreespinsSets: activeFreespins[0].count || 0,
                activeFreespinsTotal: activeFreespins[0].total || 0
            }
        });
    } catch (error) {
        console.error('Error fetching user summary:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Update the sync-popularity endpoint to better match games and handle is_featured
router.post('/sync-popularity', async (req, res) => {
  try {
    // Read the games_rating.json file
    const fs = require('fs');
    const path = require('path');
    const gamesRatingPath = path.join(__dirname, '../../games_rating.json');
    console.log('My Path: ', __dirname);
    console.log('Games Path:', gamesRatingPath);
    
    if (!fs.existsSync(gamesRatingPath)) {
      return res.status(404).json({ success: false, message: 'games_rating.json file not found' });
    }
    
    const gamesRating = JSON.parse(fs.readFileSync(gamesRatingPath, 'utf8'));
    
    // Create a map for faster lookups
    const popularityMap = new Map();
    const cleanedTitleMap = new Map();
    
    // Process each game in the JSON and store multiple ways to look it up
    gamesRating.forEach(game => {
      if (game.title && game.popularity) {
        // Store exact match
        popularityMap.set(game.title.toLowerCase(), {
          popularity: Math.floor(game.popularity),
          trending: game.recentTrendingRank || 0
        });
        
        // Also store a cleaned version for fuzzy matching
        const cleanedTitle = game.title.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '') // Remove special characters
          .replace(/\s+/g, ' ')        // Normalize whitespace
          .trim();
          
        cleanedTitleMap.set(cleanedTitle, {
          popularity: Math.floor(game.popularity),
          trending: game.recentTrendingRank || 0
        });
      }
    });
    
    // Get all games from database
    const [games] = await sql.query('SELECT id, game_name FROM spinshield_games');
    
    // Prepare counts
    let updatedCount = 0;
    let featuredCount = 0;
    
    // Process each game (using a single transaction for performance)
    const connection = await sql.getConnection();
    await connection.beginTransaction();
    
    try {
      for (const game of games) {
        const gameName = game.game_name.toLowerCase();
        const cleanedGameName = gameName.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
        let popularity = 0;
        let isFeatured = false;
        
        // Try exact match first
        if (popularityMap.has(gameName)) {
          const data = popularityMap.get(gameName);
          popularity = data.popularity;
          isFeatured = data.trending > 0 && data.trending <= 20; // Top trending games become featured
          updatedCount++;
        } 
        // Try cleaned match
        else if (cleanedTitleMap.has(cleanedGameName)) {
          const data = cleanedTitleMap.get(cleanedGameName);
          popularity = data.popularity;
          isFeatured = data.trending > 0 && data.trending <= 20;
          updatedCount++;
        }
        // Try partial match
        else {
          // Check each title in our map for partial matches
          for (const [title, data] of popularityMap.entries()) {
            if (gameName.includes(title) || title.includes(gameName)) {
              popularity = data.popularity;
              isFeatured = data.trending > 0 && data.trending <= 20;
              updatedCount++;
              break;
            }
          }
          
          // If still no match, try against cleaned titles
          if (popularity === 0) {
            for (const [title, data] of cleanedTitleMap.entries()) {
              if (cleanedGameName.includes(title) || title.includes(cleanedGameName)) {
                popularity = data.popularity;
                isFeatured = data.trending > 0 && data.trending <= 20;
                updatedCount++;
                break;
              }
            }
          }
        }
        
        // Update database if we found a match
        if (popularity > 0) {
          await connection.query('UPDATE spinshield_games SET popularity = ?, is_featured = ? WHERE id = ?', 
            [popularity, isFeatured ? 1 : 0, game.id]);
          
          if (isFeatured) featuredCount++;
        }
      }
      
      await connection.commit();
      
      sendLog('admin', `[${req.user.id}] ${req.user.username} synced popularity data for ${updatedCount} games.`);
      res.json({ 
        success: true, 
        message: `Updated popularity for ${updatedCount} games and marked ${featuredCount} as featured` 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error syncing game popularity:', error);
    res.status(500).json({ success: false, message: 'Failed to sync game popularity', error: error.message });
  }
});

module.exports = router;
