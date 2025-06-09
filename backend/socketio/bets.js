const io = require('./server');
const { sql } = require('../database');
const { roundDecimal, mapUser, sendLog } = require('../utils');
const { rains } = require('./rain');
const { sponsorLockedUsers } = require('../routes/admin/config');
const { cachedRakebacks } = require('../routes/user/rakeback/functions');

const cachedBets = {
    all: [],
    high: [],
    lucky: []
}

const highBetAmount = 1000;
const luckyBetMultiplier = 10;
const maxLength = 10;

async function cacheBets() {

    const [all] = await sql.query(`
        SELECT 
            bets.amount, bets.winnings, bets.game, bets.createdAt, bets.provider, bets.spinshield_game_id,
            users.id, users.username, users.xp, users.role, users.anon, users.avatar,
            sg.game_name, sg.image_url, sg.provider_name
        FROM bets
        INNER JOIN users ON bets.userId = users.id 
        LEFT JOIN spinshield_games sg ON bets.spinshield_game_id = sg.game_id_hash
        WHERE bets.completed = 1 ORDER BY bets.id DESC LIMIT ${maxLength}
    `);

    // Debug: Log what games we're getting
    const gameTypes = all.reduce((acc, bet) => {
        acc[bet.game] = (acc[bet.game] || 0) + 1;
        return acc;
    }, {});
    console.log('📊 Cached bets by game type:', gameTypes);

    cachedBets.all = all.map(e => mapBet(e));

    const [high] = await sql.query(`
        SELECT 
            bets.amount, bets.winnings, bets.game, bets.createdAt, bets.provider, bets.spinshield_game_id,
            users.id, users.username, users.xp, users.role, users.anon, users.avatar,
            sg.game_name, sg.image_url, sg.provider_name
        FROM bets
        INNER JOIN users ON bets.userId = users.id 
        LEFT JOIN spinshield_games sg ON bets.spinshield_game_id = sg.game_id_hash
        WHERE bets.completed = 1 AND bets.amount > ${highBetAmount} ORDER BY bets.id DESC LIMIT ${maxLength}
    `);

    cachedBets.high = high.map(e => mapBet(e));

    const [lucky] = await sql.query(`
        SELECT 
            bets.amount, bets.winnings, bets.game, bets.createdAt, bets.provider, bets.spinshield_game_id,
            users.id, users.username, users.xp, users.role, users.anon, users.avatar,
            sg.game_name, sg.image_url, sg.provider_name
        FROM bets
        INNER JOIN users ON bets.userId = users.id 
        LEFT JOIN spinshield_games sg ON bets.spinshield_game_id = sg.game_id_hash
        WHERE bets.completed = 1 AND bets.winnings / bets.amount > ${luckyBetMultiplier}
        ORDER BY bets.id DESC LIMIT ${maxLength}
    `);

    cachedBets.lucky = lucky.map(e => mapBet(e));

    // Debug: Log socket emissions
    console.log('📡 Emitting cached bets to socket rooms');
    console.log('  - bets:all room has', io.sockets.adapter.rooms.get('bets:all')?.size || 0, 'clients');
    console.log('  - bets:high room has', io.sockets.adapter.rooms.get('bets:high')?.size || 0, 'clients');
    console.log('  - bets:lucky room has', io.sockets.adapter.rooms.get('bets:lucky')?.size || 0, 'clients');

    io.to('bets:all').emit('bets', 'all', cachedBets.all);
    io.to('bets:high').emit('bets', 'high', cachedBets.high);
    io.to('bets:lucky').emit('bets', 'lucky', cachedBets.lucky);

}

function mapBet(e) {
    const bet = {
        user: e.anon ? null : mapUser(e),
        amount: e.amount,
        payout: e.winnings,
        game: e.game,
        createdAt: e.createdAt
    };

    // Add SpinShield game details if available
    if (e.provider === 'spinshield' && e.game_name) {
        bet.gameDetails = {
            name: e.game_name,
            image: e.image_url,
            provider: e.provider_name || 'SpinShield',
            gameId: e.spinshield_game_id
        };
    }

    return bet;
}

const gamesNames = {
    crash: 'Crash',
    roulette: 'Roulette',
    case: 'Cases',
    coinflip: 'Coinflip',
    jackpot: 'Jackpot',
    battle: 'Battles',
    slot: 'Slots',
    mines: 'Mines'
}

