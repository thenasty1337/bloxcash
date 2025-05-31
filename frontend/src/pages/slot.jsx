import {A, useParams, useLocation} from "@solidjs/router";
import {createEffect, createResource, createSignal, For, Show} from "solid-js";
import {api, authedAPI} from "../util/api";
import {useUser} from "../contexts/usercontextprovider";
import Loader from "../components/Loader/loader";
import FancySlotBanner from "../components/Slots/fancyslotbanner";
import GameInfo from "../components/Home/gameinfo";
import Bets from "../components/Home/bets";
import {Title} from "@solidjs/meta";

function Slot(props) {

  let slotRef
  let slotsRef
  let containerRef

  let params = useParams()
  const location = useLocation()
  const [user] = useUser()
  const [featured, setFeatured] = createSignal([])
  const [url, setURL] = createSignal()
  const [sessionId, setSessionId] = createSignal()
  const [loading, setLoading] = createSignal(false)
  const [isDemoMode, setIsDemoMode] = createSignal(false)
  const [fallbackMessage, setFallbackMessage] = createSignal("")
  const [errorToast, setErrorToast] = createSignal(null)
  const [isFullWidth, setIsFullWidth] = createSignal(false)
  const [isLiked, setIsLiked] = createSignal(false)
  const [showGameSelection, setShowGameSelection] = createSignal(true)
  const [isGamePreloaded, setIsGamePreloaded] = createSignal(false)
  
  // Hide toast after 5 seconds
  createEffect(() => {
    if (errorToast()) {
      const timer = setTimeout(() => {
        setErrorToast(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  });
  
  // Function to show toast message
  function showError(message, type = "error") {
    setErrorToast({ message, type });
    console.error(message);
  }
  
  // Function to toggle full width mode
  function toggleFullWidth() {
    setIsFullWidth(!isFullWidth());
    
    // Allow time for the DOM to update before scrolling to ensure visibility
    setTimeout(() => {
      // Properly scroll accounting for header height
      if (containerRef) {
        // Get the container's position
        const rect = containerRef.getBoundingClientRect();
        // Calculate position with an offset for the header (estimated at 80px)
        const headerOffset = 80;
        const offsetPosition = window.pageYOffset + rect.top - headerOffset;
        
        // Scroll to the position
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 300);
  }
  
  // Function to toggle like status (dummy for now)
  function toggleLike() {
    setIsLiked(!isLiked());
    // Later this would connect to the backend to save the status
  }
  
  const [slot, {mutate}] = createResource(() => {
    // Extract the slug from the full pathname
    // Remove '/slots/' from the beginning to get the full slug
    const fullPath = location.pathname;
    const fullSlug = fullPath.replace(/^\/slots\//, '');
    
    return fullSlug;
  }, fetchSlot)

  async function fetchSlot(slug) {
    try {
      setURL(null)
      setSessionId(null)
      
      let res = await api(`/slots/${slug}`, 'GET', null, false)
      if (!res.name) {
        showError("Could not load game information");
        return null;
      }
      
      // Debug log to check if we're getting the image URL
      console.log("Game image URL:", res.img);


      // Ensure each featured game has the necessary properties
      const mappedFeatured = (res.featured || []).map(game => ({
        id: game.id,
        name: game.name,
        slug: game.slug,
        img: game.img,
        provider: game.provider,
        providerName: game.providerName || game.provider,
        rtp: game.rtp,
        isNew: false, // Set default values for properties that might be missing
        hasJackpot: false
      }));
      
      setFeatured(mappedFeatured)

      return {
        id: res.id,
        name: res.name,
        slug: res.slug,
        img: res.img,
        imgPortrait: res.imgPortrait,
        provider: res.provider,
        providerName: res.providerName || res.provider,
        rtp: res.rtp,
        isNew: res.isNew,
        hasJackpot: res.hasJackpot,
        category: res.category
      }
    } catch (e) {
      console.error(e)
      showError(`Failed to load game: ${e.message || "Unknown error"}`);
      return null
    }
  }

  // We've removed the auto-launch effect to allow user to choose play mode
  // The game will only launch when user clicks on one of the play options
  
  // New effect to preload real game in background
  createEffect(async () => {
    if (slot() && user() && !isGamePreloaded() && !loading()) {
      try {
        setIsGamePreloaded(true);
        setLoading(true);
        
        // Silently preload the real game in background
        const fullSlug = location.pathname.replace(/^\/slots\//, '');
        const gameSession = await authedAPI(`/slots/play/${fullSlug}`, 'POST', null, false);
        
        if (gameSession && gameSession.url) {
          setURL(gameSession.url);
          setSessionId(gameSession.sessionId);
          
          // Check if we got a demo version as fallback
          if (gameSession.isDemo) {
            setIsDemoMode(true);
            if (gameSession.fallbackReason) {
              setFallbackMessage(gameSession.fallbackReason);
            }
          } else {
            setIsDemoMode(false);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to preload game:", err);
        setLoading(false);
        // We don't show error toasts for preloading failures
        // Just set the game as not preloaded so we can try again on user action
        setIsGamePreloaded(false);
      }
    }
  });
  
  async function launchGame(isDemo = false) {
    if (loading()) return;
    
    // If demo was requested OR if real game failed to preload
    if (isDemo || !isGamePreloaded()) {
      try {
        setLoading(true);
        
        // Extract the slug from the full pathname
        const fullPath = location.pathname;
        const fullSlug = fullPath.replace(/^\/slots\//, '');
        
        // Add demo parameter if demo mode was requested
        const demoParam = isDemo ? '?demo=true' : '';
        
        // Make API request for game session
        const gameSession = await authedAPI(`/slots/play/${fullSlug}${demoParam}`, 'POST', null, false);
        
        if (!gameSession || !gameSession.url) {
          console.error('Failed to get game URL');
          setLoading(false);
          showError("Failed to get game URL");
          return;
        }
        
        setURL(gameSession.url);
        setSessionId(gameSession.sessionId);
        
        // Check if we got a demo version
        if (gameSession.isDemo) {
          setIsDemoMode(true);
          
          // Check if this was a fallback
          if (gameSession.fallbackReason && !isDemo) {
            setFallbackMessage(gameSession.fallbackReason);
          } else {
            setFallbackMessage(isDemo ? "You are playing in demo mode. No real money will be used." : "");
          }
        } else {
          setIsDemoMode(false);
          setFallbackMessage("");
        }
        
        // Hide the selection UI after loading is complete
        setShowGameSelection(false);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
        
        // Handle specific error types
        if (e?.message?.includes("UNAUTHENTICATED") || e?.error === "UNAUTHENTICATED") {
          showError("Please log in again to play this game");
        } else if (e?.message?.includes("INSUFFICIENT_FUNDS") || e?.error === "INSUFFICIENT_FUNDS") {
          showError("Insufficient funds to play this game");
        } else if (e?.message?.includes("GAME_UNAVAILABLE") || e?.error === "GAME_UNAVAILABLE") {
          showError("This game is currently unavailable");
        } else {
          showError(`Failed to launch game: ${e.message || "Unknown error"}`);
        }
      }
    } else {
      // For real play when game is already preloaded, just close the selection UI
      setShowGameSelection(false);
    }
  }

  function scrollGames(direction) {
    if (!slotsRef) return;
    
    // Scroll by 80% of container width
    const scrollAmount = slotsRef.clientWidth * 0.8 * direction;
    
    slotsRef.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }

  return (
    <>
      <Title>BloxClash | {slot()?.name || 'Slots'}</Title>

      <div class={`slot-base-container ${isFullWidth() ? 'full-width' : ''}`} ref={containerRef}>
        {user() ? (
          url() ? (
            <>
              {fallbackMessage() && (
                <div class="demo-warning">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {fallbackMessage()}
                </div>
              )}
              <div class="game-container">
                <iframe src={url()} className='game' allow="fullscreen; autoplay" ref={slotRef}/>
                
                {/* Game selection overlay - only shown while showGameSelection is true */}
                <Show when={showGameSelection()}>
                  <div class="game-selection-overlay">
                    <div class="game-background-container">
                      <Show when={slot() && slot().imgPortrait} fallback={
                        <div class="fallback-background"></div>
                      }>
                        <img 
                          src={slot().imgPortrait} 
                          alt={slot().name}
                          class="game-background-image" 
                          onError={(e) => {
                            console.error("Image failed to load:", e);
                            e.target.style.display = "none";
                            e.target.parentNode.classList.add("fallback-background");
                          }}
                        />
                      </Show>
                      <div class="game-overlay"></div>
                    </div>
                    
                    <Show when={!loading()} fallback={<Loader />}>
                      <div class="game-selection-compact">
                        <h2>Ready to Play?</h2>
                        <div class="play-options">
                          <button class="play-btn-fancy" onClick={() => launchGame(false)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="6" x2="12" y2="18" />
                              <path d="M16 8H10a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8" />
                            </svg>
                            REAL PLAY
                          </button>
                          <span class="or-divider">OR</span>
                          <button class="demo-btn-fancy" onClick={() => launchGame(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polygon points="10 8 16 12 10 16 10 8"></polygon>
                            </svg>
                            TRY DEMO
                          </button>
                        </div>
                      </div>
                    </Show>
                  </div>
                </Show>
              </div>
            </>
          ) : (
            <div class='game game-with-background'>
              {/* Direct image approach */}
              <div class="game-background-container">
                <Show when={slot() && slot().imgPortrait} fallback={
                  <div class="fallback-background"></div>
                }>
                  <img 
                    src={slot().imgPortrait} 
                    alt={slot().name}
                    class="game-background-image" 
                    onError={(e) => {
                      console.error("Image failed to load:", e);
                      e.target.style.display = "none";
                      e.target.parentNode.classList.add("fallback-background");
                    }}
                  />
                </Show>
                <div class="game-overlay"></div>
              </div>
              <Show when={!loading()} fallback={<Loader />}>
                <div class="game-selection-compact">
                  <h2>Ready to Play?</h2>
                  <div class="play-options">
                    <button class="play-btn-fancy" onClick={() => launchGame(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="6" x2="12" y2="18" />
                        <path d="M16 8H10a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8" />
                      </svg>
                      REAL PLAY
                    </button>
                    <span class="or-divider">OR</span>
                    <button class="demo-btn-fancy" onClick={() => launchGame(true)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polygon points="10 8 16 12 10 16 10 8"></polygon>
                      </svg>
                      TRY DEMO
                    </button>
                  </div>
                </div>
              </Show>
            </div>
          )
        ) : (
          <div class='game'>
            <p>Please login to play.</p>
          </div>
        )}

        <div class='slot-info'>
          <div class='info-left'>
            <GameInfo type='RTP' rtp={slot()?.rtp || 95} margin='unset'/>

            <div className='title-container'>
              <Show when={!slot.loading} fallback={<h1>Loading...</h1>}>
                <h1>{slot()?.name}</h1>
                <p>{slot()?.providerName || slot()?.provider}</p>
              </Show>
            </div>
            
            <div class='tags-container'>
              <Show when={!slot.loading}>
                {slot()?.isNew && <span className="new-tag">NEW</span>}
                {slot()?.hasJackpot && <span className="jackpot-tag">JACKPOT</span>}
              </Show>
            </div>
          </div>

          <div class='slot-logo'>
            <span>NOVA CASINO</span>
          </div>

          <div class='controls'>
            <button className={`favorite-btn ${isLiked() ? 'liked' : ''}`} onClick={toggleLike}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isLiked() ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <button className={`fullwidth-btn ${isFullWidth() ? 'active' : ''}`} onClick={toggleFullWidth}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </button>
            {url() && (
              <button className='fullscreen-btn' onClick={() => slotRef.requestFullscreen()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Error Toast */}
        <Show when={errorToast()}>
          <div class={`toast ${errorToast().type === 'success' ? 'success-toast' : errorToast().type === 'info' ? 'info-toast' : 'error-toast'}`}>
            <div class="toast-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                {errorToast().type === 'success' ? (
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                ) : errorToast().type === 'info' ? (
                  <circle cx="12" cy="12" r="10"></circle>
                ) : (
                  <circle cx="12" cy="12" r="10"></circle>
                )}
                {errorToast().type === 'success' ? (
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                ) : errorToast().type === 'info' ? (
                  <>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </>
                ) : (
                  <>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </>
                )}
              </svg>
              <span>{errorToast().message}</span>
            </div>
            <button onClick={() => setErrorToast(null)}>×</button>
          </div>
        </Show>

        <div className='featured-section'>
          <div className='featured-header'>
            <div className='featured-title'>
              <img src='/assets/icons/fire.svg' height='19' width='19' alt=''/>
              <A href={`/slots?provider=${slot()?.provider}`} className='white bold'>MORE FROM THIS PROVIDER</A>
              <div className='line'/>
            </div>
            
            <div className='scroll-controls'>
              <button className='bevel-purple arrow' onClick={() => scrollGames(-1)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M12 6L2 6M2 6L7.6 0.999999M2 6L7.6 11" stroke="white" stroke-width="2"/>
                </svg>
              </button>

              <button className='bevel-purple arrow' onClick={() => scrollGames(1)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1.58933e-07 6L10 6M10 6L4.4 11M10 6L4.4 0.999999" stroke="white" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>

         
            <div className='slots' ref={slotsRef}>
              <Show when={!slot.loading} fallback={<Loader small={true}/>}>
                <For each={featured()}>{(slot, index) =>
                  <FancySlotBanner {...slot}/>
                }</For>
              </Show>
        
          </div>
        </div>

        <Bets user={user()}/>
      </div>

      <style jsx>{`
        .slot-base-container {
          width: 100%;
          max-width: 1150px;
          height: fit-content;
          box-sizing: border-box;
          padding: 30px 0;
          margin: 0 auto;
          transition: max-width 0.3s ease, padding 0.3s ease;
        }
        
        .slot-base-container.full-width {
          max-width: 100%;
          padding: 30px 16px;
        }

        .game {
          width: 100%;
          aspect-ratio: 1150/637;
          outline: unset;
          border: unset;
          border-radius: 15px;
          border: 1px solid #3F3B77;
          background-color: #29254E; /* Changed from background to background-color */
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          font-weight: 700;
          color: white;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .full-width .game {
          aspect-ratio: 21/9;
          border-radius: 8px;
        }
        
        .play-btn, .demo-btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-family: Geogrotesque Wide, sans-serif;
          font-weight: 700;
          cursor: pointer;
          min-width: 150px;
          text-align: center;
          transition: all 0.2s ease;
        }
        
        .play-btn {
          background: linear-gradient(180deg, #59E878 0%, #26A240 100%);
          color: #0D2611;
          border: none;
          box-shadow: 0 4px 10px rgba(38, 162, 64, 0.3);
        }
        
        .play-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(38, 162, 64, 0.4);
        }
        
        .play-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(38, 162, 64, 0.2);
        }
        
        .demo-btn {
          background: #342E5F;
          border: 1px solid #494182;
          color: #9189D3;
        }
        
        .demo-btn:hover {
          background: #3D3770;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(73, 65, 130, 0.3);
        }
        
        .demo-btn:active {
          transform: translateY(0);
          box-shadow: none;
        }
        
        .wide {
          width: 100%;
          padding: 14px 24px;
          font-size: 16px;
        }

        .game-selection-compact {
          background: rgba(41, 37, 78, 0.6);
          backdrop-filter: blur(12px);
          padding: 28px;
          border-radius: 16px;
          max-width: 500px;
          width: 90%;
          box-shadow: 
            0 10px 25px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(134, 111, 234, 0.2) inset,
            0 0 30px rgba(93, 86, 177, 0.2) inset;
          position: relative;
          z-index: 3;
          text-align: center;
          border: none;
        }
        
        .game-selection-compact h2 {
          font-family: Geogrotesque Wide, sans-serif;
          font-weight: 800;
          font-size: 26px;
          margin: 0 0 20px 0;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          letter-spacing: 0.5px;
        }
        
        .play-options {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }
        
        .play-btn-fancy, .demo-btn-fancy {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 24px;
          border-radius: 8px;
          font-family: Geogrotesque Wide, sans-serif;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.25s ease;
          min-width: 160px;
        }
        
        .play-btn-fancy {
          background: linear-gradient(180deg, #59E878 0%, #26A240 100%);
          color: #0D2611;
          border: none;
          box-shadow: 
            0 8px 20px rgba(38, 162, 64, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset,
            0 -3px 0 rgba(0, 0, 0, 0.2) inset;
          text-shadow: 0 1px 1px rgba(255, 255, 255, 0.2);
          letter-spacing: 0.5px;
        }
        
        .play-btn-fancy:hover {
          transform: translateY(-3px);
          box-shadow: 
            0 12px 25px rgba(38, 162, 64, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.15) inset,
            0 -3px 0 rgba(0, 0, 0, 0.2) inset;
          background: linear-gradient(180deg, #6BEF88 0%, #2FB84A 100%);
        }
        
        .play-btn-fancy:active {
          transform: translateY(0);
          box-shadow: 
            0 4px 10px rgba(38, 162, 64, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset,
            0 2px 0 rgba(0, 0, 0, 0.1) inset;
        }
        
        .demo-btn-fancy {
          background: rgba(53, 47, 99, 0.8);
          border: none;
          color: #B6B0F1;
          box-shadow: 
            0 8px 15px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(134, 111, 234, 0.4) inset,
            0 -3px 0 rgba(0, 0, 0, 0.2) inset;
          letter-spacing: 0.5px;
        }
        
        .demo-btn-fancy:hover {
          background: rgba(63, 56, 115, 0.9);
          transform: translateY(-3px);
          box-shadow: 
            0 12px 20px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(134, 111, 234, 0.6) inset,
            0 -3px 0 rgba(0, 0, 0, 0.2) inset;
          color: #CAC5FF;
        }
        
        .demo-btn-fancy:active {
          transform: translateY(0);
          box-shadow: 
            0 4px 10px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(134, 111, 234, 0.4) inset,
            0 2px 0 rgba(0, 0, 0, 0.1) inset;
        }
        
        .or-divider {
          font-size: 14px;
          font-weight: 700;
          color: #6E67B8;
          display: inline-block;
          padding: 0 5px;
        }
        
        .game-with-background {
          position: relative;
        }
        
        .game-background-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-radius: 15px;
          z-index: 1;
        }
        
        .game-background-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          filter: blur(8px);
          transform: scale(1.05); /* Prevent blur from showing edges */
        }
        
        .fallback-background {
          width: 100%;
          height: 100%;
          background-color: #252144;
          background-image: linear-gradient(135deg, #2B2858 25%, #322F6B 25%, #322F6B 50%, #2B2858 50%, #2B2858 75%, #322F6B 75%, #322F6B 100%);
          background-size: 20px 20px;
        }
        
        .game-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            135deg,
            rgba(20, 17, 45, 0.85) 0%,
            rgba(29, 25, 64, 0.8) 50%,
            rgba(32, 28, 71, 0.9) 100%
          );
          z-index: 2;
          box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.3);
        }
        
        .option-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        
        .real-play-icon {
          background: linear-gradient(135deg, #59E878 0%, #26A240 100%);
          color: #0D2611;
        }
        
        .demo-play-icon {
          background: #342E5F;
          border: 1px solid #494182;
          color: #9189D3;
        }
        
        .option-details {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .option-details h3 {
          font-family: Geogrotesque Wide, sans-serif;
          font-weight: 700;
          font-size: 18px;
          margin: 0 0 4px 0;
          color: white;
        }
        
        .option-details p {
          color: #9189D3;
          font-size: 14px;
          margin: 0;
        }
        
        .toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 10px 16px;
          border-radius: 8px;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 350px;
          animation: slide-in 0.3s ease;
        }
        
        .error-toast {
          background: #381C1C;
          border: 1px solid #F95555;
          color: #F95555;
        }
        
        .success-toast {
          background: #193516;
          border: 1px solid #59E878;
          color: #59E878;
        }
        
        .info-toast {
          background: #1E2A3A;
          border: 1px solid #5DADE2;
          color: #5DADE2;
        }
        
        .toast-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .toast svg {
          min-width: 20px;
          stroke: currentColor;
        }
        
        .toast button {
          background: none;
          border: none;
          color: currentColor;
          font-size: 18px;
          cursor: pointer;
          padding: 0 0 0 10px;
          margin-left: 10px;
        }
        
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .slot-info {
          height: 70px;
          width: 100%;
          padding: 0 16px;
          border-radius: 8px;
          border: 1px solid rgba(134, 111, 234, 0.15);
          background: linear-gradient(0deg, rgba(64, 57, 118, 0.65) 0%, rgba(64, 57, 118, 0.65) 100%), radial-gradient(60% 60% at 50% 50%, rgba(147, 126, 236, 0.15) 0%, rgba(102, 83, 184, 0.15) 100%);
          margin: 20px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: border-radius 0.3s ease;
        }
        
        .full-width .slot-info {
          border-radius: 4px;
        }
        
        .info-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .title-container {
          color: #9189D3;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 14px;
          font-weight: 600;
          text-transform: capitalize;
          max-width: 280px;
          display: flex;
          flex-direction: column;
        }

        .title-container h1 {
          color: white;
          font-size: 18px;
          font-weight: 800;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .title-container p {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .tags-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .category {
          font-size: 12px;
          color: #9189D3;
          padding: 2px 8px;
          border-radius: 4px;
          background: rgba(145, 137, 211, 0.2);
          white-space: nowrap;
        }
        
        .new-tag, .jackpot-tag {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }
        
        .new-tag {
          background-color: #59E878;
          color: #0D2611;
        }
        
        .jackpot-tag {
          background: linear-gradient(180deg, #FFC700 0%, #FF7A00 100%);
          color: #3A2800;
        }
        
        .slot-logo {
          font-family: Geogrotesque Wide, sans-serif;
          font-weight: 800;
          font-size: 18px;
          letter-spacing: 1px;
          color: white;
          text-transform: uppercase;
          background: linear-gradient(90deg, #9189D3 0%, #594ECE 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          user-select: none;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .controls {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .favorite-btn, .fullscreen-btn, .fullwidth-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(84, 76, 146, 0.3);
          border: 1px solid rgba(134, 111, 234, 0.3);
          border-radius: 8px;
          color: #9189D3;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .favorite-btn:hover, .fullscreen-btn:hover, .fullwidth-btn:hover {
          background: rgba(84, 76, 146, 0.5);
          transform: translateY(-2px);
          color: white;
        }
        
        .favorite-btn:active, .fullscreen-btn:active, .fullwidth-btn:active {
          transform: translateY(0px);
        }
        
        .fullwidth-btn.active {
          background: rgba(111, 101, 189, 0.5);
          color: white;
          border-color: rgba(154, 137, 235, 0.5);
        }
        
        .favorite-btn.liked {
          background: rgba(39, 145, 64, 0.2);
          color: #59E878;
          border-color: rgba(89, 232, 120, 0.3);
        }
        
        .favorite-btn.liked:hover {
          background: rgba(39, 145, 64, 0.3);
          color: #59E878;
        }

        .featured-section {
          margin: 30px 0 50px 0;
        }

        .featured-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .featured-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .white.bold {
          color: white;
          font-family: Geogrotesque Wide, sans-serif;
          font-weight: 700;
          font-size: 18px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          letter-spacing: 0.5px;
        }

        .line {
          flex: 1;
          height: 1px;
          min-width: 100px;
          max-width: 300px;
          border-radius: 2525px;
          background: linear-gradient(90deg, #5A5499 0%, rgba(90, 84, 153, 0.00) 100%);
          margin-left: 12px;
        }

        .scroll-controls {
          display: flex;
          gap: 8px;
        }

        .slots-container {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          background: rgba(29, 24, 62, 0.35);
          padding: 16px;
          margin-bottom: 30px;
          border: 1px solid rgba(134, 111, 234, 0.2);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .slots {
          display: flex;
          gap: 18px;
          overflow-x: auto;
          padding: 8px 4px;
          scroll-behavior: smooth;
          -ms-overflow-style: none;
          scrollbar-width: none;
          min-height: 220px;
        }

        .slots::-webkit-scrollbar {
          display: none;
        }

        .slot {
          min-width: 150px;
          width: 150px;
          height: 220px;
          border-radius: 8px;
          background-size: cover;
          background-repeat: no-repeat;
          position: relative;
        }

        .arrow {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: rgba(84, 76, 146, 0.5);
          border: 1px solid rgba(134, 111, 234, 0.4);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }
        
        .arrow:hover {
          background: rgba(114, 106, 176, 0.7);
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }
        
        .arrow:active {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        @media only screen and (max-width: 1000px) {
          .slot-base-container {
            padding-bottom: 90px;
          }
        }
 
        @media only screen and (max-width: 768px) {
          .slot-logo {
            display: none;
          }
          
          .title-container {
            max-width: 200px;
          }
          
          .toast {
            left: 20px;
            right: 20px;
            max-width: calc(100% - 40px);
          }
        }

        @media only screen and (max-width: 600px) {
          .play-options {
            flex-direction: column;
            gap: 12px;
          }
          
          .play-btn-fancy, .demo-btn-fancy {
            width: 100%;
          }
          
          .or-divider {
            margin: 0;
            font-size: 12px;
          }
          
          .game-selection-compact {
            padding: 20px;
            max-width: 90%;
          }
          
          .game-selection-compact h2 {
            font-size: 22px;
            margin-bottom: 16px;
          }
        }

        .game-container {
          position: relative;
          width: 100%;
          aspect-ratio: 1150/637;
        }
        
        .game-selection-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }
      `}</style>
    </>
  );
}

export default Slot;
