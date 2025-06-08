const express = require('express');
const router = express.Router();

const { isAuthed } = require('../../auth/functions');
const { slots, cacheSlots, createGameSession } = require('./functions');
const { enabledFeatures } = require('../../admin/config');
const { sql } = require('../../../database');

const jwt = require('jsonwebtoken');

// Middleware to optionally set user info (doesn't require authentication)
const optionalAuth = async (req, res, next) => {
    try {
        // Try to get JWT token from cookies
        const accessToken = req.cookies?.accessToken;
        
        if (!accessToken) {
            req.user = null;
            return next();
        }
        
        try {
            // Verify the access token using the same secret as the auth middleware
            const tokenSecret = process.env.JWT_ACCESS_SECRET || 'NOVACASINO-access-static-secret-do-not-use-in-prod';
            const decoded = jwt.verify(accessToken, tokenSecret);
            
            // Get the user from DB to ensure they still exist and aren't banned
            const [[user]] = await sql.query(
                'SELECT id, email, username, avatar, perms, banned, balance, xp, role FROM users WHERE id = ?',
                [decoded.userId]
            );
            
            if (user && !user.banned) {
                req.user = user;
            } else {
                req.user = null;
            }
        } catch (tokenError) {
            // Token is invalid/expired, but don't fail the request
            req.user = null;
        }
    } catch (error) {
        // Don't fail the request on auth errors, just set user to null
        console.error('Optional auth error:', error);
        req.user = null;
    }
    
    next();
};

// Cache slots on startup
cacheSlots();

