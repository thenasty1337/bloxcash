const { sql, doTransaction } = require('../../../database');
const { newBets } = require('../../../socketio/bets');
const { sleep, roundDecimal } = require('../../../utils');
const io = require('../../../socketio/server');

// Convert color names to numeric values for DB storage
const COLORS = {
    gold: 0,
    green: 1,
    red: 2
};

// Define multipliers for each color
const colorsMultipliers = {
    0: 14, // gold
    1: 2,  // green
    2: 2   // red
};

// Function to determine color based on result number (matching frontend's numberToColor)
function getColorFromResult(num) {
    if (num >= 1 && num <= 7) {
        return COLORS.green; // 1
    } else if (num >= 8 && num <= 14) {
        return COLORS.red; // 2
    } else {
        return COLORS.gold; // 0
    }
}

const roulette = {
    round: {},
    bets: [],
    last: [],
    config: {
        maxBet: 25000,
        betTime: 10000,
        rollTime: 5000
    },
    isRunning: false, // Flag to track if rouletteInterval is already running
    emittedRolls: new Set() // Track round IDs that have already had their roll emitted
};

const lastResults = 100;

async function getRouletteRound() {
    const [[round]] = await sql.query('SELECT * FROM roulette WHERE endedAt IS NULL ORDER BY id ASC LIMIT 1');
    if (!round) return;

    // Only set creation time if it doesn't exist yet
    if (!round.createdAt) {
        const now = new Date();
        await sql.query('UPDATE roulette SET createdAt = ? WHERE id = ?', [now, round.id]);
        round.new = true;
        round.createdAt = now;
    }

    return round;
}

async function updateRoulette() {

    const round = await getRouletteRound();
    if (!round) return;

    roulette.round = round;
    
    if (!roulette.round.new) {

        const [bets] = await sql.query(`
            SELECT rouletteBets.userId, users.username, users.xp, users.anon, rouletteBets.color, rouletteBets.amount, rouletteBets.id FROM rouletteBets
            INNER JOIN users ON users.id = rouletteBets.userId WHERE roundId = ?
        `, [round.id]);

        roulette.bets = bets.map(bet => ({
            id: bet.id,
            user: {
                id: bet.userId,
                username: bet.username,
                xp: bet.xp,
                anon: bet.anon
            },
            color: bet.color,
            amount: bet.amount
        }));

    } else {
        roulette.bets = [];
    }

    io.to('roulette').emit('roulette:new', {
        id: round.id,
        createdAt: round.createdAt
    });

    if (roulette.bets.length) {
        io.to('roulette').emit('roulette:bets', roulette.bets);
    }

}

async function cacheRoulette() {
    console.log('Initializing roulette cache and game loop...');
    
    // Clean up any previous state
    roulette.isRunning = false;
    roulette.emittedRolls.clear();
    
    // Get past results
    const [last] = await sql.query('SELECT result FROM roulette WHERE endedAt IS NOT NULL ORDER BY id DESC LIMIT ?', [lastResults]);
    roulette.last = last.map(bet => bet.result);
    
    // Get the latest round data
    await updateRoulette();
    
    // Start the game loop
    console.log('Starting roulette interval...');
    rouletteInterval();
}

