import {createEffect, createResource, createSignal, For} from "solid-js";
import {api} from "../../util/api";
import {useWebsocket} from "../../contexts/socketprovider";
import Avatar from "../Level/avatar";
import {getCents} from "../../util/balance";

const tempBets = [0,0,0,0,0,0,0,0]

const gameToImage = {
    'case': '/assets/icons/cases.svg',
    'battle': '/assets/icons/battles.svg',
    'roulette': '/assets/icons/roulette.svg',
    'crash': '/assets/icons/crash.svg',
    'coinflip': '/assets/icons/coinflip.svg',
    'jackpot': '/assets/icons/jackpot.svg',
    'slot': '/assets/icons/slot.svg',
    'mines': '/assets/icons/mines.svg'
}

function Bets(props) {

    let prevWs
    let hasEmittedMe = false
    const [ws] = useWebsocket()
    const [option, setOption] = createSignal('user')
    const [bets, setBets] = createSignal([])

    console.log('props', props)
    console.log('bets', bets())

    createEffect(() => {
        if (ws()?.connected && !prevWs?.connected) {
            ws().emit('bets:subscribe', 'all')
        }

        if (ws()) {
            ws().on('bets', (type, bets) => {
                if (type !== option()) {
                    ws().emit('bets:unsubscribe', option())
                    setBets([])
                }

                setOption(type)
                setBets((b) => [...bets, ...b].slice(0, 10))
            })
        }

        prevWs = ws()
    })

    createEffect(() => {
        if (!hasEmittedMe && props.user && ws()) {
            ws().emit('bets:subscribe', 'me')
            hasEmittedMe = true
        }
    })

    function changeBetChannel(channel) {
        ws().emit('bets:subscribe', channel)
    }

    return (
        <>
            <div class='live-feed-wrapper'>
                <div class='live-feed-container'>
                    <div class='live-feed-header'>
                        <div class='header-left'>
                            <h2 class='live-feed-title'>Live Feed</h2>
                            <div class='live-indicator'>
                                <div class='pulse-dot'></div>
                                <span>Live</span>
                            </div>
                        </div>
                        
                        <div class='feed-options'>
                            <button class={'pill-option ' + (option() === 'all' ? 'active' : '')} onClick={() => changeBetChannel('all')}>
                                <span>All Bets</span>
                            </button>
                            {props?.user && (
                                <button class={'pill-option ' + (option() === 'me' ? 'active' : '')} onClick={() => changeBetChannel('me')}>
                                    <span>My Bets</span>
                                </button>
                            )}
                            <button class={'pill-option ' + (option() === 'high' ? 'active' : '')} onClick={() => changeBetChannel('high')}>
                                <span>High Rollers</span>
                            </button>
                            <button class={'pill-option ' + (option() === 'lucky' ? 'active' : '')} onClick={() => changeBetChannel('lucky')}>
                                <span>Lucky Wins</span>
                            </button>
                        </div>
                    </div>

                    <div class='feed-content'>
                        <div class='feed-table-header'>
                            <div class='header-col gamemode-col'>Game</div>
                            <div class='header-col player-col'>Player</div>
                            <div class='header-col time-col'>Time</div>
                            <div class='header-col amount-col'>Amount</div>
                            <div class='header-col multiplier-col large'>Multiplier</div>
                            <div class='header-col payout-col large'>Payout</div>
                        </div>

                        <div class='feed-rows'>
                            <For each={bets()}>{(bet, index) => (
                                <div class={'feed-row ' + ((bet?.payout / bet?.amount) > 1 ? 'win-row' : 'loss-row')}>
                                    <div class='row-col gamemode-col'>
                                        <div class='gamemode-info'>
                                            <div class='game-icon-wrapper'>
                                                <img src={gameToImage[bet.game]} alt='' class='game-icon'/>
                                            </div>
                                            <span class='game-name'>
                                                {bet.game === 'battle' ? 'Case Battles' : 
                                                 bet.game === 'case' ? 'Cases' : 
                                                 bet.game === 'coinflip' ? 'Coinflip' :
                                                 bet.game === 'jackpot' ? 'Jackpot' :
                                                 bet.game.charAt(0).toUpperCase() + bet.game.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    <div class='row-col player-col'>
                                        <div class='player-info'>
                                        {console.log('bet', bet)}
                                            <div class='avatar-wrapper'>
                                                <Avatar id={bet?.user?.id} xp={bet?.user?.xp || 0} height={28} avatar={bet?.user?.avatar}/>
                                            </div>
                                            <span class='player-name'>
                                                {(() => {
                                                    const username = bet?.user?.username || 'Anonymous';
                                                    return username.length > 12 ? username.substring(0, 12) + '...' : username;
                                                })()}
                                            </span>
                                        </div>
                                    </div>

                                    <div class='row-col time-col'>
                                        <span class='time-text'>{new Date(bet?.createdAt).toLocaleTimeString()}</span>
                                    </div>

                                    <div class='row-col amount-col'>
                                        <div class='amount-info'>
                                            <img src='/assets/icons/coin.svg' alt='' class='coin-icon'/>
                                            <span class='amount-text'>{Math.floor(bet?.amount || 0)}<span class='cents'>.{getCents(bet?.amount || 0)}</span></span>
                                        </div>
                                    </div>

                                    <div class='row-col multiplier-col large'>
                                        <div class={'multiplier-badge ' + ((bet?.payout / bet?.amount) > 1 ? 'win' : 'loss')}>
                                            {(bet?.payout / bet?.amount).toFixed(2)}x
                                        </div>
                                    </div>

                                    <div class='row-col payout-col large'>
                                        <div class='payout-info'>
                                            <img src='/assets/icons/coin.svg' alt='' class='coin-icon'/>
                                            <span class={'payout-text ' + ((bet?.payout / bet?.amount) > 1 ? 'win' : 'loss')}>
                                                {(bet?.payout / bet?.amount > 1) ? '+' : ''}{Math.floor(bet?.payout || 0)}<span class='cents'>.{getCents(bet?.payout || 0)}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}</For>

                            {bets().length === 0 && (
                                <div class='empty-state'>
                                    <div class='empty-icon'>📊</div>
                                    <h3>No recent bets</h3>
                                    <p>Bets will appear here as they happen</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .live-feed-wrapper {
                    width: 100%;
                    padding: 0;
                }

                .live-feed-container {
                    width: 100%;
                    border-radius: 12px;
                    overflow: hidden;
                }

                .live-feed-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 0px;
                    position: relative;
                }

                .live-feed-header::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 99%;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.06);
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .live-feed-title {
                    color: #ffffff;
                    font-size: 18px;
                    font-family: 'Geogrotesque Wide', sans-serif;
                    font-weight: 600;
                    margin: 0;
                    letter-spacing: 0.3px;
                }

                .live-indicator {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    background: rgba(34, 197, 94, 0.1);
                    border: 1px solid rgba(34, 197, 94, 0.2);
                    border-radius: 16px;
                    color: #22c55e;
                    font-size: 11px;
                    font-weight: 500;
                }

                .pulse-dot {
                    width: 6px;
                    height: 6px;
                    background: #22c55e;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.9); }
                    100% { opacity: 1; transform: scale(1); }
                }

                .feed-options {
                    display: flex;
                    gap: 4px;
                    background: rgba(255, 255, 255, 0.03);
                    padding: 4px;
                    border-radius: 7px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }

                .pill-option {
                    position: relative;
                    padding: 8px 16px;
                    border-radius: 7px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 13px;
                    font-family: 'Geogrotesque Wide', sans-serif;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    white-space: nowrap;
                }

                .pill-option:hover {
                    color: rgba(255, 255, 255, 0.8);
                    background: rgba(255, 255, 255, 0.05);
                }

                .pill-option.active {
                    color: #ffffff;
                    background: linear-gradient(135deg, #4ecdc4, #44a08d);
                    box-shadow: 0 2px 8px rgba(78, 205, 196, 0.25)
                }

                .feed-content {
                    padding: 0;
                }

                .feed-table-header {
                    display: grid;
                    grid-template-columns: 1.8fr 1.5fr 1fr 1.2fr 1fr 1.2fr;
                    padding: 12px 24px;
                    margin-bottom: 5px;
                    border-radius: 5px;
                    background: rgba(255, 255, 255, 0.02);
                }

                .header-col {
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 11px;
                    font-family: 'Geogrotesque Wide', sans-serif;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                }

                .feed-rows {
                    max-height: 500px;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(59, 130, 246, 0.2) transparent;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .feed-rows::-webkit-scrollbar {
                    width: 4px;
                }

                .feed-rows::-webkit-scrollbar-track {
                    background: transparent;
                }

                .feed-rows::-webkit-scrollbar-thumb {
                    background: rgba(59, 130, 246, 0.2);
                    border-radius: 2px;
                }

                .feed-row {
                    display: grid;
                    grid-template-columns: 1.8fr 1.5fr 1fr 1.2fr 1fr 1.2fr;
                    align-items: center;
                    padding: 5px 16px;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.015), rgba(255, 255, 255, 0.008));
                    border: 1px solid rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                    transition: all 0.15s ease;
                    position: relative;
                    backdrop-filter: blur(10px);
                }

                .feed-row::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 3px;
                    height: 70%;
                    background: transparent;
                    border-radius: 0 2px 2px 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    opacity: 0;
                }

                .feed-row.win-row::before {
                    background: linear-gradient(135deg, #22c55e, #16a34a, #15803d);
                    box-shadow: 0 0 8px rgba(34, 197, 94, 0.4), 0 0 16px rgba(34, 197, 94, 0.2);
                    opacity: 1;
                }

                .feed-row.loss-row::before {
                    background: linear-gradient(135deg, #06b6d4, #0891b2, #0e7490);
                    box-shadow: 0 0 8px rgba(6, 182, 212, 0.4), 0 0 16px rgba(6, 182, 212, 0.2);
                    opacity: 1;
                }

                .feed-row:hover::before {
                    width: 4px;
                    height: 80%;
                }

                .feed-row.win-row:hover::before {
                    box-shadow: 0 0 12px rgba(34, 197, 94, 0.6), 0 0 20px rgba(34, 197, 94, 0.3);
                }

                .feed-row.loss-row:hover::before {
                    box-shadow: 0 0 12px rgba(6, 182, 212, 0.6), 0 0 20px rgba(6, 182, 212, 0.3);
                }

                .feed-row:hover {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0.015));
                    border-color: rgba(255, 255, 255, 0.06);
                    transform: translateY(-0.5px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                }

                .row-col {
                    display: flex;
                    align-items: center;
                }

                .gamemode-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .game-icon-wrapper {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(29, 78, 216, 0.08));
                    border: 1px solid rgba(59, 130, 246, 0.12);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .game-icon {
                    width: 16px;
                    height: 16px;
                    opacity: 0.9;
                }

                .game-name {
                    color: #3b82f6;
                    font-size: 12px;
                    font-family: 'Geogrotesque Wide', sans-serif;
                    font-weight: 500;
                }

                .player-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .avatar-wrapper {
                    border-radius: 50%;
                    padding: 1px;
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                }

                .player-name {
                    color: rgba(255, 255, 255, 0.85);
                    font-size: 12px;
                    font-family: 'Geogrotesque Wide', sans-serif;
                    font-weight: 500;
                }

                .time-text {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 11px;
                    font-family: 'Geogrotesque Wide', sans-serif;
                    font-weight: 400;
                }

                .amount-info,
                .payout-info {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .coin-icon {
                    width: 14px;
                    height: 14px;
                    opacity: 0.8;
                }

                .amount-text {
                    color: #3b82f6;
                    font-size: 12px;
                    font-family: 'Geogrotesque Wide', sans-serif;
                    font-weight: 600;
                }

                .multiplier-badge {
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    font-family: 'Geogrotesque Wide', sans-serif;
                }

                .multiplier-badge.win {
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                    border: 1px solid rgba(34, 197, 94, 0.15);
                }

                .multiplier-badge.loss {
                    background: rgba(6, 182, 212, 0.1);
                    color: #06b6d4;
                    border: 1px solid rgba(6, 182, 212, 0.15);
                }

                .payout-text.win {
                    color: #22c55e;
                    font-size: 12px;
                    font-weight: 600;
                }

                .payout-text.loss {
                    color: #06b6d4;
                    font-size: 12px;
                    font-weight: 600;
                }

                .cents {
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 11px;
                }

                .empty-state {
                    padding: 60px 24px;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.5);
                }

                .empty-icon {
                    font-size: 40px;
                    margin-bottom: 12px;
                    opacity: 0.6;
                }

                .empty-state h3 {
                    font-size: 16px;
                    font-weight: 600;
                    margin: 0 0 6px 0;
                    color: rgba(255, 255, 255, 0.7);
                }

                .empty-state p {
                    font-size: 13px;
                    margin: 0;
                    opacity: 0.6;
                }

                @media only screen and (max-width: 1200px) {
                    .live-feed-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                        padding: 20px;
                    }

                    .feed-options {
                        width: 100%;
                        justify-content: flex-start;
                        flex-wrap: wrap;
                    }

                    .feed-table-header {
                        grid-template-columns: 1.5fr 1.5fr 1fr 1.2fr;
                        padding-left: 20px;
                        padding-right: 20px;
                    }

                    .feed-row {
                        grid-template-columns: 1.5fr 1.5fr 1fr 1.2fr;
                        padding: 10px 14px;
                    }

                    .feed-rows {
                        padding: 0 20px 16px 20px;
                        gap: 5px;
                    }

                    .large {
                        display: none;
                    }
                }

                @media only screen and (max-width: 768px) {
                    .live-feed-container {
                        border-radius: 10px;
                    }

                    .live-feed-header {
                        padding: 16px;
                    }

                    .feed-table-header {
                        grid-template-columns: 1.5fr 1.5fr 1fr;
                        padding-left: 16px;
                        padding-right: 16px;
                    }

                    .feed-row {
                        grid-template-columns: 1.5fr 1.5fr 1fr;
                        padding: 8px 12px;
                    }

                    .feed-rows {
                        padding: 0 16px 12px 16px;
                        gap: 4px;
                    }

                    .amount-col {
                        display: none;
                    }

                    .pill-option {
                        padding: 6px 12px;
                        font-size: 12px;
                    }
                }

                @media only screen and (max-width: 480px) {
                    .header-left {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 8px;
                    }

                    .feed-table-header {
                        grid-template-columns: 1fr 1fr;
                        padding: 10px 12px;
                    }

                    .feed-row {
                        grid-template-columns: 1fr 1fr;
                        padding: 8px 10px;
                    }

                    .feed-rows {
                        padding: 0 12px 8px 12px;
                        gap: 4px;
                    }

                    .time-col {
                        display: none;
                    }

                    .game-name,
                    .player-name {
                        font-size: 12px;
                    }

                    .empty-state {
                        padding: 40px 16px;
                    }
                }
            `}</style>
        </>
    );
}

export default Bets;

