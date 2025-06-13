const express = require('express');
const router = express.Router();

const { body, validationResult } = require('express-validator');
const { bannedUsers, sponsorLockedUsers } = require('../config');
const { roundDecimal, sendLog } = require('../../../utils');
const { ulid } = require('ulid');
const { generateJwtToken, expiresIn, getReqToken } = require('../../auth/functions');
const { isValid } = require('ulid');

router.use('/affiliates', require('./affiliates'));
const { sql, doTransaction } = require('../../../database');
const io = require('../../../socketio/server');

const resultsPerPage = 10;

router.get('/', async (req, res) => {

    const sortBy = req.query.sortBy || 'balance';
    if (!['username', 'xp', 'balance', 'perms', 'role', 'createdAt'].includes(sortBy)) return res.status(400).json({ error: 'INVALID_SORT_BY' });

    const sortOrder = req.query.sortOrder || 'DESC';
    if (!['ASC', 'DESC'].includes(sortOrder)) return res.status(400).json({ error: 'INVALID_SORT_ORDER' });

    let searchQuery = '';
    let searchArgs = [];

    const conditions = [];

    const search = req.query.search;
    if (search) {
        if (typeof search !== 'string' || search.length < 1 || search.length > 30) return res.status(400).json({ error: 'INVALID_SEARCH' });
        conditions.push('LOWER(username) LIKE ?');
        searchArgs.push(`%${search.toLowerCase()}%`);
    }

    const roleFilter = req.query.role;
    if (roleFilter) {
        if (!['USER', 'MOD', 'DEV', 'ADMIN', 'OWNER', 'BOT', 'NULL'].includes(roleFilter)) {
            return res.status(400).json({ error: 'INVALID_ROLE_FILTER' });
        }
        if (roleFilter === 'NULL') {
            conditions.push('(role IS NULL OR role = ?)');
            searchArgs.push('USER');
        } else {
            conditions.push('role = ?');
            searchArgs.push(roleFilter);
        }
    }

    if (conditions.length > 0) {
        searchQuery = ` WHERE ${conditions.join(' AND ')}`;
    }

    let page = parseInt(req.query.page);
    page = !isNaN(page) && page > 0 ? page : 1;

    const offset = (page - 1) * resultsPerPage;

    const [[{ total }]] = await sql.query(`SELECT COUNT(*) as total FROM users${searchQuery}`, searchArgs);
    if (!total) return res.json({ page: 1, pages: 0, total: 0, data: [] });

    const pages = Math.ceil(total / resultsPerPage);

    if (page > pages) return res.status(404).json({ error: 'PAGE_NOT_FOUND' });

    const [data] = await sql.query(
        `SELECT id, username, role, balance, xp, banned, accountLock, tipBan, rainBan, leaderboardBan, sponsorLock, createdAt FROM users${searchQuery} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
        searchArgs.concat([resultsPerPage, offset])
    );
    
    res.json({
        page,
        pages,
        total,
        data
    });

});

// Search users endpoint for freespins dialog
router.get('/search', async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;
        
        if (!q || typeof q !== 'string' || q.length < 2) {
            return res.json({ users: [] });
        }
        
        const searchTerm = `%${q.toLowerCase()}%`;
        const limitNum = Math.min(parseInt(limit) || 10, 50); // Max 50 results
        
        const [users] = await sql.query(`
            SELECT id, username, email, balance, role, createdAt
            FROM users 
            WHERE (LOWER(username) LIKE ? OR LOWER(email) LIKE ?) 
            AND banned = 0 
            ORDER BY username ASC 
            LIMIT ?
        `, [searchTerm, searchTerm, limitNum]);
        
        res.json({ users });
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
});

router.get('/:id', async (req, res) => {

    if (!isValid(req.params.id)) return res.status(400).json({ error: 'INVALID_ID' });

    const [[user]] = await sql.query(`SELECT users.id, username, xp, role, balance, banned, tipBan, leaderboardBan, rainBan, accountLock, sponsorLock, maxPerTip, maxTipPerUser, tipAllowance, rainTipAllowance, cryptoAllowance, mutedUntil, discordId FROM users
        LEFT JOIN discordAuths ON discordAuths.userId = users.id
        WHERE users.id = ?`, [req.params.id]);

    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
    res.json(user);

});

// New comprehensive user details endpoint
router.get('/:id/details', async (req, res) => {
    if (!isValid(req.params.id)) return res.status(400).json({ error: 'INVALID_ID' });

    const userId = req.params.id;

    try {
        // Get basic user info
        const [[user]] = await sql.query(`
            SELECT 
                users.id, 
                users.username, 
                users.email,
                users.xp, 
                users.role, 
                users.balance, 
                users.banned, 
                users.tipBan, 
                users.leaderboardBan, 
                users.rainBan, 
                users.accountLock, 
                users.sponsorLock, 
                users.maxPerTip, 
                users.maxTipPerUser, 
                users.tipAllowance, 
                users.rainTipAllowance, 
                users.cryptoAllowance, 
                users.mutedUntil,
                users.createdAt,
                users.updatedAt,
                users.lastLogout,
                users.ip,
                users.country,
                users.affiliateCode,
                users.affiliateCodeLock,
                users.avatar,
                users.robloxId,
                users.verified,
                users.anon,
                users.clientSeed,
                users.nonce,
                discordAuths.discordId
            FROM users
            LEFT JOIN discordAuths ON discordAuths.userId = users.id
            WHERE users.id = ?
        `, [userId]);

        if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });

        // Get user settings
        const [[userSettings]] = await sql.query(`
            SELECT * FROM user_settings WHERE userId = ?
        `, [userId]);

        // Get user favorites
        const [userFavorites] = await sql.query(`
            SELECT 
                uf.game_id_hash, 
                uf.created_at as createdAt,
                sg.game_name as gameName,
                sg.provider,
                sg.game_id
            FROM user_favorites uf
            LEFT JOIN spinshield_games sg ON uf.game_id_hash = sg.game_id_hash
            WHERE uf.user_id = ? 
            ORDER BY uf.created_at DESC 
            LIMIT 10
        `, [userId]);

        // Get recent transactions
        const [transactions] = await sql.query(`
            SELECT id, amount, type, method, methodId, createdAt 
            FROM transactions 
            WHERE userId = ? 
            ORDER BY createdAt DESC 
            LIMIT 20
        `, [userId]);

        // Get recent bets
        const [bets] = await sql.query(`
            SELECT 
                b.id, b.amount, b.edge, b.winnings, b.payout, b.game, b.completed, b.createdAt,
                b.provider, b.spinshield_game_id,
                sg.game_name, sg.image_url, sg.provider_name
            FROM bets b
            LEFT JOIN spinshield_games sg ON b.spinshield_game_id = sg.game_id_hash
            WHERE b.userId = ? 
            ORDER BY b.createdAt DESC 
            LIMIT 20
        `, [userId]);

        // Get crypto wallets
        const [cryptoWallets] = await sql.query(`
            SELECT currency, address, createdAt 
            FROM cryptoWallets 
            WHERE userId = ?
        `, [userId]);

        // Get crypto deposits
        const [cryptoDeposits] = await sql.query(`
            SELECT id, currency, cryptoAmount, fiatAmount, robuxAmount, txId, status, createdAt 
            FROM cryptoDeposits 
            WHERE userId = ? 
            ORDER BY createdAt DESC 
            LIMIT 10
        `, [userId]);

        // Get crypto withdrawals
        const [cryptoWithdraws] = await sql.query(`
            SELECT id, currency, cryptoAmount, fiatAmount, robuxAmount, address, txId, status, createdAt 
            FROM cryptoWithdraws 
            WHERE userId = ? 
            ORDER BY createdAt DESC 
            LIMIT 10
        `, [userId]);

        // Get notifications
        const [notifications] = await sql.query(`
            SELECT id, type, content, isRead, createdAt 
            FROM notifications 
            WHERE userId = ? 
            ORDER BY createdAt DESC 
            LIMIT 15
        `, [userId]);

        // Get leaderboard entries
        const [leaderboardEntries] = await sql.query(`
            SELECT 
                lb.type as leaderboardName,
                lu.position,
                lu.totalWagered as value,
                lu.amountWon,
                lu.createdAt
            FROM leaderboardUsers lu
            JOIN leaderboards lb ON lu.leaderboardId = lb.id
            WHERE lu.userId = ?
            ORDER BY lu.createdAt DESC
            LIMIT 10
        `, [userId]);

        // Get recent chat messages (last 20)
        const [chatMessages] = await sql.query(`
            SELECT 
                cm.id, 
                cm.content, 
                cm.type, 
                cm.createdAt,
                cm.channelId as channel,
                u.username
            FROM chatMessages cm
            LEFT JOIN users u ON cm.senderId = u.id
            WHERE cm.senderId = ? 
            ORDER BY cm.createdAt DESC 
            LIMIT 20
        `, [userId]);

        // Get client seeds
        const [clientSeeds] = await sql.query(`
            SELECT id, seed, createdAt 
            FROM clientSeeds 
            WHERE userId = ? 
            ORDER BY createdAt DESC 
            LIMIT 10
        `, [userId]);

        // Get affiliate data
        const [[affiliateStats]] = await sql.query(`
            SELECT 
                COUNT(DISTINCT a.userId) as affiliatedUsersCount,
                COALESCE(SUM(CASE WHEN b.createdAt >= a.createdAt THEN b.amount ELSE 0 END), 0) as totalAffiliateWagered
            FROM affiliates a
            LEFT JOIN bets b ON a.userId = b.userId AND b.completed = 1
            WHERE a.affiliateId = ?
        `, [userId]);

        // Get users this user has referred
        const [referredUsers] = await sql.query(`
            SELECT 
                u.id,
                u.username,
                u.balance,
                u.xp,
                a.createdAt as referredAt
            FROM affiliates a
            JOIN users u ON a.userId = u.id
            WHERE a.affiliateId = ?
            ORDER BY a.createdAt DESC
            LIMIT 10
        `, [userId]);

        // Get security logs
        const [securityLogs] = await sql.query(`
            SELECT id, event_type, description, ip_address, user_agent, createdAt 
            FROM security_logs 
            WHERE userId = ? 
            ORDER BY createdAt DESC 
            LIMIT 15
        `, [userId]);

        // Calculate some statistics
        const [[betStats]] = await sql.query(`
            SELECT 
                COUNT(*) as totalBets,
                COALESCE(SUM(amount), 0) as totalWagered,
                COALESCE(SUM(winnings), 0) as totalWinnings,
                COALESCE(SUM(winnings - amount), 0) as totalProfit,
                COALESCE(AVG(amount), 0) as avgBetAmount,
                COALESCE(MAX(amount), 0) as maxBetAmount
            FROM bets 
            WHERE userId = ? AND completed = 1
        `, [userId]);

        // Get comprehensive statistics separating real vs admin transactions
        const [[realTransactionStats]] = await sql.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'in' AND method != 'admin' THEN amount ELSE 0 END), 0) as realDeposited,
                COALESCE(SUM(CASE WHEN type = 'out' AND method != 'admin' THEN amount ELSE 0 END), 0) as realWithdrawn,
                COUNT(CASE WHEN type = 'in' AND method != 'admin' THEN 1 END) as realDepositCount,
                COUNT(CASE WHEN type = 'out' AND method != 'admin' THEN 1 END) as realWithdrawCount
            FROM transactions 
            WHERE userId = ?
        `, [userId]);

        const [[adminTransactionStats]] = await sql.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'in' AND method = 'admin' THEN amount ELSE 0 END), 0) as adminDeposited,
                COALESCE(SUM(CASE WHEN type = 'out' AND method = 'admin' THEN amount ELSE 0 END), 0) as adminWithdrawn,
                COUNT(CASE WHEN type = 'in' AND method = 'admin' THEN 1 END) as adminDepositCount,
                COUNT(CASE WHEN type = 'out' AND method = 'admin' THEN 1 END) as adminWithdrawCount
            FROM transactions 
            WHERE userId = ?
        `, [userId]);

        const [[allTransactionStats]] = await sql.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END), 0) as totalDeposited,
                COALESCE(SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) as totalWithdrawn,
                COUNT(CASE WHEN type = 'in' THEN 1 END) as totalDepositCount,
                COUNT(CASE WHEN type = 'out' THEN 1 END) as totalWithdrawCount
            FROM transactions 
            WHERE userId = ?
        `, [userId]);

        // Compile comprehensive user data
        const userDetails = {
            user,
            userSettings,
            userFavorites,
            transactions,
            bets,
            cryptoWallets,
            cryptoDeposits,
            cryptoWithdraws,
            notifications,
            leaderboardEntries,
            chatMessages,
            clientSeeds,
            affiliateStats,
            referredUsers,
            securityLogs,
            statistics: {
                ...betStats,
                real: realTransactionStats,
                admin: adminTransactionStats,
                all: allTransactionStats
            }
        };

        res.json(userDetails);

    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
});

