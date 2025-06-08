import { createSignal, createEffect, onCleanup } from "solid-js";

const BannerCarousel = (props) => {
    const [currentSlide, setCurrentSlide] = createSignal(0);
    const [isAutoPlaying, setIsAutoPlaying] = createSignal(true);
    const [isTransitioning, setIsTransitioning] = createSignal(false);
    let autoPlayInterval;

    // Modern banner data with better gradients and content
    const banners = [
        {
            id: 1,
            name: "100%",
            title: "ENJOY YOUR",
            highlight: "100% BONUS",
            subtitle: "ON FIRST DEPOSIT",
            description: "Double your first deposit and start your winning journey!",
            buttonText: "CLAIM NOW",
            buttonAction: () => {
                console.log("First deposit bonus claimed");
            },
            theme: {
                primary: "#FF6B35",
                secondary: "#F7931E", 
                accent: "#FFE66D",
                background: "linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFE66D 100%)"
            }
        },
        {
            id: 2,
            name: "Rain",
            title: "RAIN EVENT",
            highlight: "ACTIVE NOW",
            subtitle: "FREE COINS HOURLY",
            description: "Join thousands of players in our legendary rain events!",
            buttonText: "JOIN RAIN",
            buttonAction: () => {
                console.log("Rain event joined");
            },
            theme: {
                primary: "#4ECDC4",
                secondary: "#44A08D",
                accent: "#96CEB4",
                background: "linear-gradient(135deg, #4ECDC4 0%, #44A08D 50%, #96CEB4 100%)"
            }
        },
        {
            id: 3,
            name: "VIP",
            title: "VIP CLUB",
            highlight: "EXCLUSIVE",
            subtitle: "PREMIUM REWARDS",
            description: "Unlock VIP perks, higher limits, and exclusive bonuses!",
            buttonText: "UPGRADE NOW",
            buttonAction: () => {
                console.log("VIP upgrade clicked");
            },
            theme: {
                primary: "#667EEA",
                secondary: "#764BA2",
                accent: "#A8EDEA",
                background: "linear-gradient(135deg, #667EEA 0%, #764BA2 50%, #A8EDEA 100%)"
            }
        }
    ];

    // Auto-play functionality
    createEffect(() => {
        if (isAutoPlaying()) {
            autoPlayInterval = setInterval(() => {
                nextSlide();
            }, 600000000); // Change slide every 6 seconds
        } else {
            clearInterval(autoPlayInterval);
        }
    });

    onCleanup(() => {
        clearInterval(autoPlayInterval);
    });

    const nextSlide = () => {
        if (isTransitioning()) return;
        setIsTransitioning(true);
        setCurrentSlide((prev) => (prev + 1) % banners.length);
        setTimeout(() => setIsTransitioning(false), 600);
    };

    const prevSlide = () => {
        if (isTransitioning()) return;
        setIsTransitioning(true);
        setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
        setTimeout(() => setIsTransitioning(false), 600);
    };

    const goToSlide = (index) => {
        if (isTransitioning() || index === currentSlide()) return;
        setIsTransitioning(true);
        setCurrentSlide(index);
        setIsAutoPlaying(false);
        setTimeout(() => {
            setIsTransitioning(false);
            setIsAutoPlaying(true);
        }, 600);
    };

    return (
        <>
            <div class="modern-banner-carousel">
                <div class="carousel-wrapper">
                    {/* Current slide display */}
                    <div class="current-slide" data-slide={currentSlide()} style={`background: ${banners[currentSlide()].theme.background}`}>
                        <div class="slide-overlay"></div>
                        
                        <div class="slide-content">
                            <div class="content-left">
                                <h1 class="main-title">
                                    <span class="title-normal">{banners[currentSlide()].title}</span>
                                    <span class="title-highlight" style={`color: ${banners[currentSlide()].theme.accent}`}>
                                        {banners[currentSlide()].highlight}
                                    </span>
                                </h1>
                                
                                <h2 class="subtitle">{banners[currentSlide()].subtitle}</h2>
                                
                                <p class="description">{banners[currentSlide()].description}</p>
                                
                                <button 
                                    class="cta-button"
                                    style={`
                                        background: linear-gradient(45deg, ${banners[currentSlide()].theme.primary}, ${banners[currentSlide()].theme.secondary});
                                        box-shadow: 0 8px 32px ${banners[currentSlide()].theme.primary}40;
                                    `}
                                    onClick={banners[currentSlide()].buttonAction}
                                >
                                    <span>{banners[currentSlide()].buttonText}</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                </button>


                            </div>
                            
                            <div class="content-right">
                                <div class="banner-image">
                                    {/* Background decorative image layer */}
                                    <div class="background-decoration">
                                        {currentSlide() === 0 && (
                                            <img src="/assets/backgrounds/deposit-pattern.webp" alt="" class="bg-pattern" onError={(e) => {
                                                e.target.style.display = 'none';
                                            }} />
                                        )}
                                        {currentSlide() === 1 && (
                                            <img src="/assets/backgrounds/rain-pattern.webp" alt="" class="bg-pattern" onError={(e) => {
                                                e.target.style.display = 'none';
                                            }} />
                                        )}
                                        {currentSlide() === 2 && (
                                            <img src="/assets/backgrounds/vip-pattern.webp" alt="" class="bg-pattern" onError={(e) => {
                                                e.target.style.display = 'none';
                                            }} />
                                        )}
                                    </div>

                                    {/* Main promotional image layer */}
                                    <div class="main-image">
                                        {currentSlide() === 0 && (
                                            <img src="/assets/banners/deposit-bonus.webp" alt="Deposit Bonus" onError={(e) => {
                                                e.target.style.display = 'none';
                                            }} />
                                        )}
                                        {currentSlide() === 1 && (
                                            <img src="/assets/banners/rain-event.webp" alt="Rain Event" onError={(e) => {
                                                e.target.style.display = 'none';
                                            }} />
                                        )}
                                        {currentSlide() === 2 && (
                                            <img src="/assets/banners/vip-rewards.webp" alt="VIP Rewards" onError={(e) => {
                                                e.target.style.display = 'none';
                                            }} />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div class="progress-container">
                            <div class="progress-bar" style={`width: ${((currentSlide() + 1) / banners.length) * 100}%; background: ${banners[currentSlide()].theme.accent}`}></div>
                        </div>
                    </div>



                    {/* Slide indicators */}
                    <div class="slide-indicators">
                        {banners.map((banner, index) => (
                            <button 
                                class={`indicator ${currentSlide() === index ? 'active' : ''}`}
                                style={currentSlide() === index ? `background: ${banner.theme.accent}; box-shadow: 0 0 20px ${banner.theme.accent}60` : ''}
                                onClick={() => goToSlide(index)}
                                disabled={isTransitioning()}
                            >
                                <span class="indicator-text">{banner.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .modern-banner-carousel {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto 40px;
                    position: relative;
                }

                .carousel-wrapper {
                    position: relative;
                    border-radius: clamp(12px, 2vw, 24px);
                    overflow: hidden;
                    box-shadow: 
                        0 25px 50px -12px rgba(0, 0, 0, 0.25),
                        0 0 0 1px rgba(255, 255, 255, 0.05);
                }

                .current-slide {
                    position: relative;
                    height: clamp(200px, 25vw, 320px);
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                }

                .slide-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: 
                        linear-gradient(90deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 30%, transparent 70%);
                    z-index: 2;
                }

                .slide-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    height: 100%;
                    padding: clamp(20px, 4vw, 50px);
                    position: relative;
                    z-index: 2;
                    gap: clamp(20px, 4vw, 50px);
                }

                .content-left {
                    flex: 0 0 40%;
                    max-width: 40%;
                    animation: slideInLeft 0.8s cubic-bezier(0.23, 1, 0.32, 1);
                    position: relative;
                    z-index: 3;
                }



                .main-title {
                    margin: 0 0 12px 0;
                    font-size: clamp(20px, 4vw, 42px);
                    font-weight: 900;
                    line-height: 1.1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .title-normal {
                    color: rgba(255, 255, 255, 0.95);
                    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }

                .title-highlight {
                    font-size: clamp(24px, 5vw, 48px);
                    font-weight: 900;
                    text-shadow: 
                        0 0 30px currentColor,
                        0 4px 8px rgba(0, 0, 0, 0.4);
                    animation: textGlow 3s ease-in-out infinite alternate;
                }

                .subtitle {
                    margin: 0 0 10px 0;
                    font-size: clamp(10px, 1.5vw, 16px);
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.8);
                    text-transform: uppercase;
                    letter-spacing: clamp(0.5px, 0.2vw, 2px);
                }

                .description {
                    margin: 0 0 10px 0;
                    font-size: clamp(10px, 1.5vw, 16px);
                    line-height: 1.6;
                    color: rgba(255, 255, 255, 0.85);
                    font-weight: 400;
                }

                .cta-button {
                    display: inline-flex;
                    align-items: center;
                    gap: clamp(6px, 1vw, 12px);
                    padding: clamp(8px, 1.5vw, 16px) clamp(16px, 3vw, 32px);
                    border: none;
                    border-radius: 50px;
                    font-size: clamp(10px, 1.2vw, 14px);
                    font-weight: 700;
                    color: white;
                    text-transform: uppercase;
                    letter-spacing: clamp(0.2px, 0.05vw, 0.5px);
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                    position: relative;
                    overflow: hidden;
                    margin-bottom: clamp(12px, 2vw, 24px);
                }

                .cta-button::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s;
                }

                .cta-button:hover::before {
                    left: 100%;
                }

                .cta-button:hover {
                    transform: translateY(-3px) scale(1.05);
                    filter: brightness(1.1);
                }

                .cta-button:active {
                    transform: translateY(-1px) scale(1.02);
                }



                .content-right {
                    flex: 0 0 60%;
                    max-width: 60%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                    z-index: 1;
                }

                .banner-image {
                    width: 100%;
                    height: clamp(200px, 25vw, 320px);
                    position: relative;
                    overflow: hidden;
                    border-radius: 0 clamp(12px, 2vw, 24px) clamp(12px, 2vw, 24px) 0;
                }

                .background-decoration {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1;
                    mask: linear-gradient(90deg, transparent 0%, rgb(0 0 0 / 27%) 20%, rgb(0 0 0 / 72%) 100%);
                    -webkit-mask: linear-gradient(90deg, transparent 0%, rgb(0 0 0 / 27%) 20%, rgb(0 0 0 / 72%) 100%);
                }

                .bg-pattern {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: center;
                    animation: subtleFloat 8s ease-in-out infinite;
                }

                .color-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    mix-blend-mode: multiply;
                    z-index: 2;
                    transition: opacity 0.6s ease;
                }

                .main-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 3;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .main-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    object-position: center;
                    transition: transform 0.8s cubic-bezier(0.23, 1, 0.32, 1);
                    opacity: 0.9;
                }

                .banner-image:hover .main-image img {
                    transform: scale(1.02);
                    opacity: 1;
                }

                .banner-image:hover .background-decoration {
                    mask: linear-gradient(90deg, transparent 0%, rgb(0 0 0 / 27%) 20%, rgb(0 0 0 / 72%) 100%);
                    -webkit-mask: linear-gradient(90deg, transparent 0%, rgb(0 0 0 / 27%) 20%, rgb(0 0 0 / 72%) 100%);
                }

                .banner-image:hover .bg-pattern {
                    transform: scale(1.1);
                }

                .banner-image:hover .color-overlay {
                    opacity: 0.5;
                }

                @keyframes subtleFloat {
                    0%, 100% {
                        transform: translateY(0px) scale(1);
                    }
                    50% {
                        transform: translateY(-5px) scale(1.02);
                    }
                }

                .progress-container {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.1);
                }

                .progress-bar {
                    height: 100%;
                    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                    position: relative;
                }

                .progress-bar::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 20px;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5));
                    animation: shimmer 2s ease-in-out infinite;
                }



                .slide-indicators {
                    position: absolute;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 16px;
                    z-index: 4;
                }

                .indicator {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .indicator:hover:not(:disabled) {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    transform: translateY(-2px);
                }

                .indicator.active {
                    color: white;
                    font-weight: 700;
                    transform: translateY(-2px);
                }

                .indicator:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .indicator-text {
                    position: relative;
                    z-index: 1;
                }

                /* Animations */
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes textGlow {
                    0%, 100% {
                        text-shadow: 
                            0 0 20px currentColor,
                            0 4px 8px rgba(0, 0, 0, 0.4);
                    }
                    50% {
                        text-shadow: 
                            0 0 40px currentColor,
                            0 0 60px currentColor,
                            0 4px 8px rgba(0, 0, 0, 0.4);
                    }
                }



                @keyframes shimmer {
                    0% { transform: translateX(-20px); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(20px); opacity: 0; }
                }

                /* Responsive Design */
                
                /* Compressed desktop view (sidebars open) */
                @media only screen and (max-width: 1400px) {
                    .slide-content {
                        padding: clamp(15px, 2.5vw, 35px);
                        gap: clamp(15px, 2.5vw, 30px);
                    }

                    .main-title {
                        font-size: clamp(16px, 3vw, 32px);
                        margin-bottom: 8px;
                    }

                    .title-highlight {
                        font-size: clamp(20px, 4vw, 38px);
                    }

                    .subtitle {
                        font-size: clamp(8px, 1.2vw, 13px);
                        margin-bottom: 6px;
                    }

                    .description {
                        font-size: clamp(8px, 1.2vw, 13px);
                        margin-bottom: 16px;
                        line-height: 1.5;
                    }

                    .cta-button {
                        padding: clamp(6px, 1vw, 12px) clamp(12px, 2vw, 20px);
                        font-size: clamp(8px, 1vw, 12px);
                    }
                }

                @media only screen and (max-width: 1200px) {
                    .slide-content {
                        padding: clamp(12px, 2vw, 25px);
                        gap: clamp(12px, 2vw, 25px);
                    }

                    .main-title {
                        font-size: clamp(12px, 2.5vw, 28px);
                        margin-bottom: 6px;
                    }

                    .title-highlight {
                        font-size: clamp(16px, 3.5vw, 34px);
                    }

                    .subtitle {
                        font-size: clamp(6px, 1vw, 12px);
                        margin-bottom: 5px;
                    }

                    .description {
                        font-size: clamp(6px, 1vw, 12px);
                        margin-bottom: 14px;
                        line-height: 1.4;
                    }

                    .cta-button {
                        padding: clamp(4px, 0.8vw, 10px) clamp(8px, 1.6vw, 18px);
                        font-size: clamp(6px, 0.8vw, 11px);
                    }
                }

                @media only screen and (max-width: 1000px) {
                    .slide-content {
                        padding: clamp(10px, 1.8vw, 20px);
                        gap: clamp(10px, 1.8vw, 20px);
                    }

                    .main-title {
                        font-size: clamp(10px, 2vw, 24px);
                        margin-bottom: 5px;
                    }

                    .title-highlight {
                        font-size: clamp(14px, 3vw, 30px);
                    }

                    .subtitle {
                        font-size: clamp(5px, 0.8vw, 10px);
                        margin-bottom: 4px;
                    }

                    .description {
                        font-size: clamp(5px, 0.8vw, 10px);
                        margin-bottom: 12px;
                        line-height: 1.3;
                    }

                    .cta-button {
                        padding: clamp(3px, 0.6vw, 8px) clamp(6px, 1.2vw, 14px);
                        font-size: clamp(5px, 0.7vw, 9px);
                    }

                    .current-slide {
                        height: clamp(160px, 18vw, 260px);
                    }

                    .banner-image {
                        height: clamp(160px, 18vw, 260px);
                    }
                }

                @media only screen and (max-width: 900px) {
                    .content-left {
                        flex: 0 0 35%;
                        max-width: 35%;
                    }

                    .content-right {
                        flex: 0 0 65%;
                        max-width: 65%;
                    }

                    .slide-content {
                        padding: 25px 15px;
                        gap: 15px;
                    }

                    .main-title {
                        font-size: 24px;
                        margin-bottom: 4px;
                    }

                    .title-highlight {
                        font-size: 30px;
                    }

                    .subtitle {
                        font-size: 11px;
                        margin-bottom: 3px;
                        letter-spacing: 1px;
                    }

                    .description {
                        font-size: 11px;
                        margin-bottom: 10px;
                        line-height: 1.2;
                    }

                    .cta-button {
                        padding: 8px 16px;
                        font-size: 10px;
                    }
                }

                @media only screen and (max-width: 1024px) {
                    .slide-content {
                        padding: 40px;
                        gap: 40px;
                    }

                    .main-title {
                        font-size: 32px;
                        margin-bottom: 8px;
                    }

                    .title-highlight {
                        font-size: 38px;
                    }

                    .subtitle {
                        font-size: 14px;
                        margin-bottom: 6px;
                    }

                    .description {
                        font-size: 14px;
                        margin-bottom: 18px;
                    }

                    .cta-button {
                        padding: 14px 28px;
                        font-size: 13px;
                    }

                    .banner-image {
                        height: 280px;
                    }
                }

                /* Tablet breakpoint - handle horizontal squeeze before going vertical */
                @media only screen and (max-width: 1024px) {
                    .content-left {
                        flex: 0 0 45%;
                        max-width: 45%;
                    }

                    .content-right {
                        flex: 0 0 55%;
                        max-width: 55%;
                    }

                    .slide-content {
                        padding: clamp(15px, 3vw, 35px);
                        gap: clamp(15px, 3vw, 35px);
                    }

                    .main-title {
                        font-size: clamp(18px, 4vw, 28px);
                        margin-bottom: 6px;
                    }

                    .title-highlight {
                        font-size: clamp(22px, 5vw, 34px);
                    }

                    .subtitle {
                        font-size: clamp(10px, 1.5vw, 14px);
                        margin-bottom: 5px;
                    }

                    .description {
                        font-size: clamp(10px, 1.5vw, 14px);
                        margin-bottom: 14px;
                    }

                    .cta-button {
                        padding: clamp(8px, 1.5vw, 14px) clamp(16px, 3vw, 24px);
                        font-size: clamp(9px, 1.3vw, 13px);
                    }
                }

                /* Mobile - full background layout */
                @media only screen and (max-width: 768px) {
                    .current-slide {
                        height: 400px;
                        position: relative;
                    }

                    /* Make background image cover entire slide */
                    .current-slide::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background-size: cover;
                        background-position: center;
                        background-repeat: no-repeat;
                        z-index: 1;
                        opacity: 0.6;
                    }

                    /* Dynamic backgrounds for each slide */
                    .current-slide::before {
                        background-image: 
                            linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
                            url('/assets/banners/deposit-bonus.webp');
                    }

                    .current-slide[data-slide="1"]::before {
                        background-image: 
                            linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
                            url('/assets/banners/rain-event.webp');
                    }

                    .current-slide[data-slide="2"]::before {
                        background-image: 
                            linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
                            url('/assets/banners/vip-rewards.webp');
                    }

                    .slide-content {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        text-align: center;
                        padding: 40px 20px;
                        z-index: 4;
                    }

                    .content-left {
                        flex: none;
                        max-width: 100%;
                        width: 100%;
                        z-index: 5;
                    }

                    .content-right {
                        display: none; /* Hide separate image container */
                    }

                    .main-title {
                        font-size: 28px;
                        margin-bottom: 12px;
                        text-shadow: 0 2px 12px rgba(0, 0, 0, 0.8);
                    }

                    .title-highlight {
                        font-size: 32px;
                        text-shadow: 
                            0 0 20px currentColor,
                            0 2px 12px rgba(0, 0, 0, 0.8);
                    }

                    .subtitle {
                        font-size: 14px;
                        margin-bottom: 8px;
                        letter-spacing: 1.5px;
                        text-shadow: 0 1px 8px rgba(0, 0, 0, 0.8);
                    }

                    .description {
                        font-size: 14px;
                        margin-bottom: 20px;
                        line-height: 1.5;
                        text-shadow: 0 1px 8px rgba(0, 0, 0, 0.8);
                        max-width: 320px;
                    }

                    .cta-button {
                        padding: 14px 28px;
                        font-size: 13px;
                        margin-bottom: 0;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                    }

                    /* Enhanced mobile overlay */
                    .slide-overlay {
                        background: 
                            radial-gradient(ellipse at center, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%),
                            linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.8) 100%);
                        z-index: 3;
                    }

                    .slide-indicators {
                        bottom: 20px;
                        gap: 12px;
                        z-index: 6;
                    }

                    .indicator {
                        padding: 6px 12px;
                        font-size: 11px;
                        background: rgba(0, 0, 0, 0.4);
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                    }
                }

                @media only screen and (max-width: 640px) {
                    .current-slide {
                        height: 350px;
                    }

                    .slide-content {
                        padding: 30px 15px;
                    }

                    .content-right {
                        display: none;
                    }

                    .main-title {
                        font-size: 24px;
                        margin-bottom: 8px;
                        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
                    }

                    .title-highlight {
                        font-size: 28px;
                        text-shadow: 
                            0 0 15px currentColor,
                            0 2px 10px rgba(0, 0, 0, 0.8);
                    }

                    .subtitle {
                        font-size: 12px;
                        margin-bottom: 6px;
                        letter-spacing: 1.2px;
                        text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
                    }

                    .description {
                        font-size: 12px;
                        margin-bottom: 16px;
                        line-height: 1.4;
                        text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
                        max-width: 280px;
                    }

                    .cta-button {
                        padding: 12px 24px;
                        font-size: 11px;
                        margin-bottom: 0;
                    }
                }

                @media only screen and (max-width: 480px) {
                    .current-slide {
                        height: 320px;
                    }

                    .slide-content {
                        padding: 25px 12px;
                    }

                    .content-right {
                        display: none;
                    }

                    .main-title {
                        font-size: 20px;
                        margin-bottom: 6px;
                        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
                    }

                    .title-highlight {
                        font-size: 24px;
                        text-shadow: 
                            0 0 12px currentColor,
                            0 2px 8px rgba(0, 0, 0, 0.8);
                    }

                    .subtitle {
                        font-size: 10px;
                        margin-bottom: 5px;
                        letter-spacing: 1px;
                        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
                    }

                    .description {
                        font-size: 10px;
                        margin-bottom: 14px;
                        line-height: 1.3;
                        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.8);
                        max-width: 240px;
                    }

                    .cta-button {
                        padding: 10px 20px;
                        font-size: 10px;
                        margin-bottom: 0;
                        gap: 6px;
                    }

                    .cta-button svg {
                        width: 10px;
                        height: 10px;
                    }

                    .slide-indicators {
                        bottom: 12px;
                        gap: 6px;
                    }

                    .indicator {
                        padding: 3px 6px;
                        font-size: 8px;
                    }
                }

                @media only screen and (max-width: 360px) {
                    .current-slide {
                        height: 240px;
                    }

                    .slide-content {
                        padding: 15px 10px;
                        gap: 12px;
                    }

                    .main-title {
                        font-size: 16px;
                        margin-bottom: 2px;
                    }

                    .title-highlight {
                        font-size: 20px;
                    }

                    .subtitle {
                        font-size: 10px;
                        margin-bottom: 2px;
                    }

                    .description {
                        font-size: 10px;
                        margin-bottom: 10px;
                    }

                    .cta-button {
                        padding: 6px 14px;
                        font-size: 9px;
                        margin-bottom: 8px;
                    }

                    .banner-image {
                        height: 90px;
                    }
                }
            `}</style>
        </>
    );
};

export default BannerCarousel;