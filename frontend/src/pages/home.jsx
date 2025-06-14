import GamesList from "../components/Home/gameslist";
import RainBanner from "../components/Home/rainbanner";
import {createSignal, For, onMount, onCleanup, Show, createEffect} from "solid-js";
import Bets from "../components/Home/bets";
import {useNavigate} from "@solidjs/router";
import RewardsBanner from "../components/Home/rewardsbanner";
import {createNotification} from "../util/api";
import SlotsList from "../components/Home/slotslist";
import SurveysBanner from "../components/Surveys/surveysbanner";
import BannerCarousel from "../components/Home/BannerCarousel";
import ProvidersSection from "../components/Slots/ProvidersSection";
import SmartImage from "../components/SmartImage";



// Memoize METHODS to prevent recreation on every render
const METHODS = Object.freeze({
    'bitcoin': {
        src: '/assets/cryptos/branded/BTC.svg',
        name: 'Bitcoin',
        symbol: 'BTC',
        url: 'bitcoin'
    },
    'tether': {
        src: '/assets/cryptos/branded/USDT.svg',
        name: 'Tether',
        symbol: 'USDT',
        url: 'tether'
    },
    'usdc': {
        src: '/assets/cryptos/branded/USDC.svg',
        name: 'USDC',
        symbol: 'USDC',
        url: 'usdc'
    },
    'ethereum': {
        src: '/assets/cryptos/branded/ETH.svg',
        name: 'Ethereum',
        symbol: 'ETH',
        url: 'ethereum'
    },
    'ripple': {
        src: '/assets/cryptos/branded/XRP.svg',
        name: 'Ripple',
        symbol: 'XRP',
        url: 'ripple'
    },
    'tron': {
        src: '/assets/cryptos/branded/TRX.svg',
        name: 'TRON',
        symbol: 'TRX',
        url: 'tron'
    },
    'litecoin': {
        src: '/assets/cryptos/branded/LTC.svg',
        name: 'Litecoin',
        symbol: 'LTC',
        url: 'litecoin'
    },
    'dogecoin': {
        src: '/assets/cryptos/branded/DOGE.svg',
        name: 'Dogecoin',
        symbol: 'DOGE',
        url: 'dogecoin'
    },
    'bnb': {
        src: '/assets/cryptos/branded/BNB.svg',
        name: 'BNB',
        symbol: 'BNB',
        url: 'bnb'
    }
});

// Pre-compute crypto keys to avoid recreation
const CRYPTO_KEYS = Object.keys(METHODS);
const TRIPLE_CRYPTO_KEYS = [...CRYPTO_KEYS, ...CRYPTO_KEYS, ...CRYPTO_KEYS];