// Get paginated bets for a user
router.get('/:id/bets', async (req, res) => {
    try {
        if (!isValid(req.params.id)) return res.status(400).json({ error: 'INVALID_ID' });
        const userId = req.params.id;

        let page = parseInt(req.query.page);
        page = !isNaN(page) && page > 0 ? page : 1;

        const resultsPerPage = 50;
        const offset = (page - 1) * resultsPerPage;

        // Get total count
        const [[{ total }]] = await sql.query(`
            SELECT COUNT(*) as total 
            FROM bets 
            WHERE userId = ?
        `, [userId]);

        if (!total) return res.json({ page: 1, pages: 0, total: 0, data: [] });

        const pages = Math.ceil(total / resultsPerPage);
        if (page > pages) return res.status(404).json({ error: 'PAGE_NOT_FOUND' });

        // Get paginated bets
        const [bets] = await sql.query(`
            SELECT 
                b.id, b.amount, b.edge, b.winnings, b.payout, b.game, b.completed, b.createdAt,
                b.provider, b.spinshield_game_id,
                sg.game_name, sg.image_url, sg.provider_name
            FROM bets b
            LEFT JOIN spinshield_games sg ON b.spinshield_game_id = sg.game_id_hash
            WHERE b.userId = ? 
            ORDER BY b.createdAt DESC 
            LIMIT ? OFFSET ?
        `, [userId, resultsPerPage, offset]);

        res.json({
            page,
            pages,
            total,
            data: bets
        });

    } catch (error) {
        console.error('Error fetching user bets:', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
});

// Get detailed game analytics for a user
router.get('/:id/game-analytics', async (req, res) => {
    try {
        if (!isValid(req.params.id)) return res.status(400).json({ error: 'INVALID_ID' });
        const userId = req.params.id;

        // Get game statistics
        const [gameStats] = await sql.query(`
            SELECT 
                b.game,
                COALESCE(sg.game_name, b.game) as display_name,
                sg.image_url,
                sg.provider_name,
                COUNT(*) as bet_count,
                SUM(b.amount) as total_wagered,
                SUM(b.winnings) as total_winnings,
                SUM(b.winnings - b.amount) as net_profit,
                AVG(b.amount) as avg_bet,
                MAX(b.amount) as max_bet,
                MAX(b.winnings - b.amount) as biggest_win,
                MIN(b.winnings - b.amount) as biggest_loss,
                COUNT(CASE WHEN b.winnings > b.amount THEN 1 END) as wins,
                COUNT(CASE WHEN b.winnings < b.amount THEN 1 END) as losses,
                MAX(b.createdAt) as last_played
            FROM bets b
            LEFT JOIN spinshield_games sg ON b.spinshield_game_id = sg.game_id_hash
            WHERE b.userId = ? AND b.completed = 1
            GROUP BY b.game, sg.game_name, sg.image_url, sg.provider_name
            ORDER BY total_wagered DESC
        `, [userId]);

        // Get slot-specific analytics
        const [slotStats] = await sql.query(`
            SELECT 
                sg.game_name,
                sg.image_url,
                sg.provider_name,
                COUNT(*) as spins,
                SUM(b.amount) as total_wagered,
                SUM(b.winnings) as total_winnings,
                SUM(b.winnings - b.amount) as net_profit,
                AVG(b.amount) as avg_bet,
                MAX(b.winnings - b.amount) as biggest_win,
                COUNT(CASE WHEN b.winnings > b.amount THEN 1 END) as wins,
                COUNT(CASE WHEN b.winnings < b.amount THEN 1 END) as losses,
                MAX(b.createdAt) as last_played,
                (COUNT(CASE WHEN b.winnings > b.amount THEN 1 END) * 100.0 / COUNT(*)) as win_rate
            FROM bets b
            JOIN spinshield_games sg ON b.spinshield_game_id = sg.game_id_hash
            WHERE b.userId = ? AND b.completed = 1 AND b.game = 'slot'
            GROUP BY sg.game_name, sg.image_url, sg.provider_name
            ORDER BY total_wagered DESC
        `, [userId]);

        // Get favorite games (most played)
        const [favoriteGames] = await sql.query(`
            SELECT 
                b.game,
                COALESCE(sg.game_name, b.game) as display_name,
                sg.image_url,
                COUNT(*) as play_count,
                SUM(b.amount) as total_wagered,
                MAX(b.createdAt) as last_played
            FROM bets b
            LEFT JOIN spinshield_games sg ON b.spinshield_game_id = sg.game_id_hash
            WHERE b.userId = ? AND b.completed = 1
            GROUP BY b.game, sg.game_name, sg.image_url
            ORDER BY play_count DESC
            LIMIT 10
        `, [userId]);

        // Get recent activity by game type
        const [recentActivity] = await sql.query(`
            SELECT 
                DATE(b.createdAt) as date,
                b.game,
                COALESCE(sg.game_name, b.game) as display_name,
                COUNT(*) as bets,
                SUM(b.amount) as wagered,
                SUM(b.winnings - b.amount) as profit
            FROM bets b
            LEFT JOIN spinshield_games sg ON b.spinshield_game_id = sg.game_id_hash
            WHERE b.userId = ? AND b.completed = 1 AND b.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(b.createdAt), b.game, sg.game_name
            ORDER BY date DESC, wagered DESC
        `, [userId]);

        res.json({
            gameStats,
            slotStats,
            favoriteGames,
            recentActivity
        });

    } catch (error) {
        console.error('Error fetching game analytics:', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
});

router.get('/:id/possess', async (req, res) => {

    const userId = req.params.id;
    
    const [[user]] = await sql.query(`SELECT id, perms FROM users WHERE id = ? OR LOWER(username) = ?`, [userId, userId.toLowerCase()]);
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });

    if (user.perms >= req.user.perms) return res.status(400).json({ error: 'CANNOT_POSSESS_HIGHER_USER' });

    const jwt = generateJwtToken(user.id);

    res.cookie('jwt', jwt, { maxAge: expiresIn * 1000 });
    res.cookie('admjwt', getReqToken(req), { maxAge: expiresIn * 1000 });

    res.redirect('/');
    sendLog('admin', `[\`${req.user.id}\`] *${req.user.username}* possesed \`${userId}\`.`)

});

const defaultRolePermissions = {
    BOT: 0,
    USER: 0,
    MOD: 1,
    DEV: 2,
    ADMIN: 2,
    OWNER: 3
}

function nullableNumber(value) {
    return value === null || (typeof value === 'number' && value >= 0 && value <= 100000000);
}

router.post('/:id', [
    body('banned').optional().isBoolean().withMessage('BANNED_NOT_BOOLEAN'),
    body('rainBan').optional().isBoolean().withMessage('RAINBAN_NOT_BOOLEAN'),
    body('tipBan').optional().isBoolean().withMessage('TIPBAN_NOT_BOOLEAN'),
    body('accountLock').optional().isBoolean().withMessage('ACCOUNTLOCK_NOT_BOOLEAN'),
    body('sponsorLock').optional().isBoolean().withMessage('SPONSORLOCK_NOT_BOOLEAN'),
    body('leaderboardBan').optional().isBoolean().withMessage('LEADERBOARDBAN_NOT_BOOLEAN'),
    body('muteSeconds').optional().custom(nullableNumber).withMessage('MUTESECONDS_INVALID'),
    body('maxPerTip').optional().custom(nullableNumber).withMessage('MAXPERTIP_INVALID'),
    body('maxTipPerUser').optional().custom(nullableNumber).withMessage('MAXTIPPERUSER_INVALID'),
    body('rainTipAllowance').optional().custom(nullableNumber).withMessage('RAINTIPALLOWANCE_INVALID'),
    body('tipAllowance').optional().custom(nullableNumber).withMessage('TIPALLOWANCE_INVALID'),
    body('cryptoAllowance').optional().custom(nullableNumber).withMessage('CRYPTOALLOWANCE_INVALID'),
    body('balance').optional().isNumeric().withMessage('BALANCE_INVALID').isFloat({ min: 0.0, max: 10000000 }).withMessage('BALANCE_INVALID'),
    body('xp').optional().isNumeric().withMessage('XP_INVALID').isFloat({ min: 0.0, max: 100000000 }).withMessage('XP_INVALID'),
    body('unlinkDiscord').optional().isBoolean().withMessage('UNLINKDISCORD_NOT_BOOLEAN'),
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()[0].msg });
        }

        if (typeof req.body['muteSeconds'] === 'number') {
            req.body['mutedUntil'] = new Date(Date.now() + req.body['muteSeconds'] * 1000);
        } else if (req.body['muteSeconds'] === null) {
            req.body['mutedUntil'] = null;
        }

        if (req.body.perms !== undefined) {
            return res.status(400).json({ error: 'PERMS_NOT_ALLOWED' });
        }

        if (req.body.role !== undefined) {
            
            const newPerm = defaultRolePermissions[req.body.role];
            if (newPerm === undefined) {
                return res.status(400).json({ error: 'INVALID_ROLE' });
            }
            if (newPerm > req.user.perms) {
                return res.status(400).json({ error: 'CANNOT_SET_HIGHER_ROLE' });
            }
            req.body.perms = newPerm;
        }

        try {

            await doTransaction(async (connection, commit) => {

                const userId = req.params.id;
                const [[user]] = await connection.query('SELECT id, perms, role, username, balance FROM users WHERE id = ? FOR UPDATE', [userId]);
                if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });
        
                if (user.id != req.user.id && (user.role == 'BOT' || (req.user.perms < 4 && user.perms >= req.user.perms))) return res.status(400).json({ error: 'CANNOT_EDIT_USER' });
                if (req.body.banned && user.id == req.user.id) return res.status(400).json({ error: 'CANNOT_BAN_SELF' });
    
                const allowedFields = ['banned', 'rainBan', 'leaderboardBan', 'tipBan', 'accountLock', 'balance', 'sponsorLock', 'mutedUntil', 'maxPerTip', 'maxTipPerUser', 'rainTipAllowance', 'tipAllowance', 'cryptoAllowance', 'xp', 'role', 'perms'];
        
                const updatePairs = [];
                const values = [];
        
                for (let field of allowedFields) {
                    if (req.body[field] !== undefined) {
                        updatePairs.push(`${field} = ?`);
                        values.push(req.body[field]);
    
                        if (field == 'balance') {
                            const diff = roundDecimal(req.body[field] - user.balance);
                            if (diff) {
                                await connection.query('INSERT INTO transactions (userId, amount, type, method, methodId) VALUES (?, ?, ?, ?, ?)', [userId, Math.abs(diff), diff > 0 ? 'in' : 'out', 'admin', null]);
                                io.to(userId).emit('balance', 'set', req.body[field]);
                            }
                        }
    
                    }
                }
        
                if (req.body.unlinkDiscord) {
                    await connection.query('DELETE FROM discordAuths WHERE userId = ?', [user.id]);
                } else if (!updatePairs.length) {
                    return res.status(400).json({ error: 'NO_VALID_FIELDS' });
                } else {
                    values.push(userId);
                    const updateQuery = `UPDATE users SET ${updatePairs.join(', ')} WHERE id = ?`;
                    await connection.query(updateQuery, values);
                }
    
                if (req.body.banned !== undefined) {
                    if (req.body.banned) {
                        bannedUsers.add(userId);
                    } else {
                        bannedUsers.delete(userId);
                    }
                }
    
                if (req.body.sponsorLock !== undefined) {
                    if (req.body.sponsorLock) {
                        await connection.query('DELETE FROM affiliates WHERE userId = ?', [userId]);
                        sponsorLockedUsers.add(userId);
                    } else {
                        sponsorLockedUsers.delete(userId);
                    }
                }
    
                await commit();
                res.json({ success: true });
    
                sendLog('admin', `[\`${req.user.id}\`] *${req.user.username}* edited *${user.username}* (\`${userId}\`).\n\`\`\`\n${Object.keys(req.body).map(key => `${key} = ${req.body[key]}`).join('\n')}\n\`\`\``);
            
            });

        } catch (e) {
            console.error(e);
            res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
        }
    }
]);