async function rouletteInterval() {
    // If already running, don't start a new interval
    if (roulette.isRunning) {
        console.log('Roulette interval already running, skipping...');
        return;
    }
    
    // Set flag to indicate we're running
    roulette.isRunning = true;
    console.log('Roulette interval started, round ID:', roulette.round?.id || 'none');
    
    try {
        // Wait for the full betting period if round hasn't rolled yet
        if (!roulette.round.rolledAt) {
            // Calculate how much time is left until rolling should happen
            const roundCreationTime = new Date(roulette.round.createdAt).getTime();
            const currentTime = Date.now();
            const timeElapsed = currentTime - roundCreationTime;
            
            // Always ensure at least 10 seconds of betting time
            // This prevents rounds from rolling immediately
            const timeRemaining = Math.max(roulette.config.betTime, roulette.config.betTime - timeElapsed);
            
            console.log(`Round ${roulette.round.id}: ${timeRemaining}ms remaining until roll`);
            
            // Emit an update to clients with the time remaining
            io.to('roulette').emit('roulette:timer', {
                roundId: roulette.round.id,
                timeRemaining: Math.floor(timeRemaining / 1000)
            });
            
            // Wait for the remaining time
            await sleep(timeRemaining);
            
            // Check if round still exists and hasn't been rolled yet
            if (roulette.round && roulette.round.id && !roulette.round.rolledAt) {
                console.log(`Rolling round ${roulette.round.id} now!`);
                roulette.round.rolledAt = new Date();
                await sql.query('UPDATE roulette SET rolledAt = ? WHERE id = ?', [roulette.round.rolledAt, roulette.round.id]);
                
                // Only emit the roll event if we haven't emitted it before
                if (!roulette.emittedRolls.has(roulette.round.id)) {
                    // Create roll event data with consistent types
                    const rollEventData = {
                        id: roulette.round.id,
                        result: Number(roulette.round.result),  // Ensure result is a number
                        color: Number(roulette.round.color)     // Ensure color is a number
                    };
                    
                    console.log(`Emitting roll event for round ${roulette.round.id} with exact data:`, 
                              JSON.stringify(rollEventData));
                    roulette.emittedRolls.add(roulette.round.id);
                    
                    // Emit the data with consistent number types
                    io.to('roulette').emit('roulette:roll', rollEventData);
                } else {
                    console.log(`Skipping duplicate roll event for round ${roulette.round.id}`);
                }
            } else {
                console.log('Round no longer valid for rolling, skipping...');
                roulette.isRunning = false;
                return;
            }
        }

        await sleep(roulette.config.rollTime);

        roulette.round.endedAt = new Date();

        try {

            await doTransaction(async (connection, commit) => {
                
                await connection.query('UPDATE roulette SET endedAt = ? WHERE id = ?', [roulette.round.endedAt, roulette.round.id]);
                if (!roulette.bets.length) return await commit();

                const updateUserBalanceStmt = await connection.prepare('UPDATE users SET balance = balance + ? WHERE id = ?');
                const updateBetsStmt = await connection.prepare('UPDATE bets SET completed = 1, winnings = ? WHERE game = ? AND gameId = ?');
                const socketBets = [];

                // Track total wins for logging
                let totalWinAmount = 0;
                let totalWinners = 0;
                const colorNames = ['gold', 'green', 'red'];
                const roundColorName = colorNames[Number(roulette.round.color)];
                
                for (const bet of roulette.bets) {
                    // Convert both to numbers to fix type mismatch
                    const roundColor = Number(roulette.round.color);
                    const betColor = Number(bet.color);
                    let won = 0;
                    
                    // Debug log with more type information
                    console.log(`Debug - Round color: ${roundColor} (${typeof roundColor}), Bet color: ${betColor} (${typeof betColor}), Match: ${roundColor === betColor}`);
        
                    // Compare as numbers to avoid string/number mismatch
                    if (roundColor === betColor) {
                        // Calculate winnings and update user balance in DB
                        won = bet.amount * colorsMultipliers[roundColor];
                        await updateUserBalanceStmt.execute([won, bet.user.id]);
                        
                        // Get the updated user balance after win to ensure accuracy
                        const [[updatedUser]] = await connection.query('SELECT balance FROM users WHERE id = ?', [bet.user.id]);
                        
                        // Send balance update to the user via socket using the standard balance event
                        console.log(`Sending balance update after win: user ${bet.user.id}, new balance ${updatedUser.balance}`);
                        io.to(bet.user.id).emit('balance', 'set', updatedUser.balance);
                        
                        // Log individual winners
                        console.log(`🎉 ${bet.user.username} won ${won.toFixed(2)} from ${bet.amount.toFixed(2)} bet on ${roundColorName}! (${colorsMultipliers[roundColor]}x)`);
                        
                        // Update totals
                        totalWinAmount += won;
                        totalWinners++;
                    } else {
                        // Log losses
                        console.log(`💥 ${bet.user.username} lost ${bet.amount.toFixed(2)} on ${colorNames[betColor]}`);
                    }
        
                    await updateBetsStmt.execute([won, 'roulette', bet.id]);
                    socketBets.push({ user: bet.user, amount: bet.amount, edge: roundDecimal(bet.amount * 0.05), payout: won, game: 'roulette' });
                }
                
                // Log round summary
                if (roulette.bets.length > 0) {
                    console.log(`🎰 Round ${roulette.round.id} summary: ${roundColorName} hit, ${totalWinners}/${roulette.bets.length} players won, total payout: ${totalWinAmount.toFixed(2)}`);
                }
                    
                await commit();
                newBets(socketBets);
      
            });

        } catch (error) {
            console.error("Roulette err:", error);
        }

        roulette.last.unshift(roulette.round.result);
        if (roulette.last.length > lastResults) roulette.last.pop();

        await sleep(2500);
        
        // Automatically create a new round after the current one ends
        try {
            // Create round with the current timestamp
            const now = new Date();
            const clientSeedValue = '00000000000000000003e5a54c2898a18d262eb5860e696441f8a4ebbff03697';
            
            // Generate random result number
            const randomResult = Math.floor(Math.random() * 15);
            
            // Determine color based on result number to match frontend expectations
            const colorValue = getColorFromResult(randomResult);
            
            console.log('Creating new roulette round with result:', randomResult, 'color:', colorValue, 
                      '(This maps to', colorValue === 0 ? 'gold' : colorValue === 1 ? 'green' : 'red', ')');
            
            const [result] = await sql.query('INSERT INTO roulette (createdAt, serverSeed, clientSeed, result, color, status) VALUES (?, ?, ?, ?, ?, ?)', [
                now,
                'SERVER_' + Math.random().toString(36).substring(2, 15),
                clientSeedValue,
                randomResult,
                colorValue,
                'betting'
            ]);
            
            // Immediately get the newly created round from database to ensure we have the correct data
            const [newRound] = await sql.query('SELECT * FROM roulette WHERE id = ?', [result.insertId]);
            
            // Clean up old emitted rolls (keep only the last 20 rounds to prevent memory leaks)
            if (roulette.emittedRolls.size > 20) {
                console.log(`Cleaning up emittedRolls set (size: ${roulette.emittedRolls.size})`);
                roulette.emittedRolls = new Set(Array.from(roulette.emittedRolls).slice(-20));
            }
            
            console.log('Successfully created new roulette round with ID:', result.insertId);
            
            // Explicitly update the roulette state with our new round
            console.log('Round complete, directly updating roulette state with new round...');
            roulette.round = newRound[0];
            roulette.bets = [];
            
            // Emit a new round event to restart the timer on the frontend
            console.log('Emitting roulette:new event to restart timer');
            io.to('roulette').emit('roulette:new', {
                id: roulette.round.id,
                createdAt: roulette.round.createdAt
            });
        } catch (error) {
            console.error('Error automatically creating new roulette round:', error);
        }
        
        // Reset the running flag before starting the next interval
        roulette.isRunning = false;
        
        // Start the next roulette interval cycle with a small delay to ensure database operations complete
        console.log('Starting next roulette interval cycle...');
        setTimeout(rouletteInterval, 500); // Small delay to allow state to settle
    } catch (error) {
        console.error('Error in roulette interval main process:', error);
        // Reset running flag if we exited abnormally
        roulette.isRunning = false;
        
        // Even on error, try to restart the process after a delay
        console.log('Restarting roulette interval after error...');
        setTimeout(() => rouletteInterval(), 5000);
    }
}

module.exports = {
    roulette,
    cacheRoulette,
    updateRoulette
}