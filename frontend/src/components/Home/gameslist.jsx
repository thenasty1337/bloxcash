import {createSignal, For, onMount} from "solid-js";
import {A, useNavigate} from "@solidjs/router";
import GameTag from "./gametag";
import GameInfo from "./gameinfo";
import games from "../NavBar/games";
import BlurImage from "../UI/BlurImage";

function GamesList() {
    const navigate = useNavigate();

    const gamemodes = [
        {
            tag: 'hot',
            icon: '/assets/games/packs-battle.png',
            title: 'CASE BATTLES',
            type: 'PVP',
            image: '/games/battle.png',
            link: '/battles',
            color: '#ff6b6b',
            colorSecondary: '#047431',
            isHouse: true
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
            icon: '/assets/games/mines.png',
            title: 'MINES',
            type: 'HOUSE',
            image: '/games/mines.png',
            link: '/mines',
            colorSecondary: '#1A1632',
            color: '#96c93d',
            isHouse: true
        },
        {
            icon: '/assets/games/roulette.png',
            title: 'ROULETTE',
            type: 'HOUSE',
            image: '/assets/gamemodes/roulette.png',
            link: '/roulette',
            color: '#f9ca24',
            colorSecondary: '#f0932b',
            isHouse: true
        },
        {
            icon: '/assets/games/coinflip.png',
            title: 'COINFLIP',
            type: 'PVP',
            image: '/assets/gamemodes/coinflip.png',
            link: '/coinflip',
            color: '#6c5ce7',
            colorSecondary: '#a29bfe',
            isHouse: true
        },
        {
            icon: '/assets/games/packs.png',
            title: 'CASES',
            type: 'PVP',
            image: '/assets/gamemodes/cases.png',
            link: '/cases',
            color: '#a29bfe',
            colorSecondary: '#fd79a8',
            isHouse: true
        },
        {
            icon: '/assets/games/jackpot.png',
            title: 'JACKPOT',
            type: 'PVP',
            image: '/assets/gamemodes/jackpot.png',
            link: '/jackpot',
            color: '#fd79a8',
            colorSecondary: '#fdcb6e',
            isHouse: true
        },
    ]

    return (
        <>
            <div class='games-container'>
                <div class='games'>
                    {/* Header */}
                    <div class='games-header'>
                        <h2 class='title'>House Games</h2>
                        <span class='count'>{gamemodes.length} games available</span>
                    </div>

                    {/* Games Grid */}
                    <div class='games-grid'>
                        <For each={gamemodes}>{(game) => (
                            <div class='game-card'>
                                <BlurImage 
                                    src={game.icon}
                                    alt={game.title}
                                    onClick={() => navigate(game.link)}
                                    class="game-blur-image"
                                    isHouse={game.isHouse}
                                />
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
                margin-bottom: 2rem;
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
              }

              .title {
                font-size: 1.5rem;
                font-weight: 700;
                color: #ffffff;
                margin: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              }

              .count {
                font-size: 0.875rem;
                color: #8aa3b8;
                font-weight: 500;
              }

              .games-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 1rem;
              }

              .game-card {
                aspect-ratio: 3/4;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
              }

              .game-card:hover {
                transform: translateY(-4px);
                background: rgba(255, 255, 255, 0.08);
              }

              .game-card :global(.game-blur-image) {
                width: 100%;
                height: 100%;
                border-radius: 12px;
              }

              /* Responsive Design */
              @media (max-width: 768px) {
                .games-grid {
                  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                  gap: 0.75rem;
                }

                .title {
                  font-size: 1.25rem;
                }

                .game-card {
                  border-radius: 8px;
                }

                .game-card :global(.game-blur-image) {
                  border-radius: 8px;
                }
              }

              @media (max-width: 480px) {
                .games-grid {
                  grid-template-columns: repeat(3, 1fr);
                  gap: 0.5rem;
                }
              }
            `}</style>
        </>
    );
}

export default GamesList;