// Create a new user (for admin only)
router.post('/', [
    body('username').isString().trim().isLength({ min: 3, max: 20 }).withMessage('USERNAME_INVALID'),
    body('password').isString().isLength({ min: 8 }).withMessage('PASSWORD_TOO_SHORT'),
    body('balance').optional().isNumeric().withMessage('BALANCE_NOT_NUMERIC'),
    body('role').optional().isString().isIn(['USER', 'MOD', 'DEV', 'ADMIN', 'BOT']).withMessage('ROLE_INVALID'),
    body('email').optional().isEmail().withMessage('EMAIL_INVALID')
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    if (req.body.role) {
        const newPerm = defaultRolePermissions[req.body.role];
        if (newPerm === undefined) {
            return res.status(400).json({ error: 'INVALID_ROLE' });
        }
        // Prevent creating a user with higher permissions than the admin creating them
        if (newPerm > req.user.perms) {
            return res.status(400).json({ error: 'CANNOT_SET_HIGHER_ROLE' });
        }
    }

    try {
        await doTransaction(async (connection, commit) => {
            // Check if username already exists
            const [[existingUser]] = await connection.query('SELECT id FROM users WHERE LOWER(username) = LOWER(?)', [req.body.username]);
            if (existingUser) {
                return res.status(400).json({ error: 'USERNAME_TAKEN' });
            }

            // Check if email already exists if provided
            if (req.body.email) {
                const [[existingEmail]] = await connection.query('SELECT id FROM users WHERE email = ?', [req.body.email]);
                if (existingEmail) {
                    return res.status(400).json({ error: 'EMAIL_TAKEN' });
                }
            }

            // Generate a new user ID
            const userId = ulid();
            
            // Create the user with provided details
            const balance = req.body.balance || 0;
            const role = req.body.role || 'USER';
            const perms = defaultRolePermissions[role];
            
            // Import bcrypt for password hashing
            const bcrypt = require('bcrypt');
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

            await connection.query(
                'INSERT INTO users (id, username, passwordHash, balance, role, perms, email, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
                [userId, req.body.username, hashedPassword, balance, role, perms, req.body.email || null]
            );

            // Add initial balance transaction if balance > 0
            if (balance > 0) {
                await connection.query(
                    'INSERT INTO transactions (userId, amount, type, method, methodId) VALUES (?, ?, ?, ?, ?)',
                    [userId, balance, 'in', 'admin_create', null]
                );
            }

            await commit();
            
            // Log the user creation
            sendLog('admin', `[\`${req.user.id}\`] *${req.user.username}* created a new user *${req.body.username}* (\`${userId}\`) with role ${role} and balance ${balance}.`);
            
            // Return the created user info
            res.status(201).json({
                success: true,
                user: {
                    id: userId,
                    username: req.body.username,
                    role: role,
                    balance: balance,
                    xp: 0
                }
            });
        });
    } catch (e) {
        console.error('Error creating user:', e);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
});

// Get paginated transactions for a user with separation of real vs admin transactions
router.get('/:id/transactions', async (req, res) => {
    try {
        if (!isValid(req.params.id)) return res.status(400).json({ error: 'INVALID_ID' });
        const userId = req.params.id;

        let page = parseInt(req.query.page);
        page = !isNaN(page) && page > 0 ? page : 1;

        const resultsPerPage = 50;
        const offset = (page - 1) * resultsPerPage;

        // Get total count for all transactions
        const [[{ total }]] = await sql.query(`
            SELECT COUNT(*) as total 
            FROM transactions 
            WHERE userId = ?
        `, [userId]);

        if (!total) return res.json({ page: 1, pages: 0, total: 0, data: [], statistics: {} });

        const pages = Math.ceil(total / resultsPerPage);
        if (page > pages) return res.status(404).json({ error: 'PAGE_NOT_FOUND' });

        // Get paginated transactions
        const [transactions] = await sql.query(`
            SELECT id, amount, type, method, methodId, methodDisplay, createdAt
            FROM transactions 
            WHERE userId = ? 
            ORDER BY createdAt DESC 
            LIMIT ? OFFSET ?
        `, [userId, resultsPerPage, offset]);

        // Get comprehensive statistics separating real vs admin transactions
        const [[realTransactionStats]] = await sql.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'in' AND method != 'admin' THEN amount ELSE 0 END), 0) as realDeposited,
                COALESCE(SUM(CASE WHEN type = 'out' AND method != 'admin' THEN amount ELSE 0 END), 0) as realWithdrawn,
                COUNT(CASE WHEN type = 'in' AND method != 'admin' THEN 1 END) as realDepositCount,
                COUNT(CASE WHEN type = 'out' AND method != 'admin' THEN 1 END) as realWithdrawCount
            FROM transactions 
            WHERE userId = ?
        `, [userId]);

        const [[adminTransactionStats]] = await sql.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'in' AND method = 'admin' THEN amount ELSE 0 END), 0) as adminDeposited,
                COALESCE(SUM(CASE WHEN type = 'out' AND method = 'admin' THEN amount ELSE 0 END), 0) as adminWithdrawn,
                COUNT(CASE WHEN type = 'in' AND method = 'admin' THEN 1 END) as adminDepositCount,
                COUNT(CASE WHEN type = 'out' AND method = 'admin' THEN 1 END) as adminWithdrawCount
            FROM transactions 
            WHERE userId = ?
        `, [userId]);

        const [[allTransactionStats]] = await sql.query(`
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END), 0) as totalDeposited,
                COALESCE(SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) as totalWithdrawn,
                COUNT(CASE WHEN type = 'in' THEN 1 END) as totalDepositCount,
                COUNT(CASE WHEN type = 'out' THEN 1 END) as totalWithdrawCount
            FROM transactions 
            WHERE userId = ?
        `, [userId]);

        // Get method breakdown for real transactions
        const [methodBreakdown] = await sql.query(`
            SELECT 
                method,
                type,
                COUNT(*) as count,
                SUM(amount) as total_amount
            FROM transactions 
            WHERE userId = ? AND method NOT LIKE '%admin%'
            GROUP BY method, type
            ORDER BY total_amount DESC
        `, [userId]);

        res.json({
            page,
            pages,
            total,
            data: transactions,
            statistics: {
                real: realTransactionStats,
                admin: adminTransactionStats,
                all: allTransactionStats,
                methodBreakdown
            }
        });

    } catch (error) {
        console.error('Error fetching user transactions:', error);
        res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
    }
});

module.exports = router;