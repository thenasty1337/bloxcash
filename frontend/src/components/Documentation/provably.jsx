let PROVABLY_CODE = {
    CASES: `const crypto = require('crypto');

const CHARSROLL = 15;
const MAXROLL = 100000;

const combine = (serverSeed, clientSeed, nonce) => {
    return crypto.createHmac('sha256', serverSeed).update(clientSeed + ':' + nonce).digest('hex');
}

const getResult = hashedValue => {
    const partHash = hashedValue.slice(0, CHARSROLL);
    const roll = parseInt(partHash, 16) % MAXROLL;
    return roll + 1;
};

console.log(getResult(combine(serverSeed, clientSeed, nonce)));`,

    BATTLES: `const crypto = require('crypto');

const CHARSROLL = 15;
const MAXROLL = 100000;

const combine = (serverSeed, clientSeed, nonce) => {
    return crypto.createHmac('sha256', serverSeed).update(clientSeed + ':' + nonce).digest('hex');
}

const getResult = hashedValue => {
    const partHash = hashedValue.slice(0, CHARSROLL);
    const roll = parseInt(partHash, 16) % MAXROLL;
    return roll + 1;
};

// CHANGE THESE VALUES
const unhashedServerSeed = ''; // shown at the end of the game
const clientSeed = ''; // eos blockchain transaction id
const slots = 2; // count of players in the battle
const rounds = 15; // amount of cases/rounds in the battle
// 

for (let i = 0; i < rounds; i++) {

    console.log('Round ' + (i + 1) + ' results:');

    for (let r = 0; r < slots; r++) {
        const nonce = i * slots + r;
        console.log('Player on seat ' + (r + 1) + ':, ' + getResult(combine(unhashedServerSeed, clientSeed, nonce)));
    }

}`,

    ROULETTE: `const crypto = require('crypto');

const clientSeed = "00000000000000000003e5a54c2898a18d262eb5860e696441f8a4ebbff03697";

const getResult = serverSeed => {

    const hmac = crypto.createHmac('sha256', serverSeed);
    hmac.update(clientSeed);
    const sha = hmac.digest('hex');

    const result = parseInt(sha.substr(0, 8), 16) % 15;
    return result;

};

console.log(getResult(serverSeed)); // roulette number between 0-14`,

    CRASH: `const crypto = require('crypto');

const clientSeed = "00000000000000000003e5a54c2898a18d262eb5860e696441f8a4ebbff03697";
const houseEdge = 10;

const getResult = serverSeed => {

    const hmac = crypto.createHmac('sha256', serverSeed);
    hmac.update(clientSeed);
    
    const sha = hmac.digest('hex');

    const hex = sha.substr(0, 8);
    const int = parseInt(hex, 16);

    const crashpoint = Math.max(1, (2 ** 32 / (int + 1)) * (1 - (houseEdge / 100)));
    return crashpoint;

};

console.log(getResult(serverSeed)); // round crashpoint`,

    JACKPOT: `const crypto = require('crypto');

const combine = (serverSeed, clientSeed) => {
    return crypto.createHmac('sha256', serverSeed).update(clientSeed).digest('hex');
}

// returns a float between 0 and 1
const getFloatResult = hashedValue => {
    let decimalNumber = parseInt(hashedValue, 16);
    let maxDecimalValue = parseInt('f'.repeat(64), 16);
    let floatNumber = decimalNumber / (maxDecimalValue - 1);
    return Number(floatNumber.toFixed(7));
};

const percentageWinner = getFloatResult(combine(serverSeed, clientSeed));
const winnerTicket = Math.floor(totalTickets * percentageWinner);
console.log(winnerTicket);`,

    COINFLIP: `const crypto = require('crypto');

const combine = (serverSeed, clientSeed) => {
    return crypto.createHmac('sha256', serverSeed).update(clientSeed).digest('hex');
}

const getResult = hashedValue => {
    const number = parseInt(hashedValue.charAt(1), 16);
    return (number % 2 === 0) ? 'ice' : 'fire'
};

console.log(getResult(combine(serverSeed, clientSeed))); // winning side`,

    MINES: `import _ from "lodash";
    
const floats = _.flatten(
  generateFloats(server_seed, client_seed, nonce, 0, mines)
).map((float: number, index: number) => float * (25 - index));

const minePositions = shuffle(
  [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24],
  floats
).slice(0, MINES);

console.log(floats);
console.log(minePositions);`,
}

