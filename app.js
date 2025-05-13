require('dotenv').config();
// console.log('COINPAYMENTS_KEY from env:', process.env.COINPAYMENTS_KEY); // Debug line removed

const express = require('express');
const nocache = require("nocache");
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const rfs = require('rotating-file-stream');
const io = require('./socketio/server');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { sql } = require('./database');
const cors = require('cors');

const app = express();
app.disable('x-powered-by');

// --- CORS Configuration ---
const corsOptions = {
  origin: process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : /* Add your production frontend URL here */ true,
  credentials: true, // Important for cookies/sessions
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// Handle preflight requests for all routes
app.options('*', cors(corsOptions));
// --- End CORS Configuration ---

app.set('view engine', 'ejs');
app.use('/public', express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev', {
        skip: (req, res) => req.url.endsWith('/img')
    }));
}

morgan.token('ip', function(req, res) {
    return req.headers['cf-connecting-ip']
});

morgan.token('user-agent', function(req, res) {
    return req.headers['user-agent']
});

const logDirectory = path.join(__dirname, 'logs');

const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: logDirectory,
    size: "10M",
    // compress: 'gzip'
});

app.use(morgan('[:date[clf]] :ip :method :url :status :response-time ms - :user-agent', {
    stream: accessLogStream,
    skip: (req, res) => req.url.endsWith('/img')
}));

app.use(bodyParser.json({
    verify: function (req, res, buf, encoding) {
        req.rawJsonBody = buf;
    }
}));

app.use(bodyParser.urlencoded({
    extended: true,
    verify: function (req, res, buf, encoding) {
        req.rawUrlBody = buf;
    }
}));

app.use(nocache());
app.use(cookieParser());

// Session Configuration
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'YOUR_SECRET_KEY',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax'
    } 
});
app.use(sessionMiddleware);

// Passport Middleware Initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy Configuration
passport.use(new LocalStrategy(
    { usernameField: 'email' }, 
    async (email, password, done) => {
        try {
            const [[user]] = await sql.query('SELECT id, email, username, passwordHash, perms, banned FROM users WHERE email = ?', [email]);

            if (!user) {
                return done(null, false, { message: 'Incorrect email or password.' });
            }

            if (user.banned) {
                return done(null, false, { message: 'Account is banned.' });
            }

            const match = await bcrypt.compare(password, user.passwordHash);
            if (!match) {
                return done(null, false, { message: 'Incorrect email or password.' });
            }

            const { passwordHash, ...userWithoutHash } = user;
            return done(null, userWithoutHash);

        } catch (err) {
            return done(err);
        }
    }
));

// Passport User Serialization/Deserialization
passport.serializeUser((user, done) => {
    done(null, user.id); 
});

passport.deserializeUser(async (id, done) => {
    try {
        const [[user]] = await sql.query('SELECT id, email, username, perms, banned FROM users WHERE id = ?', [id]);
        done(null, user || false);
    } catch (err) {
        done(err, false);
    }
});

const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const itemsRoute = require('./routes/items');
const tradingRoute = require('./routes/trading');
const discordRoute = require('./routes/discord');
const rainRoute = require('./routes/rain');
const leaderboardRoute = require('./routes/leaderboard');
const casesRoute = require('./routes/games/cases');
const battlesRoute = require('./routes/games/battles');
const rouletteRoute = require('./routes/games/roulette');
const crashRoute = require('./routes/games/crash');
const coinflipRoute = require('./routes/games/coinflip');
const jackpotRoute = require('./routes/games/jackpot');
const slotsRoute = require('./routes/games/slots');
const minesRoute = require('./routes/games/mines');
const blackjackRoute = require('./routes/games/blackjack');
const adminRoute = require('./routes/admin');
const surveysRoute = require('./routes/surveys');
const fairnessRoute = require('./routes/fairness');

app.use('/auth', authRoute);
app.use('/user', userRoute);
app.use('/items', itemsRoute);
app.use('/trading', tradingRoute);
app.use('/discord', discordRoute);
app.use('/rain', rainRoute);
app.use('/leaderboard', leaderboardRoute);
app.use('/cases', casesRoute);
app.use('/battles', battlesRoute);
app.use('/roulette', rouletteRoute);
app.use('/crash', crashRoute);
app.use('/coinflip', coinflipRoute);
app.use('/jackpot', jackpotRoute);
app.use('/slots', slotsRoute);
app.use('/mines', minesRoute);
app.use('/blackjack', blackjackRoute);
app.use('/admin', adminRoute);
app.use('/surveys', surveysRoute);
app.use('/fairness', fairnessRoute);

app.get('/', (req, res) => {
    res.send('Hey, hi :)');
});

const { cacheBets } = require('./socketio/bets');
const { cacheRains } = require('./socketio/rain');
const { cacheBattles } = require('./routes/games/battles/functions');
const { cacheCases, cacheDrops } = require('./routes/games/cases/functions');
const { cacheCrash } = require('./routes/games/crash/functions');
const { cacheCryptos } = require('./routes/trading/crypto/deposit/functions');
const { cacheWithdrawalCoins } = require('./routes/trading/crypto/withdraw/functions');
const { cacheJackpot } = require('./routes/games/jackpot/functions');
const { cacheRoulette } = require('./routes/games/roulette/functions');
const { cacheCoinflips } = require('./routes/games/coinflip/functions');
const { cacheChannels } = require('./socketio/chat/functions');
const { cacheItems } = require('./utils/roblox/items');
const { cacheListings } = require('./routes/trading/limiteds/functions');
const { cacheAdmin } = require('./routes/admin/config');
const { cacheSlots } = require('./routes/games/slots/functions');
const { cacheSurveys } = require('./routes/surveys/functions');
const { cacheLeaderboards } = require('./routes/leaderboard/functions');

async function start() {

    await Promise.all([
        cacheItems()
    ])

    const promises = [
        cacheBets,
        cacheRains,
        cacheBattles,
        cacheCases,
        // cacheDrops,
        cacheCrash,
        cacheCryptos,
        cacheWithdrawalCoins,
        cacheJackpot,
        cacheRoulette,
        cacheCoinflips,
        cacheChannels,
        cacheListings,
        cacheAdmin,
        cacheSlots,
        cacheSurveys,
        cacheLeaderboards
    ];

    await Promise.all(promises.map((p) => timedPromise(p(), p.name)));
    // console.log(results.map(e => `${e.name} completed in ${e.timeTaken}ms`));

    const port = process.env.PORT || 3000;

    const serverInstance = app.listen(port, () => {
        console.log('Listening on port ' + port);
    });
    
    // Set up Socket.IO with proper configuration
    io.attach(serverInstance, { 
        cors: { 
            origin: process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : true,
            methods: ["GET", "POST"],
            credentials: true,
            allowedHeaders: ["X-Requested-With", "Content-Type", "Authorization"]
        },
        cookie: {
            httpOnly: false,
            sameSite: 'none',
            secure: process.env.NODE_ENV === 'production'
        },
        allowRequest: (req, callback) => {
            // Log cookie for debugging
            console.log('Socket connection request with cookie:', 
                req.headers.cookie ? req.headers.cookie.substring(0, 30) + '...' : 'NO COOKIE');
            // Always allow the request
            callback(null, true);
        }
    });
    
    // Initialize socket.io handlers AFTER attaching
    require('./socketio')(io, sessionMiddleware);

}

function timedPromise(promise, name) {
    const startTime = Date.now();
    return promise.then(result => {
        const endTime = Date.now();
        console.log(`${name} completed in ${endTime - startTime}ms`);
        return { name, result, timeTaken: endTime - startTime };
    });
}

start();