router.get('/', optionalAuth, async (req, res) => {
    try {
        // Safe column mapping to prevent SQL injection
        const ALLOWED_SORT_COLUMNS = {
            'game_name': 'game_name',
            'rtp': 'rtp',
            'provider': 'provider', 
            'popularity': 'popularity'
        };

        const ALLOWED_SORT_ORDERS = {
            'ASC': 'ASC',
            'DESC': 'DESC'
        };

        // Use mapping for safe SQL construction
        const sortBy = ALLOWED_SORT_COLUMNS[req.query.sortBy] || ALLOWED_SORT_COLUMNS['popularity'];
        const sortOrder = ALLOWED_SORT_ORDERS[req.query.sortOrder] || ALLOWED_SORT_ORDERS['DESC'];

        const limit = parseInt(req.query.limit) || 50;
        if (isNaN(limit) || limit < 1 || limit > 100) return res.status(400).json({ error: 'INVALID_LIMIT' });

        const offset = parseInt(req.query.offset) || 0;
        if (isNaN(offset) || offset < 0) return res.status(400).json({ error: 'INVALID_OFFSET' });

        // Check if user is authenticated to include favorite status
        const userId = req.user?.id || null;
        console.log('[SLOTS] User from req.user:', req.user); // Debug log
        console.log('[SLOTS] User ID:', userId); // Debug log

        // Build query with optional favorite status
        let selectFields = 'sg.*';
        let joinClause = '';
        
        if (userId) {
            selectFields = 'sg.*, CASE WHEN uf.id IS NOT NULL THEN 1 ELSE 0 END as is_favorited';
            joinClause = 'LEFT JOIN user_favorites uf ON sg.game_id_hash = uf.game_id_hash AND uf.user_id = ?';
        }

        let query = `SELECT ${selectFields} FROM spinshield_games sg ${joinClause} WHERE sg.active = 1`;
        const queryParams = userId ? [userId] : [];

        // Search by name
        const search = req.query.search;
        if (search && typeof search === 'string' && search.length > 0 && search.length <= 30) {
            // Additional validation: only allow alphanumeric, spaces, hyphens, and basic punctuation
            const searchPattern = /^[a-zA-Z0-9\s\-_'".,:!()]+$/;
            if (searchPattern.test(search)) {
                query += ` AND LOWER(sg.game_name) LIKE ?`;
                queryParams.push(`%${search.toLowerCase()}%`);
            }
        }
        
        // Filter by provider
        const provider = req.query.provider;
        if (provider && typeof provider === 'string') {
            query += ` AND sg.provider = ?`;
            queryParams.push(provider);
        }

        // Filter by category
        const category = req.query.category;
        if (category && typeof category === 'string') {
            query += ` AND sg.category = ?`;
            queryParams.push(category);
        }

        // Filter by type
        const type = req.query.type;
        if (type && typeof type === 'string') {
            query += ` AND sg.type = ?`;
            queryParams.push(type);
        }

        // Filter by new releases
        const isNew = req.query.isNew;
        if (isNew === 'true' || isNew === '1') {
            query += ` AND sg.is_new = 1`;
        }

        // Count total (without the favorite join for accurate count)
        let countQuery = `SELECT COUNT(*) as total FROM spinshield_games sg WHERE sg.active = 1`;
        const countParams = [];
        
        // Add the same filters to count query
        if (search && typeof search === 'string' && search.length > 0 && search.length <= 30) {
            const searchPattern = /^[a-zA-Z0-9\s\-_'".,:!()]+$/;
            if (searchPattern.test(search)) {
                countQuery += ` AND LOWER(sg.game_name) LIKE ?`;
                countParams.push(`%${search.toLowerCase()}%`);
            }
        }
        if (provider && typeof provider === 'string') {
            countQuery += ` AND sg.provider = ?`;
            countParams.push(provider);
        }
        if (category && typeof category === 'string') {
            countQuery += ` AND sg.category = ?`;
            countParams.push(category);
        }
        if (type && typeof type === 'string') {
            countQuery += ` AND sg.type = ?`;
            countParams.push(type);
        }
        if (isNew === 'true' || isNew === '1') {
            countQuery += ` AND sg.is_new = 1`;
        }
        
        const [[{ total }]] = await sql.query(countQuery, countParams);
        
        if (!total) return res.json({ limit, offset, total: 0, data: [] });

        // Get data with pagination
        query += ` ORDER BY sg.${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);
        
        const [data] = await sql.query(query, queryParams);
        
        // Map to frontend format
        const mappedData = data.map(game => ({
            id: game.game_id,
            slug: game.game_id_hash,
            name: game.game_name,
            provider: game.provider,
            providerName: game.provider_name,
            img: ['readyplay', 'wizard', 'retrogaming', 'caleta'].includes(game.provider.toLowerCase()) 
                ? (game.image_url || game.image_square || '/public/slots/default.png')
                : (game.image_long || game.image_url || game.image_square || '/public/slots/default.png'),
            blurhash: game.image_blurhash || null,
            rtp: game.rtp,
            type: game.type,
            category: game.category,
            isNew: game.is_new,
            isMobile: game.is_mobile,
            hasJackpot: game.has_jackpot,
            isFavorited: userId ? Boolean(game.is_favorited) : false
        }));
        
        res.json({
            limit,
            offset,
            total,
            data: mappedData
        });
    } catch (error) {
        console.error('Error fetching slots:', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
});

router.get('/providers', async (req, res) => {
    try {
        const [providers] = await sql.query(`
            SELECT DISTINCT provider, provider_name 
            FROM spinshield_games 
            WHERE active = 1 
            ORDER BY provider
        `);
        
        res.json(providers.map(p => ({
            slug: p.provider,
            name: p.provider_name || p.provider,
            img: `/assets/gameProvider/${p.provider.toLowerCase()}.webp`
        })));
    } catch (error) {
        console.error('Error fetching providers:', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
});

router.get('/categories', async (req, res) => {
    try {
        const [categories] = await sql.query(`
            SELECT DISTINCT category
            FROM spinshield_games 
            WHERE active = 1 
            ORDER BY category
        `);
        
        res.json(categories.map(c => c.category));
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
});

router.get('/featured', optionalAuth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 7;
        if (isNaN(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({ error: 'INVALID_LIMIT' });
        }

        // Check if user is authenticated to include favorite status
        const userId = req.user?.id || null;

        // Get total count of featured games
        const [[{ total }]] = await sql.query(`
            SELECT COUNT(*) as total FROM spinshield_games 
            WHERE active = 1 AND is_featured = 1
        `);

        if (!total) {
            return res.json({ limit, offset: 0, total: 0, data: [] });
        }

        // Build query with optional favorite status
        let selectFields = 'sg.*';
        let joinClause = '';
        let queryParams = [limit];
        
        if (userId) {
            selectFields = 'sg.*, CASE WHEN uf.id IS NOT NULL THEN 1 ELSE 0 END as is_favorited';
            joinClause = 'LEFT JOIN user_favorites uf ON sg.game_id_hash = uf.game_id_hash AND uf.user_id = ?';
            queryParams = [userId, limit];
        }

        // Get limited featured games
        const [featured] = await sql.query(`
            SELECT ${selectFields} FROM spinshield_games sg ${joinClause}
            WHERE sg.active = 1 AND sg.is_featured = 1 
            ORDER BY RAND() 
            LIMIT ?
        `, queryParams);
        
        const mappedData = featured.map(game => ({
            id: game.game_id,
            slug: game.game_id_hash,
            name: game.game_name,
            provider: game.provider,
            providerName: game.provider_name,
            img: ['readyplay', 'wizard', 'retrogaming', 'caleta'].includes(game.provider.toLowerCase()) 
                ? (game.image_url || game.image_square || '/public/slots/default.png')
                : (game.image_long || game.image_url || game.image_square || '/public/slots/default.png'),
            blurhash: game.image_blurhash || null,
            rtp: game.rtp,
            isFavorited: userId ? Boolean(game.is_favorited) : false
        }));

        res.json({
            limit,
            offset: 0,
            total,
            data: mappedData
        });
    } catch (error) {
        console.error('Error fetching featured slots:', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const [stats] = await sql.query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN type = 'video-slots' THEN 1 END) as video_slots,
                COUNT(CASE WHEN type = 'live' THEN 1 END) as live,
                COUNT(CASE WHEN is_new = 1 THEN 1 END) as new_releases,
                COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured
            FROM spinshield_games 
            WHERE active = 1
        `);
        
        res.json(stats[0]);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
});

// Get user's favorite slots
router.get('/favorites', isAuthed, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        if (isNaN(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({ error: 'INVALID_LIMIT' });
        }
        
        if (isNaN(offset) || offset < 0) {
            return res.status(400).json({ error: 'INVALID_OFFSET' });
        }
        
        // Get total count of user's favorites
        const [[{ total }]] = await sql.query(`
            SELECT COUNT(*) as total 
            FROM user_favorites uf
            INNER JOIN spinshield_games sg ON uf.game_id_hash = sg.game_id_hash
            WHERE uf.user_id = ? AND sg.active = 1
        `, [userId]);
        
        if (!total) {
            return res.json({ limit, offset, total: 0, data: [] });
        }
        
        // Get user's favorite games with pagination
        const [favorites] = await sql.query(`
            SELECT sg.*, uf.created_at as favorited_at
            FROM user_favorites uf
            INNER JOIN spinshield_games sg ON uf.game_id_hash = sg.game_id_hash
            WHERE uf.user_id = ? AND sg.active = 1
            ORDER BY uf.created_at DESC
            LIMIT ? OFFSET ?
        `, [userId, limit, offset]);
        
        // Map to frontend format
        const mappedData = favorites.map(game => ({
            id: game.game_id,
            slug: game.game_id_hash,
            name: game.game_name,
            provider: game.provider,
            providerName: game.provider_name,
            img: ['readyplay', 'wizard', 'retrogaming', 'caleta'].includes(game.provider.toLowerCase()) 
                ? (game.image_url || game.image_square || '/public/slots/default.png')
                : (game.image_long || game.image_url || game.image_square || '/public/slots/default.png'),
            blurhash: game.image_blurhash || null,
            rtp: game.rtp,
            type: game.type,
            category: game.category,
            isNew: game.is_new,
            isMobile: game.is_mobile,
            hasJackpot: game.has_jackpot,
            isFavorited: true, // All games in favorites are favorited
            favoritedAt: game.favorited_at
        }));
        
        res.json({
            limit,
            offset,
            total,
            data: mappedData
        });
    } catch (error) {
        console.error('Error fetching user favorites:', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
});

// Toggle favorite status for a slot
router.post('/favorites/:slug(*)', isAuthed, async (req, res) => {
    try {
        const userId = req.user.id;
        const slug = req.params.slug;
        
        // Validate slug input
        if (!slug || typeof slug !== 'string' || slug.length > 200) {
            return res.status(400).json({ error: 'INVALID_SLUG' });
        }
        
        // Basic sanitization - only allow alphanumeric, hyphens, underscores, slashes
        const slugPattern = /^[a-zA-Z0-9\-_\/]+$/;
        if (!slugPattern.test(slug)) {
            return res.status(400).json({ error: 'INVALID_SLUG_FORMAT' });
        }
        
        // Check if game exists
        const [gameData] = await sql.query(
            'SELECT game_id_hash FROM spinshield_games WHERE game_id_hash = ? AND active = 1',
            [slug]
        );
        
        if (!gameData.length) {
            return res.status(404).json({ error: 'GAME_NOT_FOUND' });
        }
        
        // Check if already favorited
        const [existingFavorite] = await sql.query(
            'SELECT id FROM user_favorites WHERE user_id = ? AND game_id_hash = ?',
            [userId, slug]
        );
        
        if (existingFavorite.length > 0) {
            // Remove from favorites
            await sql.query(
                'DELETE FROM user_favorites WHERE user_id = ? AND game_id_hash = ?',
                [userId, slug]
            );
            
            res.json({ 
                success: true, 
                action: 'removed',
                message: 'Game removed from favorites' 
            });
        } else {
            // Add to favorites
            await sql.query(
                'INSERT INTO user_favorites (user_id, game_id_hash) VALUES (?, ?)',
                [userId, slug]
            );
            
            res.json({ 
                success: true, 
                action: 'added',
                message: 'Game added to favorites' 
            });
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ error: 'ALREADY_FAVORITED' });
        } else {
            res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
        }
    }
});

// Check if a specific slot is favorited by the user
router.get('/favorites/check/:slug(*)', isAuthed, async (req, res) => {
    try {
        const userId = req.user.id;
        const slug = req.params.slug;
        
        // Validate slug input
        if (!slug || typeof slug !== 'string' || slug.length > 200) {
            return res.status(400).json({ error: 'INVALID_SLUG' });
        }
        
        // Basic sanitization
        const slugPattern = /^[a-zA-Z0-9\-_\/]+$/;
        if (!slugPattern.test(slug)) {
            return res.status(400).json({ error: 'INVALID_SLUG_FORMAT' });
        }
        
        // Check if favorited
        const [favorite] = await sql.query(
            'SELECT id, created_at FROM user_favorites WHERE user_id = ? AND game_id_hash = ?',
            [userId, slug]
        );
        
        res.json({
            isFavorited: favorite.length > 0,
            favoritedAt: favorite.length > 0 ? favorite[0].created_at : null
        });
    } catch (error) {
        console.error('Error checking favorite status:', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
});

router.get('/:slug(*)', optionalAuth, async (req, res) => {
    try {
        // Capture the entire path after /slots/ as the slug
        const slug = req.params.slug;
        
        // Validate slug input to prevent potential issues
        if (!slug || typeof slug !== 'string' || slug.length > 200) {
            return res.status(400).json({ error: 'INVALID_SLUG' });
        }
        
        // Basic sanitization - only allow alphanumeric, hyphens, underscores, slashes
        const slugPattern = /^[a-zA-Z0-9\-_\/]+$/;
        if (!slugPattern.test(slug)) {
            return res.status(400).json({ error: 'INVALID_SLUG_FORMAT' });
        }
        // Check if user is authenticated to include favorite status for main game
        const userId = req.user?.id || null;
        console.log('[SINGLE SLOT] User ID:', userId); // Debug log
        
        let gameQuery, gameParams;
        
        if (userId) {
            gameQuery = `
                SELECT sg.*, CASE WHEN uf.id IS NOT NULL THEN 1 ELSE 0 END as is_favorited
                FROM spinshield_games sg 
                LEFT JOIN user_favorites uf ON sg.game_id_hash = uf.game_id_hash AND uf.user_id = ?
                WHERE sg.game_id_hash = ? AND sg.active = 1
            `;
            gameParams = [userId, slug];
        } else {
            gameQuery = 'SELECT * FROM spinshield_games WHERE game_id_hash = ? AND active = 1';
            gameParams = [slug];
        }
        
        const [gameData] = await sql.query(gameQuery, gameParams);
        
        if (!gameData.length) {
            return res.status(404).json({ error: 'INVALID_SLOT' });
        }
        console.log('gameData: ', gameData[0].provider);
        
        const game = gameData[0];
        const gameProvider = game.provider;
        
        // Get similar games for single slot endpoint with favorite status
        let featuredQuery, featuredParams;
        
        if (userId) {
            featuredQuery = `
                SELECT sg.*, CASE WHEN uf.id IS NOT NULL THEN 1 ELSE 0 END as is_favorited
                FROM spinshield_games sg 
                LEFT JOIN user_favorites uf ON sg.game_id_hash = uf.game_id_hash AND uf.user_id = ?
                WHERE sg.active = 1 AND sg.provider = ? 
                ORDER BY RAND() 
                LIMIT 20
            `;
            featuredParams = [userId, gameProvider];
        } else {
            featuredQuery = `
                SELECT * FROM spinshield_games 
                WHERE active = 1 AND provider = ? 
                ORDER BY RAND() 
                LIMIT 20
            `;
            featuredParams = [gameProvider];
        }
        
        const [featured] = await sql.query(featuredQuery, featuredParams);
        
        res.json({
            id: game.game_id,
            slug: game.game_id_hash,
            name: game.game_name,
            provider: game.provider,
            providerName: game.provider_name,
            img: ['readyplay', 'wizard', 'retrogaming', 'caleta'].includes(game.provider.toLowerCase()) 
                ? (game.image_url || game.image_square || '/public/slots/default.png')
                : (game.image_long || game.image_url || game.image_square || '/public/slots/default.png'),
            imgLong: game.image_long,
            imgPortrait: game.image_portrait,
            rtp: game.rtp,
            type: game.type,
            category: game.category,
            subcategory: game.subcategory,
            isNew: game.is_new,
            isMobile: game.is_mobile,
            hasJackpot: game.has_jackpot,
            isFavorited: userId ? Boolean(game.is_favorited) : false,
            featured: featured.map(f => ({
                id: f.game_id,
                slug: f.game_id_hash,
                name: f.game_name,
                provider: f.provider,
                providerName: f.provider_name,
                img: ['readyplay', 'wizard', 'retrogaming', 'caleta'].includes(f.provider.toLowerCase()) 
                ? (f.image_url || f.image_square || '/public/slots/default.png')
                : (f.image_long || f.image_url || f.image_square || '/public/slots/default.png'),
                blurhash: f.image_blurhash || null,
                rtp: f.rtp,
                isFavorited: userId ? Boolean(f.is_favorited) : false
            }))
        });
    } catch (error) {
        console.error('Error fetching slot details:', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
});

router.post('/play/:slug(*)', isAuthed, async (req, res) => {
    try {
        if (!enabledFeatures.slots) {
            return res.status(400).json({ error: 'DISABLED' });
        }
        
        // Capture the entire path after /slots/play/ as the slug
        const slug = req.params.slug;
        console.log('Slug: ', slug);
        
        // Validate slug input to prevent potential issues
        if (!slug || typeof slug !== 'string' || slug.length > 200) {
            return res.status(400).json({ error: 'INVALID_SLUG' });
        }
        
        // Basic sanitization - only allow alphanumeric, hyphens, underscores, slashes
        const slugPattern = /^[a-zA-Z0-9\-_\/]+$/;
        if (!slugPattern.test(slug)) {
            return res.status(400).json({ error: 'INVALID_SLUG_FORMAT' });
        }
        
        // Get game details
        const [gameData] = await sql.query(
            'SELECT * FROM spinshield_games WHERE game_id_hash = ? AND active = 1',
            [slug]
        );
        
        if (!gameData.length) {
            return res.status(404).json({ error: 'INVALID_SLOT' });
        }
        
        const game = gameData[0];
        const isDemo = req.query.demo === 'true';
        
        try {
            // Create game session
            const session = await createGameSession(
                req.user.id,
                game.game_id_hash,
                'USD',
                isDemo
            );
            
            // Prepare response with base data
            const response = {
                url: session.game_url,
                sessionId: session.session_id
            };
            
            // Handle the case where we got a demo instead of real money game
            if (session.is_demo && !isDemo) {
                // User requested real money game but got demo instead (fallback)
                response.isDemo = true;
                response.fallbackReason = session.fallback_message || 'Using demo mode due to provider API issues';
                response.warning = 'This is a demo game. Real money transactions are not available.';
            } else if (session.is_demo) {
                // User requested demo mode and got it
                response.isDemo = true;
            }
            
            res.json(response);
        } catch (sessionError) {
            console.error('Session creation error details:', sessionError);
            // Return a more specific error message to the client
            res.status(500).json({ 
                error: 'Failed to launch game', 
                details: sessionError.message,
                code: 'SESSION_CREATION_FAILED'
            });
        }
    } catch (error) {
        console.error('Error launching game:', error);
        res.status(500).json({ error: 'Failed to launch game', details: error.message });
    }
});

module.exports = router;