function Provably(props) {

    function toggleDropdown(e) {
        e.target.closest('.dropdown-wrapper').classList.toggle('active')
    }

    return (
        <>
            <div className='provably-container'>
                <div className='header-section'>
                    <h1 className='main-title'>Provably Fair Gaming</h1>
                    <p className='subtitle'>
                        Transparency and fairness are at the core of BloxClash. Our provably fair system 
                        ensures that every game outcome is verifiable and cannot be manipulated.
                    </p>
                    <div className='trust-indicators'>
                        <div className='indicator'>
                            <span className='indicator-icon'>🔒</span>
                            <span>Cryptographically Secure</span>
                        </div>
                        <div className='indicator'>
                            <span className='indicator-icon'>✓</span>
                            <span>100% Verifiable</span>
                        </div>
                        <div className='indicator'>
                            <span className='indicator-icon'>🎯</span>
                            <span>Transparent Results</span>
                        </div>
                    </div>
                </div>

                <div className='intro-section'>
                    <h2 className='intro-title'>How Provably Fair Works</h2>
                    <p className='intro-text'>
                        Our provably fair system uses cryptographic algorithms to ensure that game outcomes 
                        are determined fairly and cannot be manipulated by either party. Each game uses a 
                        combination of server seeds, client seeds, and nonces to generate results that can 
                        be independently verified.
                    </p>
                </div>

                <div className='games-section'>
                    <h2 className='section-title'>Game Verification Methods</h2>
                    
                    <div className='dropdown-wrapper'>
                        <button className='game-button' onClick={toggleDropdown}>
                            <div className='button-content'>
                                <span className='game-icon'>📦</span>
                                <div className='button-text'>
                                    <h3>Cases</h3>
                                    <p>Verify case opening results</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#ADA3EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown'>
                            <div className='dropdown-content'>
                                <h4>Case Opening Verification</h4>
                                <p>Each case opening is calculated using the following variables:</p>
                                <div className='seed-grid'>
                                    <div className='seed-item'>
                                        <strong>Server Seed</strong>
                                        <span>Provided by BloxClash</span>
                                    </div>
                                    <div className='seed-item'>
                                        <strong>Client Seed</strong>
                                        <span>Generated by your browser (customizable)</span>
                                    </div>
                                    <div className='seed-item'>
                                        <strong>Nonce</strong>
                                        <span>Increments with each case opened</span>
                                    </div>
                                </div>
                                
                                <div className='explanation'>
                                    <p>
                                        You receive an encrypted hash of the server seed before opening a case. This prevents 
                                        us from changing the outcome after you've committed to opening the case. The unhashed 
                                        server seed is revealed when you change your current seed.
                                    </p>
                                    <p>
                                        Each case item receives a range of tickets based on its probability (total: 100,000 tickets). 
                                        A random number between 1-100,000 determines which item is drawn.
                                    </p>
                                </div>

                                <div className='code-section'>
                                    <h5>Verification Code (Node.js)</h5>
                                    <div className='code-block'>
                                        <pre><code>{PROVABLY_CODE.CASES}</code></pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='dropdown-wrapper'>
                        <button className='game-button' onClick={toggleDropdown}>
                            <div className='button-content'>
                                <span className='game-icon'>⚔️</span>
                                <div className='button-text'>
                                    <h3>Case Battles</h3>
                                    <p>Verify battle round outcomes</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#ADA3EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown'>
                            <div className='dropdown-content'>
                                <h4>Case Battle Verification</h4>
                                <p>Each case opened in battles is calculated using:</p>
                                <div className='seed-grid'>
                                    <div className='seed-item'>
                                        <strong>Server Seed</strong>
                                        <span>Randomly generated hash for each battle</span>
                                    </div>
                                    <div className='seed-item'>
                                        <strong>Client Seed</strong>
                                        <span>EOS blockchain transaction ID</span>
                                    </div>
                                    <div className='seed-item'>
                                        <strong>Nonce</strong>
                                        <span>Starts at 0, increments per opening</span>
                                    </div>
                                </div>
                                
                                <div className='explanation'>
                                    <p>
                                        At battle creation, a server seed is generated and its SHA256 hash is displayed. 
                                        Before openings begin, we commit to a future EOS block whose ID becomes the client seed.
                                    </p>
                                    <p>
                                        After the battle, the unhashed server seed is revealed for verification. This ensures 
                                        neither players nor our system know the outcome data until all bets are committed.
                                    </p>
                                </div>

                                <div className='code-section'>
                                    <h5>Verification Code (Node.js)</h5>
                                    <div className='code-block'>
                                        <pre><code>{PROVABLY_CODE.BATTLES}</code></pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='dropdown-wrapper'>
                        <button className='game-button' onClick={toggleDropdown}>
                            <div className='button-content'>
                                <span className='game-icon'>🎯</span>
                                <div className='button-text'>
                                    <h3>Roulette</h3>
                                    <p>Verify roulette spin results</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#ADA3EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown'>
                            <div className='dropdown-content'>
                                <h4>Roulette Verification</h4>
                                <p>Roulette results are generated using SHA-256 hash of:</p>
                                <div className='seed-grid'>
                                    <div className='seed-item'>
                                        <strong>Server Seed</strong>
                                        <span>Generated from a genesis seed chain</span>
                                    </div>
                                    <div className='seed-item'>
                                        <strong>Client Seed</strong>
                                        <span>Bitcoin block 788,500 hash</span>
                                    </div>
                                </div>
                                
                                <div className='explanation'>
                                    <p>
                                        Server seeds are generated by repeatedly hashing a genesis seed 10 million times. 
                                        The first game uses the 10 millionth seed, with subsequent games using the next seed down.
                                    </p>
                                    <div className='seed-display'>
                                        <p><strong>10th millionth server seed:</strong></p>
                                        <code className='seed-hash'>acb0aa39d25f1a618ccf90cf695106c412759d07461a285dab94ac55c991aab4</code>
                                        <p><strong>Client seed (Bitcoin Block 788,500):</strong></p>
                                        <code className='seed-hash'>00000000000000000003e5a54c2898a18d262eb5860e696441f8a4ebbff03697</code>
                                    </div>
                                </div>

                                <div className='code-section'>
                                    <h5>Verification Code (Node.js)</h5>
                                    <div className='code-block'>
                                        <pre><code>{PROVABLY_CODE.ROULETTE}</code></pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='dropdown-wrapper'>
                        <button className='game-button' onClick={toggleDropdown}>
                            <div className='button-content'>
                                <span className='game-icon'>📈</span>
                                <div className='button-text'>
                                    <h3>Crash</h3>
                                    <p>Verify crash multiplier results</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#ADA3EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown'>
                            <div className='dropdown-content'>
                                <h4>Crash Verification</h4>
                                <p>Crash multipliers are generated using the same system as Roulette:</p>
                                <div className='seed-grid'>
                                    <div className='seed-item'>
                                        <strong>Server Seed</strong>
                                        <span>Genesis seed chain (10 million hashes)</span>
                                    </div>
                                    <div className='seed-item'>
                                        <strong>Client Seed</strong>
                                        <span>Bitcoin block 788,500 hash</span>
                                    </div>
                                    <div className='seed-item'>
                                        <strong>House Edge</strong>
                                        <span>10% house edge applied</span>
                                    </div>
                                </div>
                                
                                <div className='explanation'>
                                    <p>
                                        The crash point calculation uses the same secure seed generation method as roulette, 
                                        with a mathematical formula that incorporates a 10% house edge to determine the 
                                        final multiplier for each round.
                                    </p>
                                </div>

                                <div className='code-section'>
                                    <h5>Verification Code (Node.js)</h5>
                                    <div className='code-block'>
                                        <pre><code>{PROVABLY_CODE.CRASH}</code></pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='dropdown-wrapper'>
                        <button className='game-button' onClick={toggleDropdown}>
                            <div className='button-content'>
                                <span className='game-icon'>💰</span>
                                <div className='button-text'>
                                    <h3>Jackpot</h3>
                                    <p>Verify jackpot winner selection</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#ADA3EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown'>
                            <div className='dropdown-content'>
                                <h4>Jackpot Winner Verification</h4>
                                <p>Jackpot winners are determined using:</p>
                                <div className='seed-grid'>
                                    <div className='seed-item'>
                                        <strong>Server Seed</strong>
                                        <span>Randomly generated for each round</span>
                                    </div>
                                    <div className='seed-item'>
                                        <strong>Client Seed</strong>
                                        <span>EOS blockchain transaction ID</span>
                                    </div>
                                    <div className='seed-item'>
                                        <strong>Total Tickets</strong>
                                        <span>Pot amount × 100</span>
                                    </div>
                                </div>
                                
                                <div className='explanation'>
                                    <p>
                                        When a jackpot round starts, we generate a random server seed and display its SHA256 hash. 
                                        After all bets are placed, we commit to a future EOS block for the client seed.
                                    </p>
                                    <p>
                                        The total ticket count equals the pot amount multiplied by 100, and the winning ticket 
                                        is determined by the cryptographic hash of the combined seeds.
                                    </p>
                                </div>

                                <div className='code-section'>
                                    <h5>Verification Code (Node.js)</h5>
                                    <div className='code-block'>
                                        <pre><code>{PROVABLY_CODE.JACKPOT}</code></pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='dropdown-wrapper'>
                        <button className='game-button' onClick={toggleDropdown}>
                            <div className='button-content'>
                                <span className='game-icon'>🪙</span>
                                <div className='button-text'>
                                    <h3>Coinflip</h3>
                                    <p>Verify coinflip game outcomes</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#ADA3EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown'>
                            <div className='dropdown-content'>
                                <h4>Coinflip Verification</h4>
                                <p>Coinflip results use the same secure system:</p>
                                <div className='seed-grid'>
                                    <div className='seed-item'>
                                        <strong>Server Seed</strong>
                                        <span>Random hash for each game</span>
                                    </div>
                                    <div className='seed-item'>
                                        <strong>Client Seed</strong>
                                        <span>EOS blockchain transaction ID</span>
                                    </div>
                                    <div className='seed-item'>
                                        <strong>Result</strong>
                                        <span>Even = Ice, Odd = Fire</span>
                                    </div>
                                </div>
                                
                                <div className='explanation'>
                                    <p>
                                        Similar to other games, coinflip uses a random server seed (with SHA256 hash shown) 
                                        and an EOS block ID as the client seed. The result is determined by checking if 
                                        a specific character in the hash is even (Ice) or odd (Fire).
                                    </p>
                                </div>

                                <div className='code-section'>
                                    <h5>Verification Code (Node.js)</h5>
                                    <div className='code-block'>
                                        <pre><code>{PROVABLY_CODE.COINFLIP}</code></pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='dropdown-wrapper'>
                        <button className='game-button' onClick={toggleDropdown}>
                            <div className='button-content'>
                                <span className='game-icon'>💣</span>
                                <div className='button-text'>
                                    <h3>Mines</h3>
                                    <p>Verify mine placement and results</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#ADA3EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown'>
                            <div className='dropdown-content'>
                                <h4>Mines Verification</h4>
                                <p>Mine placement uses advanced cryptographic shuffling:</p>
                                <div className='seed-grid'>
                                    <div className='seed-item'>
                                        <strong>Server Seed</strong>
                                        <span>SHA-256 hash of 16 secure random bytes</span>
                                    </div>
                                    <div className='seed-item'>
                                        <strong>Client Seed</strong>
                                        <span>User-customizable seed</span>
                                    </div>
                                    <div className='seed-item'>
                                        <strong>Nonce</strong>
                                        <span>Round number (increments per bet)</span>
                                    </div>
                                </div>
                                
                                <div className='explanation'>
                                    <p>
                                        Mines generates a 32-byte hexadecimal hash from your seeds and nonce, converts it 
                                        into 4-byte parts to create floats between 0 and 1. These floats are used with the 
                                        Fisher-Yates shuffle algorithm to ensure no duplicate mine positions.
                                    </p>
                                    <p>
                                        You can cycle your server seed anytime to get a new hashed seed. The previous 
                                        server seed is revealed only when you cycle to a new one.
                                    </p>
                                </div>

                                <div className='code-section'>
                                    <h5>Verification Code (TypeScript)</h5>
                                    <div className='code-block'>
                                        <pre><code>{PROVABLY_CODE.MINES}</code></pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
              .provably-container {
                width: 100%;
                max-width: 1200px;
                height: fit-content;
                box-sizing: border-box;
                padding: 40px 20px;
                margin: 0 auto;
                color: #ADA3EF;
                font-family: "Geogrotesque Wide", sans-serif;
                font-size: 14px;
                font-weight: 400;
                line-height: 1.6;
              }

              .header-section {
                text-align: center;
                margin-bottom: 50px;
                padding: 30px 0;
                border-bottom: 2px solid #2A2558;
              }

              .main-title {
                color: #FFF;
                font-family: "Geogrotesque Wide", sans-serif;
                font-size: 32px;
                font-weight: 700;
                margin: 0 0 15px 0;
                text-transform: uppercase;
                letter-spacing: 1px;
              }

              .subtitle {
                color: #ADA3EF;
                font-size: 16px;
                font-weight: 400;
                max-width: 800px;
                margin: 0 auto 30px auto;
                opacity: 0.9;
              }

              .trust-indicators {
                display: flex;
                justify-content: center;
                gap: 30px;
                margin-top: 30px;
              }

              .indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 20px;
                background: rgba(99, 102, 241, 0.1);
                border: 1px solid rgba(99, 102, 241, 0.3);
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                color: #E8E5FF;
              }

              .indicator-icon {
                font-size: 16px;
              }

              .intro-section {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                padding: 30px;
                border-radius: 12px;
                margin-bottom: 40px;
                border: 1px solid #2A2558;
                text-align: center;
              }

              .intro-title {
                color: #FFF;
                font-size: 24px;
                font-weight: 700;
                margin: 0 0 15px 0;
              }

              .intro-text {
                color: #E8E5FF;
                font-size: 15px;
                line-height: 1.7;
                margin: 0;
                max-width: 800px;
                margin: 0 auto;
              }

              .games-section {
                display: flex;
                flex-direction: column;
                gap: 20px;
              }

              .section-title {
                color: #FFF;
                font-size: 24px;
                font-weight: 700;
                margin: 0 0 30px 0;
                text-align: center;
              }

              .dropdown-wrapper {
                background: rgba(42, 37, 88, 0.1);
                border: 1px solid rgba(42, 37, 88, 0.3);
                border-radius: 12px;
                overflow: hidden;
                transition: all 0.3s ease;
              }

              .dropdown-wrapper:hover {
                background: rgba(42, 37, 88, 0.15);
                border-color: rgba(42, 37, 88, 0.5);
              }

              .dropdown-wrapper.active {
                background: rgba(42, 37, 88, 0.2);
                border-color: #6366f1;
              }

              .game-button {
                width: 100%;
                padding: 20px 25px;
                background: transparent;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
                color: inherit;
                font-family: inherit;
                transition: all 0.3s ease;
              }

              .game-button:hover {
                background: rgba(99, 102, 241, 0.05);
              }

              .button-content {
                display: flex;
                align-items: center;
                gap: 15px;
              }

              .game-icon {
                font-size: 24px;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #6366f1, #8b5cf6);
                border-radius: 8px;
              }

              .button-text {
                text-align: left;
              }

              .button-text h3 {
                color: #FFF;
                font-size: 18px;
                font-weight: 700;
                margin: 0 0 5px 0;
              }

              .button-text p {
                color: #ADA3EF;
                font-size: 14px;
                margin: 0;
                opacity: 0.8;
              }

              .chevron {
                transition: transform 0.3s ease;
              }

              .dropdown-wrapper.active .chevron {
                transform: rotate(180deg);
              }

              .dropdown {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
              }

              .dropdown-wrapper.active .dropdown {
                max-height: 2000px;
              }

              .dropdown-content {
                padding: 0 25px 25px 25px;
                border-top: 1px solid rgba(42, 37, 88, 0.5);
              }

              .dropdown-content h4 {
                color: #FFF;
                font-size: 20px;
                font-weight: 700;
                margin: 20px 0 15px 0;
              }

              .dropdown-content h5 {
                color: #E8E5FF;
                font-size: 16px;
                font-weight: 600;
                margin: 25px 0 10px 0;
              }

              .seed-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin: 20px 0;
              }

              .seed-item {
                background: rgba(26, 26, 46, 0.5);
                padding: 15px;
                border-radius: 8px;
                border: 1px solid rgba(42, 37, 88, 0.3);
              }

              .seed-item strong {
                display: block;
                color: #FFF;
                font-weight: 600;
                margin-bottom: 5px;
              }

              .seed-item span {
                color: #C7C2F0;
                font-size: 13px;
              }

              .explanation {
                margin: 20px 0;
              }

              .explanation p {
                margin: 15px 0;
                color: #C7C2F0;
                line-height: 1.6;
              }

              .seed-display {
                background: rgba(26, 26, 46, 0.5);
                padding: 20px;
                border-radius: 8px;
                margin: 15px 0;
                border: 1px solid rgba(42, 37, 88, 0.3);
              }

              .seed-display p {
                margin: 10px 0 5px 0;
                color: #E8E5FF;
                font-weight: 600;
              }

              .seed-hash {
                display: block;
                background: rgba(0, 0, 0, 0.3);
                padding: 10px;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                color: #47C754;
                word-break: break-all;
                margin-bottom: 15px;
              }

              .code-section {
                margin-top: 25px;
              }

              .code-block {
                background: linear-gradient(135deg, #1a1a2e 0%, #272549 100%);
                border: 1px solid #2A2558;
                border-radius: 8px;
                padding: 20px;
                overflow-x: auto;
              }

              .code-block pre {
                margin: 0;
                font-family: 'Courier New', monospace;
                font-size: 13px;
                line-height: 1.5;
              }

              .code-block code {
                color: #47C754;
                white-space: pre;
              }

              @media (max-width: 768px) {
                .provably-container {
                  padding: 20px 15px;
                }

                .main-title {
                  font-size: 24px;
                }

                .trust-indicators {
                  flex-direction: column;
                  gap: 15px;
                  align-items: center;
                }

                .indicator {
                  padding: 10px 15px;
                  font-size: 12px;
                }

                .seed-grid {
                  grid-template-columns: 1fr;
                }

                .game-button {
                  padding: 15px 20px;
                }

                .button-content {
                  gap: 12px;
                }

                .game-icon {
                  width: 35px;
                  height: 35px;
                  font-size: 20px;
                }

                .button-text h3 {
                  font-size: 16px;
                }

                .button-text p {
                  font-size: 13px;
                }

                .dropdown-content {
                  padding: 0 20px 20px 20px;
                }

                .code-block {
                  padding: 15px;
                }

                .code-block pre {
                  font-size: 12px;
                }
              }

              @media (max-width: 480px) {
                .trust-indicators {
                  gap: 10px;
                }

                .indicator {
                  padding: 8px 12px;
                  font-size: 11px;
                }

                .game-button {
                  padding: 12px 15px;
                }

                .dropdown-content {
                  padding: 0 15px 15px 15px;
                }
              }
            `}</style>
        </>
    );
}

export default Provably;
