const express = require('express');
const router = express.Router();

const { isAuthed } = require('../../auth/functions');
const { slots, cacheSlots, createGameSession } = require('./functions');
const { enabledFeatures } = require('../../admin/config');
const { sql } = require('../../../database');

// Cache slots on startup
cacheSlots();

router.get('/', async (req, res) => {
    try {
        let sortBy = req.query.sortBy || 'popularity';
        if (!['game_name', 'rtp', 'provider', 'popularity'].includes(sortBy)) {
            sortBy = 'popularity';
        }

        let sortOrder = req.query.sortOrder || 'DESC';
        if (!['ASC', 'DESC'].includes(sortOrder)) {
            sortOrder = 'DESC';
        }

        const limit = parseInt(req.query.limit) || 50;
        if (isNaN(limit) || limit < 1 || limit > 100) return res.status(400).json({ error: 'INVALID_LIMIT' });

        const offset = parseInt(req.query.offset) || 0;
        if (isNaN(offset) || offset < 0) return res.status(400).json({ error: 'INVALID_OFFSET' });

        // Build query
        let query = `SELECT * FROM spinshield_games WHERE active = 1`;
        const queryParams = [];

        // Search by name
        const search = req.query.search;
        if (search && typeof search === 'string' && search.length > 0 && search.length <= 30) {
            query += ` AND LOWER(game_name) LIKE ?`;
            queryParams.push(`%${search.toLowerCase()}%`);
        }
        
        // Filter by provider
        const provider = req.query.provider;
        if (provider && typeof provider === 'string') {
            query += ` AND provider = ?`;
            queryParams.push(provider);
        }

        // Filter by category
        const category = req.query.category;
        if (category && typeof category === 'string') {
            query += ` AND category = ?`;
            queryParams.push(category);
        }

        // Count total
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [[{ total }]] = await sql.query(countQuery, queryParams);
        
        if (!total) return res.json({ limit, offset, total: 0, data: [] });

        // Get data with pagination
        query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
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
            rtp: game.rtp,
            type: game.type,
            category: game.category,
            isNew: game.is_new,
            isMobile: game.is_mobile,
            hasJackpot: game.has_jackpot
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
            img: `/public/assets/gameProvider/${p.provider.toLowerCase()}.webp`
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

router.get('/featured', async (req, res) => {
    try {
        const [featured] = await sql.query(`
            SELECT * FROM spinshield_games 
            WHERE active = 1 AND is_featured = 1 
            ORDER BY RAND() 
            LIMIT 7
        `);
        
        res.json(featured.map(game => ({
            id: game.game_id,
            slug: game.game_id_hash,
            name: game.game_name,
            provider: game.provider,
            providerName: game.provider_name,
            img: ['readyplay', 'wizard', 'retrogaming', 'caleta'].includes(game.provider.toLowerCase()) 
                ? (game.image_url || game.image_square || '/public/slots/default.png')
                : (game.image_long || game.image_url || game.image_square || '/public/slots/default.png'),
            rtp: game.rtp
        })));
    } catch (error) {
        console.error('Error fetching featured slots:', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        const [gameData] = await sql.query(
            'SELECT * FROM spinshield_games WHERE game_id_hash = ? AND active = 1',
            [slug]
        );
        
        if (!gameData.length) {
            return res.status(404).json({ error: 'INVALID_SLOT' });
        }
        
        const game = gameData[0];
        
        // Get featured games
        const [featured] = await sql.query(`
            SELECT * FROM spinshield_games 
            WHERE active = 1 AND game_id_hash != ? 
            ORDER BY RAND() 
            LIMIT 10
        `, [slug]);
        
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
            featured: featured.map(f => ({
                id: f.game_id,
                slug: f.game_id_hash,
                name: f.game_name,
                provider: f.provider,
                providerName: f.provider_name,
                img: f.image_url || f.image_square || '/public/slots/default.png',
                rtp: f.rtp
            }))
        });
    } catch (error) {
        console.error('Error fetching slot details:', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
});

router.post('/play/:slug', isAuthed, async (req, res) => {
    try {
        if (!enabledFeatures.slots) {
            return res.status(400).json({ error: 'DISABLED' });
        }
        
        const slug = req.params.slug;
        
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
        
        // Create game session
        const session = await createGameSession(
            req.user.id,
            game.game_id,
            'USD',
            isDemo
        );
        
        res.json({
            url: session.game_url,
            sessionId: session.session_id
        });
    } catch (error) {
        console.error('Error launching game:', error);
        res.status(500).json({ error: 'Failed to launch game', details: error.message });
    }
});

module.exports = router;