function Home(props) {
    const [cryptoVisible, setCryptoVisible] = createSignal(false)
    const [method, setMethod] = createSignal('')
    const [isVisible, setIsVisible] = createSignal(true)
    const [isScrolling, setIsScrolling] = createSignal(false)
    
    let cryptoContainerRef;

    // Set up observers and handlers only once to prevent flickering
    onMount(() => {
        // Set up intersection observer only once
        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.1 }
        )
        
        if (cryptoContainerRef) {
            observer.observe(cryptoContainerRef)
        }
        
        // Set up scroll handler only once
        let scrollTimeout;
        const handleScroll = () => {
            setIsScrolling(true)
            clearTimeout(scrollTimeout)
            scrollTimeout = setTimeout(() => setIsScrolling(false), 150)
        }
        
        window.addEventListener('scroll', handleScroll, { passive: true })
        
        onCleanup(() => {
            observer.disconnect()
            window.removeEventListener('scroll', handleScroll)
            clearTimeout(scrollTimeout)
        })
    })

    const navigate = useNavigate()

    return (
        <>
            <div class='home-container fadein'>

                {/* DISABLED PROFILING: */}
                <BannerCarousel user={props?.user} />
                
                {/* <div class='banners'>
                    <RewardsBanner user={props?.user}/>
                    <RainBanner/>
                </div> */}
                                 
                {/* User Favorites - only show if user is logged in */}
                <Show when={props.user}>
                    <SlotsList 
                        title="Your Favorites"
                        showFavoritesOnly={true}
                        limit={15}
                        viewAllLink="/favorites"
                        icon="/assets/GameIcons/favourites.svg"
                        user={props.user}
                    />
                </Show>

                <GamesList/>
                
                {/* Load all sections immediately to prevent flickering */}
                <SlotsList 
                    title="Featured Slots"
                    showFeaturedOnly={true}
                    limit={15}
                    viewAllLink="/slots?featured=true"
                    icon="/assets/GameIcons/favourites.svg"
                    user={props.user}
                />

                <SlotsList 
                    title="Popular Slots"
                    showPopular={true}
                    limit={15}
                    viewAllLink="/slots?popular=true"
                    icon="/assets/GameIcons/popular.svg"
                    user={props.user}
                />

                <SlotsList 
                    title="New Releases"
                    showNewOnly={true}
                    limit={15}
                    viewAllLink="/slots?new=true"
                    icon="/assets/GameIcons/new.svg"
                    user={props.user}
                />

                <ProvidersSection />
                
                <SlotsList 
                    title="Video Slots"
                    type="video-slots"
                    limit={15}
                    viewAllLink="/slots?type=video-slots"
                    icon="/assets/GameIcons/slot.svg"
                    user={props.user}
                />
            
                <SlotsList 
                    title="Game Shows"
                    type="live"
                    limit={15}
                    viewAllLink="/slots?type=live"
                    icon="/assets/GameIcons/game-shows.svg"
                    user={props.user}
                />
                
             
                
             

                {/* <SurveysBanner/> */}

                    <div class='crypto-carousel-container' ref={cryptoContainerRef}>
                        <div class='crypto-carousel'>
                            <div class={`crypto-track ${!isVisible() || isScrolling() ? 'paused' : ''}`} 
                                 style={{ 
                                   'transform': 'translateZ(0)',
                                   'will-change': isScrolling() ? 'auto' : 'transform'
                                 }}>
                                <For each={TRIPLE_CRYPTO_KEYS}>{(key, index) => (
                                    <div class={'crypto-method ' + (method() === key ? ' selected' : '') + (method() !== '' && method() !== key ? ' unactive' : '')}
                                         onClick={() => {
                                           const newMethod = method() === key ? '' : key;
                                           setMethod(newMethod);
                                         }}>
                                        <SmartImage src={METHODS[key].src} alt={METHODS[key].name} draggable={false}/>
                                        <div class='crypto-info'>
                                            <span class='crypto-name'>{METHODS[key].name}</span>
                                            <span class='crypto-symbol'>{METHODS[key].symbol}</span>
                                        </div>
                                    </div>
                                )}</For>
                            </div>
                        </div>
                        
                        <div class='selected-crypto-info'>
                            {METHODS[method()] ? (
                                <div class='selected-display'>
                                    <span class='selected-text'>Selected: <span class='gold'>{METHODS[method()].name} ({METHODS[method()].symbol})</span></span>
                                </div>
                            ) : (
                                <div class='selected-display'>
                                    <span class='selected-text'>Click any cryptocurrency to select</span>
                                </div>
                            )}
                        </div>
                    </div>

                <div class='deposit-container'>
                    <button class='deposit-button-home' disabled={!METHODS[method()]} onClick={() => {
                        // Dispatch custom event to trigger wallet modal
                        const selectedCrypto = METHODS[method()];
                        if (selectedCrypto) {
                            const event = new CustomEvent('openWalletModal', {
                                detail: {
                                    crypto: {
                                        name: selectedCrypto.name,
                                        id: selectedCrypto.symbol,
                                                    apiId: selectedCrypto.symbol === 'USDT' ? 'USDT' :
              selectedCrypto.symbol === 'BNB' ? 'BNB' : 
                                               selectedCrypto.symbol,
                                        img: `/cryptos/${selectedCrypto.symbol}.png`
                                    }
                                }
                            });
                            window.dispatchEvent(event);
                        }
                    }}>
                        <div class='deposit-button-home-content'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span>DEPOSIT {METHODS[method()]?.symbol || 'CRYPTO'}</span>
                        </div>
                    </button>
                </div>

                    <Bets user={props.user}/>
            </div>



            <style jsx>{`
              .home-container {
                width: 100%;
                max-width: 1175px;
                height: fit-content;

                box-sizing: border-box;
                padding: 30px 0 0 10px;
                margin: 0 auto;
                
                /* Optimize scroll performance */
                backface-visibility: hidden;
                perspective: 1000px;
                transform: translateZ(0);
                will-change: scroll-position;
                
                /* Mobile scroll optimization */
                -webkit-overflow-scrolling: touch;
                overflow-x: hidden;
                
                /* Prevent layout shift and flickering */
                min-height: 80vh;
                contain: layout style paint;
              }
              
              /* Disable fade-in animation to prevent flicker */
              .home-container.fadein {
                animation: none !important;
                opacity: 1 !important;
              }

              .banners {
                width: 100%;
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
              }

              .crypto-carousel-container {
                width: 100%;
                max-width: 1000px;
                margin: 40px auto;
                padding: 0 20px;
              }

              .crypto-carousel {
              
                border-radius: 10px;
                overflow: hidden;
              
                position: relative;
                padding: 20px 0;
              }

              .crypto-carousel::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                width: 60px;
                height: 100%;
                background: linear-gradient(90deg, rgb(15 11 39), transparent);
                z-index: 2;
                pointer-events: none;
              }

              .crypto-carousel::after {
                content: '';
                position: absolute;
                right: 0;
                top: 0;
                width: 60px;
                height: 100%;
                background: linear-gradient(270deg, rgb(15 11 39), transparent);
                z-index: 2;
                pointer-events: none;
              }

              .crypto-track {
                display: flex;
                gap: 16px;
                animation: scroll 120s linear infinite;
                width: max-content;
                padding: 0 60px;
                will-change: transform;
                transform: translateZ(0) translateX(0);
                contain: layout style paint;
                pointer-events: none;
              }

              .crypto-track.paused {
                animation-play-state: paused;
              }

              /* Pause animation during page scroll to improve performance */
              @media (prefers-reduced-motion: reduce) {
                .crypto-track {
                  animation: none;
                }
              }

              /* Reduce animation frequency on lower-end devices */
              @media (max-resolution: 1dppx) {
                .crypto-track {
                  animation-duration: 200s; /* Even slower on low-DPI screens */
                }
              }

              @keyframes scroll {
                0% {
                  transform: translateZ(0) translateX(0);
                }
                100% {
                  transform: translateZ(0) translateX(-33.33%);
                }
              }

              .crypto-carousel:hover .crypto-track,
              .crypto-carousel:focus-within .crypto-track {
                animation-play-state: paused;
              }

              /* Pause animation when page is not visible to save resources */
              @media (prefers-reduced-motion: reduce) {
                .crypto-track {
                  animation: none;
                }
              }

              .selected-crypto-info {
                text-align: center;
                margin-top: 16px;
                padding: 14px 20px;
                background: rgba(26, 35, 50, 0.3);
                border: 1px solid rgba(78, 205, 196, 0.08);
                border-radius: 8px;
                backdrop-filter: blur(8px);
              }

              .selected-display {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-size: 13px;
                font-weight: 600;
                color: #8aa3b8;
              }

              .selected-text .gold {
                color: #4ecdc4;
                font-weight: 700;
              }

              .crypto-method {
                pointer-events: auto;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 14px 12px;
                border-radius: 8px;
                cursor: pointer;
                transition: transform 0.15s ease;
                background: rgba(45, 75, 105, 0.25);
                border: 1px solid rgba(78, 205, 196, 0.15);
                min-width: 88px;
                flex-shrink: 0;
                position: relative;
                color: #8aa3b8;
                contain: layout style;
                transform: translateZ(0);
                will-change: transform;
              }

              .crypto-method::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                height: 100%;
                width: 0;
                background: linear-gradient(90deg, rgba(78, 205, 196, 0.2), transparent);
                transition: width 0.3s ease; /* Simplified transition */
                border-radius: 8px 0 0 8px;
              }

              .crypto-method:hover::before {
                width: 3px;
              }

              .crypto-method:hover {
                color: #ffffff;
                transform: translateZ(0) translateY(-2px);
                border-color: rgba(78, 205, 196, 0.3);
              }

              .crypto-method.selected {
                color: #ffffff;
                transform: translateZ(0) translateY(-1px);
                border-color: rgba(78, 205, 196, 0.4);
              }

              .crypto-method.unactive {
                filter: grayscale(100%);
                opacity: 0.4;
              }

              .crypto-method img {
                width: 36px;
                height: 36px;
                object-fit: contain;
                transition: all 0.3s ease;
                opacity: 0.7;
              }

              .crypto-method:hover img {
                opacity: 1;
                filter: drop-shadow(0 0 4px rgba(78, 205, 196, 0.3));
              }

              .crypto-method.selected img {
                opacity: 1;
                filter: drop-shadow(0 0 6px rgba(78, 205, 196, 0.4));
              }

              .crypto-info {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;
                text-align: center;
              }

              .crypto-name {
                font-size: 11px;
                font-weight: 600;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.1;
                transition: color 0.3s ease;
                color: inherit;
              }

              .crypto-symbol {
                font-size: 9px;
                font-weight: 500;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                transition: color 0.3s ease;
                color: #6b7f92;
                opacity: 0.8;
              }

              .crypto-method:hover .crypto-symbol,
              .crypto-method.selected .crypto-symbol {
                color: #4ecdc4;
                opacity: 1;
              }

              .deposit-container {
                width: 100%;

                display: flex;
                align-items: center;
                justify-content: center;

                position: relative;
                margin-bottom: 50px;
                z-index: 5;
                pointer-events: auto;
              }

              .deposit-container:before {
                height: 1px;
                width: 100%;
                position: absolute;
                content: '';
                left: 0;
                top: 50%;
                background: linear-gradient(270deg, rgba(90, 84, 153, 0.00) 0%, #5A5499 49.47%, rgba(90, 84, 153, 0.00) 100%);
                z-index: -1;
                pointer-events: none;
              }

              .deposit-button-home {
                background: rgba(45, 75, 105, 0.25);
                border: 1px solid rgba(78, 205, 196, 0.2);
                border-radius: 8px;
                color: #8aa3b8;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(8px);
                box-sizing: border-box;
                position: relative;
                outline: none;
                min-width: 180px;
                height: 48px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                font-weight: 600;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                z-index: 10;
                pointer-events: auto;
              }

              .deposit-button-home:hover:not(:disabled) {
                background: rgba(78, 205, 196, 0.15);
                color: #ffffff;
                transform: translateY(-2px);
              }

              .deposit-button-home:active:not(:disabled) {
                transform: translateY(-1px);
              }

              .deposit-button-home:disabled {
                background: rgba(45, 75, 105, 0.15);
                border-color: rgba(78, 205, 196, 0.1);
                color: #6b7f92;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
              }

              .deposit-button-home-content {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                height: 100%;
              }

              .deposit-button-home-content svg {
                transition: transform 0.2s ease;
              }

              .deposit-button-home:hover:not(:disabled) .deposit-button-home-content svg {
                transform: translateY(1px);
              }

              @media only screen and (max-width: 1000px) {
                .home-container {
                  padding-bottom: 90px;
                }

                .banners {
                  flex-direction: column;
                }

                .crypto-carousel-container {
                  padding: 0 15px;
                }

                .crypto-track {
                  gap: 14px;
                  padding: 0 50px;
                }

                .crypto-method {
                  padding: 12px 10px;
                  gap: 6px;
                  min-width: 80px;
                }

                .crypto-method img {
                  width: 32px;
                  height: 32px;
                }

                .crypto-name {
                  font-size: 10px;
                }

                .crypto-symbol {
                  font-size: 8px;
                }

                .selected-display {
                  font-size: 12px;
                }

                .crypto-carousel::before,
                .crypto-carousel::after {
                  width: 50px;
                }
              }

              @media only screen and (max-width: 600px) {
                .crypto-carousel-container {
                  padding: 0 10px;
                }

                .crypto-carousel {
                  padding: 16px 0;
                }

                .crypto-track {
                  gap: 12px;
                  animation: scroll 60s linear infinite;
                  padding: 0 40px;
                }

                .crypto-method {
                  padding: 10px 8px;
                  gap: 5px;
                  min-width: 72px;
                }

                .crypto-method img {
                  width: 28px;
                  height: 28px;
                }

                .crypto-name {
                  font-size: 9px;
                }

                .crypto-symbol {
                  font-size: 8px;
                }

                .selected-display {
                  font-size: 11px;
                }

                .selected-crypto-info {
                  padding: 12px 16px;
                  margin-top: 12px;
                }

                .crypto-carousel::before,
                .crypto-carousel::after {
                  width: 40px;
                }

                .deposit-button-home {
                  min-width: 160px;
                  height: 44px;
                  font-size: 12px;
                }

                .deposit-button-home-content svg {
                  width: 14px;
                  height: 14px;
                }
              }

              /* More aggressive performance mode - disable ALL animations when FPS < 30 */
              body.performance-mode .crypto-track,
              body.performance-mode .title-highlight,
              body.performance-mode .bg-pattern,
              body.performance-mode .main-image img,
              body.performance-mode [class*="shimmer"],
              body.performance-mode [class*="glow"],
              body.performance-mode [class*="float"],
              body.performance-mode [class*="spin"],
              body.performance-mode [class*="pulse"],
              body.performance-mode .loader {
                animation: none !important;
                transition: none !important;
              }

              body.performance-mode .crypto-method:hover,
              body.performance-mode .banner-image:hover .main-image img {
                transform: none !important;
              }

              /* Remove expensive visual effects in performance mode */
              body.performance-mode * {
                backdrop-filter: none !important;
                text-shadow: none !important;
                box-shadow: none !important;
                filter: none !important;
              }

              /* Simple fallback styles for performance mode */
              body.performance-mode .crypto-method.selected {
                background: rgba(78, 205, 196, 0.2) !important;
                border-color: rgba(78, 205, 196, 0.8) !important;
              }
            `}</style>
        </>
    );
}

export default Home;
