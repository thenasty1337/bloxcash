const express = require('express');
const router = express.Router();

const { sql, doTransaction } = require('../../database');

const { isAuthed, apiLimiter } = require('../auth/functions');
const { roundDecimal, getUserLevel, sendLog } = require('../../utils');
const io = require('../../socketio/server');
const { enabledFeatures, checkAccountLock } = require('../admin/config');
const { getUserRakebacks } = require('./rakeback/functions');

const affiliateRoute = require('./affiliate');
const rakebackRoute = require('./rakeback');
const notificationsRoute = require('./notifications');
const settingsRoute = require('./settings');

router.use('/affiliate', affiliateRoute);
router.use('/rakeback', rakebackRoute);
router.use('/notifications', notificationsRoute);
router.use('/settings', settingsRoute);

router.get('/', isAuthed, async (req, res) => {

    const [[user]] = await sql.query('SELECT id, role, username, avatar, balance, xp, anon FROM users WHERE id = ?', [req.user.id]);

    if (!user) {
        console.error(`User not found for authenticated request, userId: ${req.user.id}`);
        return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'User data could not be retrieved after authentication.' });
    }

    const [[{ notifications }]] = await sql.query('SELECT COUNT(*) as notifications FROM notifications WHERE userId = ? AND isRead = 0', [req.user.id]);
    user.notifications = notifications;

    const rakebacks = await getUserRakebacks(req.user.id);
    user.rewards = Object.values(rakebacks).filter(e => e.canClaim).length;

    res.json(user);

});

router.post('/anon', isAuthed, async (req, res) => {

    const enabled = req.body.enable;
    if (typeof enabled !== 'boolean') return res.status(400).json({ error: 'INVALID_ENABLED' });

    await sql.query('UPDATE users SET anon = ? WHERE id = ?', [enabled, req.user.id]);
    res.json({ success: true });

});

router.post('/mentions', isAuthed, async (req, res) => {

    const enabled = req.body.enable;
    if (typeof enabled !== 'boolean') return res.status(400).json({ error: 'INVALID_ENABLED' });

    await sql.query('UPDATE users SET mentionsEnabled = ? WHERE id = ?', [enabled, req.user.id]);
    res.json({ success: true });

});

const resultsPerPage = 10;
const allowedTypes = ['deposit', 'withdraw', 'in', 'out'];
const allowedMethods = ['rakeback', 'tip', 'promo', 'affiliate', 'giftcard', 'crypto', 'rain'];

router.get('/transactions', isAuthed, async (req, res) => {

    let page = parseInt(req.query.page);
    page = !isNaN(page) && page > 0 ? page : 1;

    const offset = (page - 1) * resultsPerPage;

    const args = [req.user.id];
    let where = 'WHERE userId = ?';

    if (req.query.types) {
        const types = req.query.types.split(',');
        if (types.some(type => !allowedTypes.includes(type))) return res.status(400).json({ error: 'INVALID_TYPE' });
        where += ` AND type IN (${types.map(() => '?').join(',')})`;
        args.push(...types);
    }

    if (req.query.methods) {
        const methods = req.query.methods.split(',');
        if (methods.some(method => !allowedMethods.includes(method))) return res.status(400).json({ error: 'INVALID_METHOD' });
        where += ` AND method IN (${methods.map(() => '?').join(',')})`;
        args.push(...methods);
    }

    const [[{ total }]] = await sql.query(`SELECT COUNT(*) as total FROM transactions ${where}`, args);
    if (!total) return res.json({ page: 1, pages: 0, total: 0, data: [] });

    const pages = Math.ceil(total / resultsPerPage);

    if (page > pages) return res.status(404).json({ error: 'PAGE_NOT_FOUND' });
    const [data] = await sql.query(`SELECT amount, type, method, methodId, createdAt FROM transactions ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, [...args, resultsPerPage, offset]);
    
    res.json({
        page,
        pages,
        total,
        data
    });

});

const allowedGames = ['battle', 'case', 'coinflip', 'crash', 'jackpot', 'roulette'];

router.get('/bets', isAuthed, async (req, res) => {

    let page = parseInt(req.query.page);
    page = !isNaN(page) && page > 0 ? page : 1;

    const offset = (page - 1) * resultsPerPage;

    const args = [req.user.id];
    let where = 'WHERE userId = ?';

    if (req.query.games) {
        const games = req.query.games.split(',');
        if (games.some(game => !allowedGames.includes(game))) return res.status(400).json({ error: 'INVALID_GAME' });
        where += ` AND game IN (${games.map(() => '?').join(',')})`;
        args.push(...games);
    }

    const [[{ total }]] = await sql.query(`SELECT COUNT(*) as total FROM bets ${where}`, args);
    if (!total) return res.json({ page: 1, pages: 0, total: 0, data: [] });

    const pages = Math.ceil(total / resultsPerPage);

    if (page > pages) return res.status(404).json({ error: 'PAGE_NOT_FOUND' });
    const [data] = await sql.query(`SELECT amount, winnings, game, gameId, completed, createdAt FROM bets ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, [...args, resultsPerPage, offset]);
    
    res.json({
        page,
        pages,
        total,
        data
    });

});

