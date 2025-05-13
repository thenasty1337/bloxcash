const express = require('express');
const router = express.Router();

const { sql } = require('../../database');
const io = require('../../socketio/server');

const { isAuthed, apiLimiter } = require('../auth/functions');

router.get('/', [isAuthed, apiLimiter], async (req, res) => {

    const [notifications] = await sql.query('SELECT id, type, content FROM notifications WHERE userId = ? AND isRead = 0 ORDER BY id DESC', [req.user.id]);
    await sql.query('UPDATE notifications SET isRead = 1 WHERE userId = ?', [req.user.id]);

    notifications.forEach(e => e.content = JSON.parse(e.content));
    io.to(req.user.id).emit('notifications', 'set', 0);
    res.json(notifications);

});

router.delete('/:id', [isAuthed], async (req, res) => {

    const [[notification]] = await sql.query('SELECT id FROM notifications WHERE id = ? AND userId = ? AND deleted = 0', [req.params.id, req.user.id]);
    if (!notification) return res.status(404).json({ error: 'NOTIFICATION_NOT_FOUND' });

    await sql.query('UPDATE notifications SET deleted = 1 WHERE id = ?', [notification.id]);
    res.json({ success: true });

});

module.exports = router;