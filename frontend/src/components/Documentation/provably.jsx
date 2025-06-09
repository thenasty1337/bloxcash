import { TbLock, TbCheck, TbTarget, TbBox, TbSwords, TbTrendingUp, TbCoin, TbBomb } from 'solid-icons/tb';

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
        e.target.closest('.dropdown-faq-wrapper-faq').classList.toggle('active')
    }

    return (
        <>
            <div className='provably-container'>
                <div className='header-section'>
                    <h1 className='main-title'>Provably Fair Gaming</h1>
                    <p className='subtitle'>
                        Transparency and fairness are at the core of Nova Casino. Our provably fair system 
                        ensures that every game outcome is verifiable and cannot be manipulated.
                    </p>
                    <div className='trust-indicators'>
                        <div className='indicator'>
                            <span className='indicator-icon'>
                                <TbLock size={16}/>
                            </span>
                            <span>Cryptographically Secure</span>
                        </div>
                        <div className='indicator'>
                            <span className='indicator-icon'>
                                <TbCheck size={16}/>
                            </span>
                            <span>100% Verifiable</span>
                        </div>
                        <div className='indicator'>
                            <span className='indicator-icon'>
                                <TbTarget size={16}/>
                            </span>
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
                    
                    <div className='dropdown-faq-wrapper-faq'>
                        <button className='game-button' onClick={toggleDropdown}>
                            <div className='button-content'>
                                <span className='game-icon'>
                                    <TbBox size={20}/>
                                </span>
                                <div className='button-text'>
                                    <h3>Cases</h3>
                                    <p>Verify case opening results</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
                                <h4>Case Opening Verification</h4>
                                <p>Each case opening is calculated using the following variables:</p>
                                <div className='seed-grid'>
                                    <div className='seed-item'>
                                        <strong>Server Seed</strong>
                                        <span>Provided by Nova Casino</span>
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

                    <div className='dropdown-faq-wrapper-faq'>
                        <button className='game-button' onClick={toggleDropdown}>
                            <div className='button-content'>
                                <span className='game-icon'>
                                    <TbSwords size={20}/>
                                </span>
                                <div className='button-text'>
                                    <h3>Case Battles</h3>
                                    <p>Verify battle round outcomes</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
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

                    <div className='dropdown-faq-wrapper-faq'>
                        <button className='game-button' onClick={toggleDropdown}>
                            <div className='button-content'>
                                <span className='game-icon'>
                                    <TbTarget size={20}/>
                                </span>
                                <div className='button-text'>
                                    <h3>Roulette</h3>
                                    <p>Verify roulette spin results</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
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

                    <div className='dropdown-faq-wrapper-faq'>
                        <button className='game-button' onClick={toggleDropdown}>
                            <div className='button-content'>
                                <span className='game-icon'>
                                    <TbTrendingUp size={20}/>
                                </span>
                                <div className='button-text'>
                                    <h3>Crash</h3>
                                    <p>Verify crash multiplier results</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
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

                    <div className='dropdown-faq-wrapper-faq'>
                        <button className='game-button' onClick={toggleDropdown}>
                            <div className='button-content'>
                                <span className='game-icon'>
                                    <TbCoin size={20}/>
                                </span>
                                <div className='button-text'>
                                    <h3>Jackpot</h3>
                                    <p>Verify jackpot winner selection</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
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

                    <div className='dropdown-faq-wrapper-faq'>
                        <button className='game-button' onClick={toggleDropdown}>
                            <div className='button-content'>
                                <span className='game-icon'>
                                    <TbCoin size={20}/>
                                </span>
                                <div className='button-text'>
                                    <h3>Coinflip</h3>
                                    <p>Verify coinflip game outcomes</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
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

                    <div className='dropdown-faq-wrapper-faq'>
                        <button className='game-button' onClick={toggleDropdown}>
                            <div className='button-content'>
                                <span className='game-icon'>
                                    <TbBomb size={20}/>
                                </span>
                                <div className='button-text'>
                                    <h3>Mines</h3>
                                    <p>Verify mine placement and results</p>
                                </div>
                            </div>
                            <svg className='chevron' xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
                                <path d="M1 1.5L6 6.5L11 1.5" stroke="#4ecdc4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <div className='dropdown-faq'>
                            <div className='dropdown-faq-content'>
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
                padding: 2rem;
                margin: 0 auto;
                color: #8aa3b8;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 0.9rem;
                font-weight: 400;
                line-height: 1.6;
              }

              .header-section {
                text-align: center;
                margin-bottom: 2rem;
                padding: 2rem 0;
                border-bottom: 1px solid rgba(78, 205, 196, 0.2);
              }

              .main-title {
                color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 2rem;
                font-weight: 700;
                margin: 0 0 1rem 0;
                letter-spacing: -0.5px;
              }

              .subtitle {
                color: #8aa3b8;
                font-size: 1rem;
                font-weight: 500;
                max-width: 800px;
                margin: 0 auto 1.5rem auto;
                line-height: 1.5;
              }

              .trust-indicators {
                display: flex;
                justify-content: center;
                gap: 1.5rem;
                margin-top: 1.5rem;
                flex-wrap: wrap;
              }

              .indicator {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1rem;
                background: rgba(78, 205, 196, 0.05);
                border: 1px solid rgba(78, 205, 196, 0.2);
                border-radius: 8px;
                font-size: 0.8rem;
                font-weight: 600;
                color: #ffffff;
              }

              .indicator-icon {
                color: #4ecdc4;
                display: flex;
                align-items: center;
              }

              .intro-section {
                background: rgba(26, 35, 50, 0.7);
                border: 1px solid rgba(78, 205, 196, 0.15);
                padding: 1.5rem;
                border-radius: 12px;
                margin-bottom: 2rem;
                backdrop-filter: blur(10px);
                text-align: center;
              }

              .intro-title {
                color: #ffffff;
                font-size: 1.5rem;
                font-weight: 600;
                margin: 0 0 1rem 0;
              }

              .intro-text {
                color: #8aa3b8;
                font-size: 0.95rem;
                line-height: 1.6;
                margin: 0;
                max-width: 800px;
                margin: 0 auto;
              }

              .games-section {
                display: flex;
                flex-direction: column;
                gap: 1rem;
              }

              .section-title {
                color: #ffffff;
                font-size: 1.5rem;
                font-weight: 600;
                margin: 0 0 1.5rem 0;
                text-align: center;
              }

              .dropdown-faq-wrapper-faq {
                background: rgba(26, 35, 50, 0.7);
                border: 1px solid rgba(78, 205, 196, 0.15);
                border-radius: 12px;
                overflow: hidden;
                transition: all 0.2s ease;
                backdrop-filter: blur(10px);
              }

              .dropdown-faq-wrapper-faq:hover {
                border-color: rgba(78, 205, 196, 0.25);
                background: rgba(26, 35, 50, 0.8);
              }

              .dropdown-faq-wrapper-faq.active {
                border-color: rgba(78, 205, 196, 0.3);
                background: rgba(26, 35, 50, 0.8);
              }

              .game-button {
                width: 100%;
                padding: 1.25rem 1.5rem;
                background: transparent;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
                color: inherit;
                font-family: inherit;
                transition: all 0.2s ease;
              }

              .game-button:hover {
                background: rgba(78, 205, 196, 0.05);
              }

              .button-content {
                display: flex;
                align-items: center;
                gap: 1rem;
              }

              .game-icon {
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #4ecdc4, #44a08d);
                border-radius: 8px;
                color: #ffffff;
              }

              .button-text {
                text-align: left;
              }

              .button-text h3 {
                color: #ffffff;
                font-size: 1.1rem;
                font-weight: 600;
                margin: 0 0 0.25rem 0;
              }

              .button-text p {
                color: #8aa3b8;
                font-size: 0.8rem;
                margin: 0;
                opacity: 0.9;
              }

              .chevron {
                transition: transform 0.2s ease;
              }

              .dropdown-faq-wrapper-faq.active .chevron {
                transform: rotate(180deg);
              }

              .dropdown-faq {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
              }

              .dropdown-faq-wrapper-faq.active .dropdown-faq {
                max-height: 2000px;
              }

              .dropdown-faq-content {
                padding: 0 1.5rem 1.5rem 1.5rem;
                border-top: 1px solid rgba(78, 205, 196, 0.1);
              }

              .dropdown-faq-content h4 {
                color: #ffffff;
                font-size: 1.25rem;
                font-weight: 600;
                margin: 1.25rem 0 1rem 0;
              }

              .dropdown-faq-content h5 {
                color: #ffffff;
                font-size: 1rem;
                font-weight: 600;
                margin: 1.5rem 0 0.5rem 0;
              }

              .dropdown-faq-content p {
                color: #8aa3b8;
                margin: 0.75rem 0;
                line-height: 1.6;
              }

              .seed-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin: 1.25rem 0;
              }

              .seed-item {
                background: rgba(78, 205, 196, 0.05);
                border: 1px solid rgba(78, 205, 196, 0.1);
                padding: 1rem;
                border-radius: 8px;
              }

              .seed-item strong {
                display: block;
                color: #ffffff;
                font-weight: 600;
                margin-bottom: 0.25rem;
              }

              .seed-item span {
                color: #8aa3b8;
                font-size: 0.8rem;
              }

              .explanation {
                margin: 1.25rem 0;
              }

              .explanation p {
                margin: 1rem 0;
                color: #8aa3b8;
                line-height: 1.6;
              }

              .seed-display {
                background: rgba(78, 205, 196, 0.05);
                border: 1px solid rgba(78, 205, 196, 0.1);
                padding: 1.25rem;
                border-radius: 8px;
                margin: 1rem 0;
              }

              .seed-display p {
                margin: 0.75rem 0 0.25rem 0;
                color: #ffffff;
                font-weight: 600;
              }

              .seed-hash {
                display: block;
                background: rgba(0, 0, 0, 0.3);
                padding: 0.75rem;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
                font-size: 0.75rem;
                color: #4ecdc4;
                word-break: break-all;
                margin-bottom: 1rem;
              }

              .code-section {
                margin-top: 1.5rem;
              }

              .code-block {
                background: rgba(26, 35, 50, 0.8);
                border: 1px solid rgba(78, 205, 196, 0.15);
                border-radius: 8px;
                padding: 1.25rem;
                overflow-x: auto;
              }

              .code-block pre {
                margin: 0;
                font-family: 'Courier New', monospace;
                font-size: 0.8rem;
                line-height: 1.5;
              }

              .code-block code {
                color: #4ecdc4;
                white-space: pre;
              }

              @media (max-width: 768px) {
                .provably-container {
                  padding: 1.25rem;
                }

                .main-title {
                  font-size: 1.5rem;
                }

                .trust-indicators {
                  flex-direction: column;
                  gap: 0.75rem;
                  align-items: center;
                }

                .indicator {
                  padding: 0.625rem 0.875rem;
                  font-size: 0.75rem;
                }

                .seed-grid {
                  grid-template-columns: 1fr;
                }

                .game-button {
                  padding: 1rem 1.25rem;
                }

                .button-content {
                  gap: 0.75rem;
                }

                .game-icon {
                  width: 35px;
                  height: 35px;
                }

                .button-text h3 {
                  font-size: 1rem;
                }

                .button-text p {
                  font-size: 0.75rem;
                }

                .dropdown-faq-content {
                  padding: 0 1.25rem 1.25rem 1.25rem;
                }

                .code-block {
                  padding: 1rem;
                }

                .code-block pre {
                  font-size: 0.75rem;
                }
              }

              @media (max-width: 480px) {
                .provably-container {
                  padding: 1rem;
                }

                .main-title {
                  font-size: 1.375rem;
                }

                .trust-indicators {
                  gap: 0.5rem;
                }

                .indicator {
                  padding: 0.5rem 0.75rem;
                  font-size: 0.7rem;
                }

                .game-button {
                  padding: 0.875rem 1rem;
                }

                .dropdown-faq-content {
                  padding: 0 1rem 1rem 1rem;
                }
              }
            `}</style>
        </>
    );
}

export default Provably;