router.get('/:id/profile', async (req, res) => {

    const userId = parseInt(req.params.id);
    if (!userId || isNaN(userId)) return res.status(400).json({ error: 'INVALID_USER_ID' });

    const [[user]] = await sql.query('SELECT id, username, xp, avatar FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });

    const [[wagered]] = await sql.query('SELECT SUM(amount) AS wagered FROM bets WHERE userId = ? AND completed = 1', [userId]);
    user.wagered = wagered.wagered || 0;

    const [[result]] = await sql.query(`
        SELECT 
        SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) as deposits,
        SUM(CASE WHEN type = 'withdraw' THEN amount ELSE 0 END) as withdraws
        FROM transactions 
        WHERE userId = ? AND type IN ('deposit', 'withdraw')
    `, [userId]);
  
    user.deposits = result.deposits || 0;
    user.withdraws = result.withdraws || 0;

    res.json(user);

});

router.post('/promo', [isAuthed, apiLimiter], async (req, res) => {

    if (!enabledFeatures.promoCodes) return res.status(400).json({ error: 'DISABLED' });

    const code = req.body.code;
    if (!code || typeof code != 'string' || code.length < 2 || code.length > 20) return res.status(400).json({ error: 'INVALID_CODE' });

    try {

        await doTransaction(async (connection, commit) => {

            const [[promo]] = await connection.query('SELECT id, code, amount, totalUses, currentUses, minLvl FROM promoCodes WHERE code = ? FOR UPDATE', [code]);
            if (!promo) return res.status(404).json({ error: 'CODE_NOT_FOUND' });
            if (promo.totalUses && promo.currentUses >= promo.totalUses) return res.status(400).json({ error: 'CODE_EXPIRED' });
    
            const [[user]] = await connection.query('SELECT id, username, balance, xp FROM users WHERE id = ? FOR UPDATE', [req.user.id]);
    
            if (promo.minLvl) {
                const lvl = getUserLevel(user.xp);
                if (lvl < promo.minLvl) return res.status(400).json({ error: 'INSUFFICIENT_LEVEL' });
            }
    
            const [[userPromo]] = await connection.query('SELECT id FROM promoCodeUses WHERE userId = ? AND promoCodeId = ?', [req.user.id, promo.id]);
            if (userPromo) return res.status(400).json({ error: 'ALREADY_USED_CODE' });
    
            await connection.query('UPDATE users SET balance = balance + ? WHERE id = ?', [promo.amount, user.id]);
            await connection.query('UPDATE promoCodes SET currentUses = currentUses + 1 WHERE id = ?', [promo.id]);
            const [result] = await connection.query('INSERT INTO promoCodeUses (userId, promoCodeId) VALUES (?, ?)', [user.id, promo.id]);
            await connection.query('INSERT INTO transactions (userId, amount, type, method, methodId) VALUES (?, ?, ?, ?, ?)', [user.id, promo.amount, 'in', 'promo', result.insertId]);
    
            await commit();
    
            sendLog('promo', `Promo code \`${promo.code}\` of :robux: R$${promo.amount} redeemed by *${user.username}* (\`${user.id}\`) - Uses: \`${promo.currentUses + 1}/${promo.totalUses}\``);
            io.to(user.id).emit('balance', 'set', roundDecimal(user.balance + promo.amount))
            res.json({ success: true });

        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'INTERNAL_ERROR' });
    }

});

module.exports = router;