async function newBets(bets) {

    // Debug: Log incoming bets
    console.log('🎰 newBets called with:', bets.map(b => ({ 
        game: b.game, 
        amount: b.amount, 
        payout: b.payout, 
        user: b.user?.username,
        hasGameDetails: !!b.gameDetails,
        gameName: b.gameDetails?.name 
    })));

    const allBets = [];
    const highBets = [];
    const luckyBets = [];
    const userBets = {};

    let total = 0;
    let totalEdge = 0;

    const createdAt = new Date();

    const logsEmbeds = [];
    const highLogsEmbeds = [];

    const sponsorGame = bets.some(bet => sponsorLockedUsers.has(bet.user.id));

    for (const { user, amount, payout, game, edge, gameDetails } of bets) {

        const countsTowardsRewards = !sponsorLockedUsers.has(user.id) && user.role == 'USER';

        if (!(sponsorGame && ['jackpot', 'coinflip', 'battle'].includes(game)) && countsTowardsRewards) {
            if (edge !== undefined) {
                totalEdge += edge;
            } else {
                totalEdge += roundDecimal(amount * 0.05);
            }
        }

        const bet = {
            user: user.anon ? null : mapUser(user),
            amount,
            payout,
            game,
            createdAt,
            gameDetails // Preserve game details for slots
        };

        if (countsTowardsRewards) total += amount;

        allBets.push(bet);
        cachedBets.all.unshift(bet);
        if (cachedBets.all.length > maxLength) cachedBets.all.pop();

        if (bet.amount > highBetAmount) {
            highBets.push(bet);
            cachedBets.high.unshift(bet);
            if (cachedBets.high.length > maxLength) cachedBets.high.pop();
        }

        if (bet.payout / bet.amount > luckyBetMultiplier) {
            luckyBets.push(bet);
            cachedBets.lucky.unshift(bet);
            if (cachedBets.lucky.length > maxLength) cachedBets.lucky.pop();
        }

        if (!userBets[user.id]) {
            userBets[user.id] = [];
        }

        userBets[user.id].push({
            ...bet,
            user: bet.user || mapUser(user)
        });

        delete cachedRakebacks[user.id];

        const embed = {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*New bet*\n*User*: <https://www.roblox.com/users/${user.id}|${user.username}> - \`${user.id}\`\n*Game*: \`${gamesNames[bet.game]}\`\n*Amount*: :robux: R$${bet.amount}\n*Payout*: :robux: R$${bet.payout} \`(${roundDecimal(bet.payout / bet.amount, 3)}x)\``
            },
            "accessory": {
                "type": "image",
                "image_url": `${process.env.BASE_URL}/user/${user.id}/img`,
                "alt_text": `${user.username}'s avatar`
            }
        };

        // logsEmbeds.push(embed);

        if (bet.amount > highBetAmount) {
            highLogsEmbeds.push(embed);
        }

    }

    io.to('bets:all').emit('bets', 'all', allBets);
    if (highBets.length > 0) io.to('bets:high').emit('bets', 'high', highBets);
    if (luckyBets.length > 0) io.to('bets:lucky').emit('bets', 'lucky', luckyBets);

    for (const userId in userBets) {
        io.to(`bets:${userId}`).emit('bets', 'me', userBets[userId]);
    }

    if (logsEmbeds.length > 0) sendLog('bets', { blocks: logsEmbeds });
    if (highLogsEmbeds.length > 0) sendLog('highBets', { blocks: highLogsEmbeds });

    emitTotalWagered(total);

    const rainAmount = roundDecimal(totalEdge * 0.02);
    if (rainAmount < 0.01) return;

    const rain = rains.system;
    if (!rain || rain.ended) return;

    await sql.query('UPDATE rains SET amount = amount + ? WHERE id = ?', [rainAmount, rain.id]);
    rain.amount = roundDecimal(rain.amount + rainAmount);
    io.emit('rain:pot', rain.amount);

}

async function getBets(type, userId) {

    if (cachedBets[type]) return cachedBets[type];

    if (type == 'me') {

        if (!userId) return false;

        const [[user]] = await sql.query('SELECT id, username, xp, role, avatar FROM users WHERE id = ?', [userId]);
        if (!user) return false;

        const [bets] = await sql.query(`
            SELECT 
                bets.amount, bets.winnings, bets.game, bets.createdAt, bets.provider, bets.spinshield_game_id,
                sg.game_name, sg.image_url, sg.provider_name
            FROM bets
            LEFT JOIN spinshield_games sg ON bets.spinshield_game_id = sg.game_id_hash
            WHERE bets.userId = ? AND bets.completed = 1 ORDER BY bets.id DESC LIMIT 10
        `, [userId]);
        
        const formattedBets = bets.map(bet => mapBet({ ...bet, ...user }));
        return formattedBets;
        
    } else {
        return false;
    }

}

let totalWagered = false;
async function emitTotalWagered(amountToIncrease = 0, socket = io) {

    if (totalWagered === false) {
        const [[result]] = await sql.query(`
        SELECT SUM(amount) as totalWagered FROM bets JOIN users ON bets.userId=users.id
        WHERE bets.completed = 1 AND users.sponsorLock = 0 AND users.role = 'USER';
        `);
        totalWagered = result.totalWagered || 0;
    }

    if (amountToIncrease) totalWagered += amountToIncrease;

    socket.emit('totalWagered', roundDecimal(totalWagered));
    return totalWagered;

}


// Periodically refresh cached bets to ensure slots and other completed bets appear
setInterval(async () => {
    try {
        await cacheBets();
    } catch (error) {
        console.error('❌ Error refreshing cached bets:', error);
    }
}, 10000); // Refresh every 10 seconds

module.exports = {
    cacheBets,
    getBets,
    newBets,
    emitTotalWagered
}