import {createSignal, createMemo, For, onMount, onCleanup} from "solid-js";
import {A, useNavigate} from "@solidjs/router";
import GameTag from "./gametag";
import GameInfo from "./gameinfo";
import games from "../NavBar/games";
import BlurImage from "../UI/BlurImage";
import SmartImage from "../SmartImage";
import { AiOutlineEye, AiOutlineArrowLeft, AiOutlineArrowRight } from 'solid-icons/ai';
import './gameslist.css';

// Pre-compute image sources outside component to avoid recalculation
const precomputeImageSources = (src) => {
    const basePath = src.replace(/\.[^/.]+$/, "");
    const extension = src.split('.').pop();
    
    return {
        webp: {
            small: `${basePath}-150w.webp`,
            medium: `${basePath}-300w.webp`,
            large: `${basePath}-600w.webp`
        },
        fallback: {
            small: `${basePath}-150w.${extension}`,
            medium: `${basePath}-300w.${extension}`,
            large: `${basePath}-600w.${extension}`
        },
        original: src
    };
};

// Optimized image component for game icons
function GameIcon(props) {
    // Use pre-computed sources to avoid expensive memoization during scroll
    const imageSources = precomputeImageSources(props.src);

    return (
        <picture class="housegames-icon-picture">
            {/* WebP sources with responsive sizes */}
            <source
                media="(max-width: 480px)"
                srcSet={`${imageSources.webp.small} 1x, ${imageSources.webp.medium} 2x`}
                type="image/webp"
            />
            <source
                media="(max-width: 768px)"
                srcSet={`${imageSources.webp.medium} 1x, ${imageSources.webp.large} 2x`}
                type="image/webp"
            />
            <source
                srcSet={`${imageSources.webp.medium} 1x, ${imageSources.webp.large} 2x`}
                type="image/webp"
            />
            
            {/* Fallback sources */}
            <source
                media="(max-width: 480px)"
                srcSet={`${imageSources.fallback.small} 1x, ${imageSources.fallback.medium} 2x`}
            />
            <source
                media="(max-width: 768px)"
                srcSet={`${imageSources.fallback.medium} 1x, ${imageSources.fallback.large} 2x`}
            />
            
            <img
                src={imageSources.fallback.medium}
                alt={props.alt}
                loading="lazy"
                decoding="async"
                onClick={props.onClick}
                class={`housegames-icon ${props.class || ''}`}
                onError={(e) => {
                    // Simplified fallback to avoid complex operations during scroll
                    e.target.src = imageSources.original;
                }}
            />
        </picture>
    );
}

// Pre-define static gamemodes data to avoid recreation
const STATIC_GAMEMODES = [
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
];

function GamesList() {
    const navigate = useNavigate();
    let gamesRef;
    const [showCarousel, setShowCarousel] = createSignal(false);

    // Use static data instead of memoization
    const gamemodes = () => STATIC_GAMEMODES;

    // Optimized scroll function - remove memoization that causes overhead
    const scrollGames = (direction) => {
        if (!gamesRef) return;
        const scrollAmount = gamesRef.clientWidth * direction * 0.8;
        gamesRef.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    };

    // Throttled resize handler to prevent excessive calls
    let resizeTimeout;
    const checkIfCarouselNeeded = () => {
        // Clear existing timeout to throttle resize events
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        
        resizeTimeout = setTimeout(() => {
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
            const totalWidth = (gameCardWidth * STATIC_GAMEMODES.length) + (gap * (STATIC_GAMEMODES.length - 1));
            
            setShowCarousel(totalWidth > containerWidth);
        }, 16); // ~60fps throttling
    };

    onMount(() => {
        checkIfCarouselNeeded();
        window.addEventListener('resize', checkIfCarouselNeeded, { passive: true });
        
        onCleanup(() => {
            window.removeEventListener('resize', checkIfCarouselNeeded);
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
        });
    });

    // Use static length instead of memoization
    const totalGames = () => STATIC_GAMEMODES.length;

    return (
        <>
            <div class='housegames-container'>
                <div class='housegames-wrapper'>
                    {/* Header */}
                    <div class='housegames-header'>
                        <div class='housegames-header-content'>
                            <div class='housegames-header-left'>
                                <div class='housegames-header-icon'>
                                    <SmartImage src="/assets/GameIcons/chip.svg" alt="House Games" />
                                </div>
                                
                                <div class='housegames-header-text'>
                                    <h2 class='housegames-title'>House Games</h2>
                                    <span class='housegames-count'>{totalGames()} games available</span>
                                </div>
                            </div>

                            {showCarousel() && (
                                <div class='housegames-header-right'>
                                    <div class='housegames-nav-controls'>
                                        <button class='housegames-nav-btn' onClick={() => scrollGames(-1)} type="button">
                                            <AiOutlineArrowLeft size={16} />
                                        </button>
                                        
                                        <button class='housegames-nav-btn' onClick={() => scrollGames(1)} type="button">
                                            <AiOutlineArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div class='housegames-header-divider'></div>
                    </div>

                    {/* Games Grid/Carousel */}
                    <div 
                        class={showCarousel() ? 'housegames-carousel' : 'housegames-grid'} 
                        ref={gamesRef}
                    >
                        <For each={gamemodes()} fallback={null}>
                            {(game, index) => (
                                <div class='housegames-card'>
                                    <GameIcon 
                                        src={game.icon}
                                        alt={game.title}
                                        onClick={() => navigate(game.link)}
                                        class="housegames-icon-optimized"
                                    />
                                </div>
                            )}
                        </For>
                    </div>
                </div>
            </div>
        </>
    );
}

export default GamesList;
