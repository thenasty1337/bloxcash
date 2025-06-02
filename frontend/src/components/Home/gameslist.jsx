import {createSignal, For, onMount} from "solid-js";
import {A, useNavigate} from "@solidjs/router";
import GameTag from "./gametag";
import GameInfo from "./gameinfo";
import games from "../NavBar/games";

function GamesList() {
    const navigate = useNavigate();

    const gamemodes = [
        {
            tag: 'hot',
            icon: '/assets/icons/battles.svg',
            title: 'CASE BATTLES',
            type: 'PVP',
            image: '/games/battle.webp',
            link: '/battles',
            color: '#ff6b6b',
            colorSecondary: '#047431'
        },
        // {
        //     tag: 'new',
        //     icon: '/assets/icons/slot.svg',
        //     title: 'SLOTS',
        //     type: 'PROVIDER',
        //     image: '/assets/gamemodes/slots.png',
        //     link: '/slots',
        //     color: '#4ecdc4',
        //     colorSecondary: '#44a08d'
        // },
        {
            tag: 'new',
            icon: '/assets/icons/mines.svg',
            title: 'MINES',
            type: 'HOUSE',
            image: '/games/mines.webp',
            link: '/mines',
            colorSecondary: '#1A1632',
            color: '#96c93d'
        },
        {
            icon: '/assets/icons/roulette.svg',
            title: 'ROULETTE',
            type: 'HOUSE',
            image: '/assets/gamemodes/roulette.png',
            link: '/roulette',
            color: '#f9ca24',
            colorSecondary: '#f0932b'
        },
        {
            icon: '/assets/icons/coinflip.svg',
            title: 'COINFLIP',
            type: 'PVP',
            image: '/assets/gamemodes/coinflip.png',
            link: '/coinflip',
            color: '#6c5ce7',
            colorSecondary: '#a29bfe'
        },
        {
            icon: '/assets/icons/cases.svg',
            title: 'CASES',
            type: 'PVP',
            image: '/assets/gamemodes/cases.png',
            link: '/cases',
            color: '#a29bfe',
            colorSecondary: '#fd79a8'
        },
        {
            icon: '/assets/icons/jackpot.svg',
            title: 'JACKPOT',
            type: 'PVP',
            image: '/assets/gamemodes/jackpot.png',
            link: '/jackpot',
            color: '#fd79a8',
            colorSecondary: '#fdcb6e'
        },
    ]

    const [hoveredCard, setHoveredCard] = createSignal(null)

    return (
        <>
            <div class='games-container'>
                <div class='games'>
                    {/* Clean Modern Header */}
                    <div class='games-header'>
                        <div class='header-content'>
                           
                            <div class='header-text'>
                                <h2 class='title'>House Games</h2>
                                <span class='count'>{gamemodes.length} games available</span>
                            </div>
                        </div>
                        <div class='header-divider'></div>
                    </div>

                    {/* Enhanced Games Grid */}
                    <div class='games-grid'>
                        <For each={gamemodes}>{(game, index) => (
                            <div 
                                class='game-card'
                                style={`--game-color: ${game.color}; --game-color-secondary: ${game.colorSecondary}; --index: ${index()}`}
                                onClick={() => navigate(game.link)}
                            >
                                <div class='game-card-inner'>
                                    {/* Card Background */}
                                    <div class='card-bg' style={{'background-image': `url(${game.image})`}}></div>
                                    <div class='card-overlay'></div>
                                    
                                    {/* Card Content */}
                                    <div class='card-content'>
                                    {/* Top Section - Tags */}
                                    <div class='card-top'>
                                        {game.tag && (
                                            <div class={`game-tag ${game.tag}`}>
                                                {game.tag === 'hot' ? '🔥 HOT' : '✨ NEW'}
                                            </div>
                                        )}
                                        <div class={`game-type ${game.type.toLowerCase()}`}>
                                            {game.type}
                                        </div>
                                    </div>
                                    
                                    {/* Bottom Section - Title */}
                                    <div class='card-bottom'>
                                        <div class='game-info'>
                                            <img src={game.icon} alt={game.title} class='game-icon'/>
                                            <h3 class='game-title'>{game.title}</h3>
                                        </div>
                                        
                                    </div>
                                </div>
                                
                                    {/* Hover Glow Effect */}
                                    <div class='card-glow'></div>
                                </div>
                                

                            </div>
                        )}</For>
                    </div>
                </div>
            </div>

            <style jsx>{`
              .games-container {
                width: 100%;
                margin-top: 1.5rem;
              }

              .games-header {
                margin-bottom: 1.5rem;
              }

              .header-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 0.75rem;
              }

              .header-icon {
                width: 32px;
                height: 32px;
                background: rgba(78, 205, 196, 0.1);
                border: 1px solid rgba(78, 205, 196, 0.2);
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              }

              .header-icon svg {
                fill: #4ecdc4;
                opacity: 0.9;
              }

              .header-text {
                display: flex;
                flex-direction: column;
                gap: 0.125rem;
              }

              .title {
                font-size: 1.125rem;
                font-weight: 600;
                color: #ffffff;
                margin: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              }

              .count {
                font-size: 0.75rem;
                color: #8aa3b8;
                font-weight: 500;
              }

              .header-divider {
                height: 1px;
                background: linear-gradient(90deg, 
                  rgba(78, 205, 196, 0.3) 0%, 
                  rgba(78, 205, 196, 0.1) 30%,
                  transparent 100%
                );
              }

              .games-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 1.25rem;
              }

              .game-card {
                position: relative;
                height: 200px;
                border-radius: 16px;
                overflow: hidden;
                background: rgba(26, 35, 50, 0.8);
                border: 1px solid rgba(78, 205, 196, 0.1);
                backdrop-filter: blur(20px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
                animation: cardSlideIn 0.6s ease-out forwards;
                animation-delay: calc(var(--index) * 0.1s);
                opacity: 0;
                transform: translateY(20px);
              }

              .game-card-inner {
                width: 100%;
                height: 100%;
                background: rgba(26, 35, 50, 0.8);
                border-radius: 16px;
                position: relative;
                overflow: hidden;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              }

              @keyframes cardSlideIn {
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              .game-card:hover {
                transform: translateY(-8px) scale(1.02);
                border: 2px solid transparent;
                background: linear-gradient(rgba(26, 35, 50, 0.8), rgba(26, 35, 50, 0.8)) padding-box,
                           linear-gradient(90deg, var(--game-color) 0%, var(--game-color-secondary) 100%) border-box;
                box-shadow: 
                  0 12px 24px rgba(0, 0, 0, 0.12),
                  -8px 0 20px color-mix(in srgb, var(--game-color) 20%, transparent),
                  8px 0 20px color-mix(in srgb, var(--game-color-secondary) 20%, transparent),
                  0 0 12px color-mix(in srgb, var(--game-color) 15%, transparent);
              }

              .card-bg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-size: cover;
                background-position: center;
                transition: all 0.3s ease;
                filter: brightness(0.8);
                z-index: 1;
                border-radius: 16px;
              }

              .game-card:hover .card-bg {
                transform: scale(1.1);
                filter: brightness(1);
              }

              .card-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                  135deg,
                  rgba(26, 35, 50, 0.9) 0%,
                  rgba(26, 35, 50, 0.3) 40%,
                  rgba(26, 35, 50, 0.1) 70%,
                  transparent 100%
                );
                z-index: 1;
                border-radius: 16px;
              }

              .card-content {
                position: relative;
                z-index: 2;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 1.25rem;
              }

              .card-top {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 0.5rem;
              }

              .game-tag {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                padding: 0.375rem 0.75rem;
                border-radius: 20px;
                font-size: 0.7rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                backdrop-filter: blur(10px);
                border: 1px solid;
              }

              .game-tag.hot {
                background: rgba(255, 107, 107, 0.15);
                border-color: rgba(255, 107, 107, 0.3);
                color: #ff6b6b;
                box-shadow: 0 0 15px rgba(255, 107, 107, 0.2);
              }

              .game-tag.new {
                background: rgba(78, 205, 196, 0.15);
                border-color: rgba(78, 205, 196, 0.3);
                color: #4ecdc4;
                box-shadow: 0 0 15px rgba(78, 205, 196, 0.2);
              }

              .game-type {
                padding: 0.25rem 0.625rem;
                border-radius: 12px;
                font-size: 0.65rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(255, 255, 255, 0.08);
                color: #ffffff;
              }

              .game-type.pvp {
                background: rgba(108, 92, 231, 0.15);
                border-color: rgba(108, 92, 231, 0.3);
                color: #6c5ce7;
              }

              .game-type.house {
                background: rgba(255, 202, 40, 0.15);
                border-color: rgba(255, 202, 40, 0.3);
                color: #ffca28;
              }

              .game-type.provider {
                background: rgba(69, 183, 209, 0.15);
                border-color: rgba(69, 183, 209, 0.3);
                color: #45b7d1;
              }

              .card-bottom {
                display: flex;
                align-items: center;
                justify-content: space-between;
              }

              .game-info {
                display: flex;
                align-items: center;
                gap: 0.75rem;
              }

              .game-icon {
                width: 24px;
                height: 24px;
                filter: brightness(1.2) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
                transition: all 0.3s ease;
              }

              .game-card:hover .game-icon {
                filter: brightness(1.4) drop-shadow(0 0 8px var(--game-color));
                transform: scale(1.1);
              }

              .game-title {
                font-size: 1.125rem;
                font-weight: 700;
                color: #ffffff;
                margin: 0;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                transition: all 0.3s ease;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              }


              .play-indicator {
                width: 32px;
                height: 32px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
              }

              .game-card:hover .play-indicator {
                background: var(--game-color);
                border-color: var(--game-color);
                color: #ffffff;
                transform: scale(1.1);
                box-shadow: 0 0 20px var(--game-color);
              }

              .card-glow {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(
                  circle at 50% 50%,
                  var(--game-color) 0%,
                  transparent 60%
                );
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
                border-radius: 16px;
              }

              .game-card:hover .card-glow {
                opacity: 0.1;
              }



              /* Responsive Design */
              @media (max-width: 768px) {
                .games-container {
                  margin-top: 1.25rem;
                }

                .games-header {
                  margin-bottom: 1.25rem;
                }

                .title {
                  font-size: 1rem;
                }

                .games-grid {
                  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                  gap: 1rem;
                }

                .game-card {
                  height: 180px;
                }

                .card-content {
                  padding: 1rem;
                }

                .game-title {
                  font-size: 1rem;
                }
              }

              @media (max-width: 480px) {
                .games-grid {
                  grid-template-columns: 1fr;
                  gap: 1rem;
                }

                .game-card {
                  height: 160px;
                }

                .card-content {
                  padding: 1rem;
                }

                .game-title {
                  font-size: 0.9rem;
                }

                .game-tag {
                  padding: 0.25rem 0.5rem;
                  font-size: 0.65rem;
                }

                .game-type {
                  padding: 0.25rem 0.5rem;
                  font-size: 0.6rem;
                }
              }
            `}</style>
        </>
    );
}

export default GamesList;
