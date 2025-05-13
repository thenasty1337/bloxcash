const io = require('./server');
const { sql } = require('../database');
const { rains } = require('./rain');
const { joinChat, sendMessage } = require('./chat');
const { sendOnlineUsers, sendSystemMessage } = require('./chat/functions');
const { cachedDrops: caseDrops } = require('../routes/games/cases/functions');
const { getBattle, cachedBattles, minifyBattle } = require('../routes/games/battles/functions');
const { roulette } = require('../routes/games/roulette/functions');
const { crash } = require('../routes/games/crash/functions');
const { cachedCoinflips } = require('../routes/games/coinflip/functions');
const { getBets, emitTotalWagered } = require('./bets');
const passport = require('passport');
const { jackpot } = require('../routes/games/jackpot/functions');
const { discordClient, discordIds } = require('../discord/index');
const { rewards: surveysRewards } = require('../routes/surveys/functions');

// Wrap Express middleware for Socket.IO
const wrap = middleware => (socket, next) => {
    // Create a dummy response object
    const res = {
        setHeader: () => {},
        getHeader: () => {},
        writeHead: () => {},
        end: () => {}
    };
    
    // Handle session middleware properly
    middleware(socket.request, res, () => {
        next();
    });
};

module.exports = (ioInstance, sessionMiddleware) => {
    // Important: Clear any previous middleware
    ioInstance.use((socket, next) => {
        // Ensure cookies are parsed
        if (socket.request.headers.cookie) {
            console.log("Socket has cookies:", socket.request.headers.cookie.substring(0, 30) + "...");
        } else {
            console.log("Socket has NO cookies");
        }
        next();
    });
    
    // Apply session middleware
    ioInstance.use(wrap(sessionMiddleware));
    ioInstance.use(wrap(passport.initialize()));
    ioInstance.use(wrap(passport.session()));

    // Authentication check middleware for sockets
    ioInstance.use((socket, next) => {
        // Log the full user object for debugging
        console.log("Socket.request.user:", socket.request.user);
        
        // Also check the session explicitly
        if (socket.request.session && socket.request.session.passport) {
            console.log("Socket session passport data:", socket.request.session.passport);
        } else {
            console.log("Socket has no session passport data");
        }
        
        if (socket.request.user) {
            socket.userId = socket.request.user.id;
            console.log(`Socket auth middleware: User authenticated as ID ${socket.userId}`);
            next();
        } else {
            socket.userId = null;
            console.log("Socket auth middleware: No authenticated user");
            next();
        }
    });

    process.on('SIGTERM', cleanupAndExit);
    process.on('SIGINT', cleanupAndExit);

    function cleanupAndExit() {
        const m = 'Server is restarting, you will get disconnected for a few seconds..';
        ioInstance.emit('toast', 'info', m, {
            icon: '⚠️',
            duration: 10000
        });
        sendSystemMessage(ioInstance, m);
        process.exit(0);
    }

    async function newSocket(socket) {
       
        sendOnlineUsers(socket);
        emitTotalWagered(0, socket);

        if (rains.system) {
            const endsIn = rains.system.createdAt.valueOf() + rains.systemRainDuration - Date.now();
            const joined = socket.userId && rains.system.users.includes(socket.userId);
            socket.emit('rain', rains.system.amount, endsIn, rains.system.joinable, joined);
        }

        if (rains.user) {
            const endsIn = rains.user.createdAt.valueOf() + rains.joinTime - Date.now();
            const joined = socket.userId && rains.user.users.includes(socket.userId);
            socket.emit('rain:user', rains.user.amount, endsIn, rains.user.host, joined);
        }

        socket.emit('chat:emojis', discordClient.guilds.cache.get(discordIds.guild)?.emojis?.cache.map(e => {
            return {
                name: e.name,
                url: e.url
            }
        }) || []);

    }

    ioInstance.on('connection', function(socket) {
        console.log('Socket connected. Authenticated user ID:', socket.userId);

        if (socket.userId) {
            socket.emit('auth', { success: true, userId: socket.userId });
            socket.join(socket.userId);
        } else {
            socket.emit('auth', { error: 'UNAUTHENTICATED' });
        }

        newSocket(socket);

        socket.on('auth', async function(userData) {
            // Log auth attempt for debugging
            console.log('Socket auth attempt:', { 
                hasUser: socket.request.user ? true : false,
                userId: socket.request.user?.id || null,
                socketUserId: socket.userId,
                manualUserId: userData?.userId
            });

            // First try to authenticate with session
            if (socket.request.user && socket.request.user.id) {
                socket.userId = socket.request.user.id;
                socket.emit('auth', { success: true, userId: socket.userId });
                if (!socket.rooms.has(socket.userId)) {
                    socket.join(socket.userId);
                }
                console.log('Socket authenticated with session for user:', socket.userId);
                return;
            }
            
            // SECURITY NOTE: We should NOT allow manual authentication with just a user ID
            // This would create a security vulnerability where anyone could impersonate any user
            // We only authenticate via the session, which has already been verified by Passport
            
            // If we reach here, authentication failed
            socket.emit('auth', { error: 'UNAUTHENTICATED' });
            console.log('Socket authentication failed: No user in request or manual auth');
        });

        socket.on('bets:subscribe', async (type) => {

            const bets = await getBets(type, socket.userId);
            if (!bets) return;

            socket.join(`bets:${type == 'me' ? socket.userId : type}`);
            socket.emit('bets', type, bets);

        });

        socket.on('bets:unsubscribe', (type) => {
            socket.leave(`bets:${type}`);
        });

        socket.on('cases:subscribe', async () => {

            socket.join('cases');
            socket.emit('cases:drops:all', caseDrops.all);
            socket.emit('cases:drops:top', caseDrops.top);

        });

        socket.on('cases:unsubscribe', () => {
            socket.leave('cases');
        });

        socket.on('surveys:subscribe', async () => {

            socket.join('surveys');
            socket.emit('surveys:rewards:all', surveysRewards.all);
            socket.emit('surveys:rewards:top', surveysRewards.top);

        });

        socket.on('surveys:unsubscribe', () => {
            socket.leave('surveys');
        });

        socket.on('coinflip:subscribe', () => {

            socket.join('coinflips');
            socket.emit('coinflips:push', Object.values(cachedCoinflips), new Date());

        });

        socket.on('coinflip:unsubscribe', () => {
            socket.leave('coinflips');
        });

        socket.on('battles:subscribe', (battleId, privKey) => {

            if (battleId) {
                subscribeToBattle(socket, battleId, privKey)
            } else {
                socket.join('battles');

                const battles = [];

                for (const battleId in cachedBattles) {

                    const battle = cachedBattles[battleId];
                    if (!battle.privKey) {
                        battles.push(minifyBattle(battle));
                        continue;
                    }

                    if (battle.players.some(e => e.id == socket.userId)) {
                        battles.push(minifyBattle(battle));
                    }

                }

                socket.emit('battles:push', battles);

            }

        });

        socket.on('battles:unsubscribe', (battleId) => {

            if (battleId) {
                socket.leave(`battle:${battleId}`);
            } else {
                socket.leave('battles');
            }

        });

        socket.on('roulette:subscribe', () => {
            
            const round = {
                id: roulette.round.id,
                result: null,
                color: null,
                createdAt: roulette.round.createdAt,
                rolledAt: roulette.round.rolledAt,
                status: 'created'
            };
            
            if (round.rolledAt) {
                round.status = 'rolling';
                round.result = roulette.round.result;
                round.color = roulette.round.color;
            }

            socket.join('roulette');
            socket.emit('roulette:set', {
                serverTime: new Date(),
                ...roulette,
                round
            });

        });

        socket.on('roulette:unsubscribe', () => {
            socket.leave('roulette');
        });

        socket.on('jackpot:subscribe', () => {
            
            socket.join('jackpot');
            socket.emit('jackpot:set', {
                serverTime: new Date(),
                ...jackpot
            });

        });

        socket.on('jackpot:unsubscribe', () => {
            socket.leave('jackpot');
        });

        socket.on('crash:subscribe', () => {

            const round = {
                id: crash.round.id,
                status: 'created',
                multiplier: 1,
                serverSeed: crash.round.serverSeed,
                createdAt: crash.round.createdAt,
                startedAt: null,
                endedAt: null
            }

            if (crash.round.startedAt) {
                round.status = 'started';
                round.startedAt = crash.round.startedAt;
                round.multiplier = crash.round.currentMultiplier;
            }

            if (crash.round.endedAt) {
                round.status = 'ended';
                round.endedAt = crash.round.endedAt;
                round.multiplier = crash.round.crashPoint;
            }

            socket.join('crash');
            socket.emit('crash:set', {
                serverTime: new Date(),
                ...crash,
                bets: crash.bets.map(e => ({
                    ...e,
                    user: {
                        ...e.user,
                        anon: undefined
                    },
                    autoCashoutPoint: undefined
                })),
                round
            });

        });

        socket.on('crash:unsubscribe', () => {
            socket.leave('crash');
        });

        socket.on('chat:join', (channel) => {

            joinChat(socket, channel);

        });

        socket.on('chat:sendMessage', (message, replyTo = null) => sendMessage(socket, message, replyTo));

    });

    async function subscribeToBattle(socket, battleId, privKey = null) {

        const battle = await getBattle(battleId, privKey);
        if (!battle) return socket.emit('toast', 'error', 'Battle not found');
        socket.join(`battle:${battleId}`);
        socket.emit('battle', {
            serverTime: new Date(),
            ...battle
        });

    }

    setInterval(() => sendOnlineUsers(ioInstance, true), 10000);
};