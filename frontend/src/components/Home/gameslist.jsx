import {createSignal, For, onMount} from "solid-js";
import {A, useNavigate} from "@solidjs/router";
import GameTag from "./gametag";
import GameInfo from "./gameinfo";
import games from "../NavBar/games";
import BlurImage from "../UI/BlurImage";
import { AiOutlineEye, AiOutlineArrowLeft, AiOutlineArrowRight } from 'solid-icons/ai';

function GamesList() {
    const navigate = useNavigate();
    let gamesRef;
    const [showCarousel, setShowCarousel] = createSignal(false);

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
        {
          tag: 'new',
          icon: '/assets/games/slots.png',
          title: 'SLOTS',
          type: 'PROVIDER',
          image: '/assets/gamemodes/slots.png',
          link: '/slots',
          color: '#4ecdc4',
          colorSecondary: '#44a08d',
          isHouse: true
      }
    ]

    onMount(() => {
        checkIfCarouselNeeded();
        window.addEventListener('resize', checkIfCarouselNeeded);
        return () => window.removeEventListener('resize', checkIfCarouselNeeded);
    });

    function checkIfCarouselNeeded() {
        if (!gamesRef) return;
        
        // Check if we're on mobile (always show carousel on small screens)
        if (window.innerWidth <= 768) {
            setShowCarousel(true);
            return;
        }

        // For desktop, check if all games fit in the container
        const containerWidth = gamesRef.parentElement.clientWidth;
        const gameCardWidth = 150; // minmax from CSS
        const gap = 16; // 1rem gap
        const totalWidth = (gameCardWidth * gamemodes.length) + (gap * (gamemodes.length - 1));
        
        setShowCarousel(totalWidth > containerWidth);
    }

    function scrollGames(direction) {
        if (!gamesRef) return;
        gamesRef.scrollBy({
            left: gamesRef.clientWidth * direction * 0.8,
            behavior: 'smooth'
        });
    }

    return (
        <>
            <div class='games-container'>
                <div class='games'>
                    {/* Header */}
                    <div class='games-header'>
                        <div class='header-content'>
                            <div class='header-left'>
                                <div class='header-icon'>
                                    <img src="/assets/GameIcons/chip.svg" alt="House Games" />
                                </div>
                                
                                <div class='header-text'>
                                    <h2 class='title'>House Games</h2>
                                    <span class='count'>{gamemodes.length} games available</span>
                                </div>
                            </div>

                            {showCarousel() && (
                                <div class='header-right'>
                                    <div class='nav-controls'>
                                        <button class='nav-btn' onClick={() => scrollGames(-1)} type="button">
                                            <AiOutlineArrowLeft size={16} />
                                        </button>
                                        
                                        <button class='nav-btn' onClick={() => scrollGames(1)} type="button">
                                            <AiOutlineArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div class='header-divider'></div>
                    </div>

                    {/* Games Grid/Carousel */}
                    <div 
                        class={showCarousel() ? 'games-carousel' : 'games-grid'} 
                        ref={gamesRef}
                    >
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


              .header-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 0.75rem;
              }

              .header-left {
                display: flex;
                align-items: center;
                gap: 0.75rem;
              }

              .header-right {
                display: flex;
                align-items: center;
                gap: 0.75rem;
              }

              .header-text {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
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

              .header-icon {
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              }

              .header-icon img {
                width: 32px;
                height: 32px;
              }

              .header-divider {
          height: 1px;
          background: linear-gradient(90deg, rgb(31 36 68) 0%, rgba(78, 205, 196, 0.1) 30%, transparent 100%);
        }

              .nav-controls {
                display: flex;
                gap: 0.25rem;
              }

              .nav-btn {
          width: 36px;
          height: 36px;
          padding: 0;
          background: #0F0B27;
          border:1px solid rgb(56 50 93);
          border-radius: 6px;
          color: #ffffff;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-btn:hover {
          border-color: rgb(31 36 68);
    background: rgb(20 16 43);
    transform: translateY(-1px);
}

        .nav-btn svg {
          opacity: 0.8;
          transition: all 0.3s ease;
        }

        .nav-btn:hover svg {
          opacity: 1;
          transform: scale(1.1);
        }

        .nav-btn:active {
          transform: translateY(0);
        }

              .games-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                gap: 1rem;
              }

              .games-carousel {
                display: flex;
                gap: 1rem;
                padding: 10px 0 0 0;
                border-radius: 12px;
                min-height: 200px;
                overflow-x: auto;
                scrollbar-width: none;
              }
              
              .games-carousel::-webkit-scrollbar {
                display: none;
              }

              .game-card {
                aspect-ratio: 3/4;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
                flex-shrink: 0;
              }

              .games-carousel .game-card {
                min-width: 150px;
                width: 150px;
                height: 200px;
              }

              .game-card:hover {
                transform: translateY(-4px);
                background: rgba(255, 255, 255, 0.08);
              }

              .games-carousel .game-card:hover {
                transform: translateY(-4px) scale(1.02);
                box-shadow: 
                  0 8px 16px rgba(0, 0, 0, 0.15),
                  0 0 0 1px rgba(255, 107, 107, 0.2),
                  0 0 20px rgba(255, 107, 107, 0.1);
              }

              .game-card :global(.game-blur-image) {
                width: 100%;
                height: 100%;
                border-radius: 12px;
              }

              /* Responsive Design */
              @media (max-width: 768px) {
                .games-container {
                  margin-top: 1.25rem;
                }

                .header-content {
                  flex-direction: column;
                  align-items: stretch;
                  gap: 1rem;
                }

                .header-right {
                  justify-content: center;
                }

                                 .title {
                   font-size: 1rem;
                 }

                .games-grid {
                  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                  gap: 0.75rem;
                }

                .games-carousel {
                  gap: 0.75rem;
                  padding: 0.75rem 0;
                }

                .games-carousel .game-card {
                  min-width: 130px;
                  width: 130px;
                  height: 170px;
                }

                .game-card {
                  border-radius: 8px;
                }

                .game-card :global(.game-blur-image) {
                  border-radius: 8px;
                }
              }

              @media (max-width: 480px) {
                .header-content {
                  gap: 0.75rem;
                }

                .games-grid {
                  grid-template-columns: repeat(3, 1fr);
                  gap: 0.5rem;
                }

                .games-carousel {
                  gap: 0.5rem;
                  padding: 0.5rem 0;
                }

                .games-carousel .game-card {
                  min-width: 120px;
                  width: 120px;
                  height: 150px;
                }
              }
            `}</style>
        </>
    );
}

export default GamesList;
