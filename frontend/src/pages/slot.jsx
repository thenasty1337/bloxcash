import {A, useParams, useLocation} from "@solidjs/router";
import {createEffect, createResource, createSignal, For, Show} from "solid-js";
import {api, authedAPI, favorites} from "../util/api";
import {useUser} from "../contexts/usercontextprovider";
import Loader from "../components/Loader/loader";
import SlotsList from "../components/Home/slotslist";
import GameInfo from "../components/Home/gameinfo";
import Bets from "../components/Home/bets";
import {Title} from "@solidjs/meta";

function Slot(props) {

  let slotRef
  let containerRef

  let params = useParams()
  const location = useLocation()
  const [user] = useUser()

  const [url, setURL] = createSignal()
  const [sessionId, setSessionId] = createSignal()
  const [loading, setLoading] = createSignal(false)
  const [isDemoMode, setIsDemoMode] = createSignal(false)
  const [fallbackMessage, setFallbackMessage] = createSignal("")
  const [errorToast, setErrorToast] = createSignal(null)
  const [isFullWidth, setIsFullWidth] = createSignal(false)
  const [isLiked, setIsLiked] = createSignal(false)
  const [favoriteLoading, setFavoriteLoading] = createSignal(false)
  const [showGameSelection, setShowGameSelection] = createSignal(false)
  const [isGamePreloaded, setIsGamePreloaded] = createSignal(false)
  const [playMode, setPlayMode] = createSignal("real") // "real" or "demo"
  
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
  
  // Function to toggle favorite status
  async function toggleLike() {
    if (!user() || !slot()?.slug || favoriteLoading()) return;
    
    try {
      setFavoriteLoading(true);
      const result = await favorites.toggle(slot().slug);
      
      if (result.success) {
        const newStatus = result.action === 'added';
        setIsLiked(newStatus);
        
        // Show success message
        showError(
          result.action === 'added' ? 'Added to favorites!' : 'Removed from favorites!', 
          'success'
        );
        
        // Update the slot data to reflect the new favorite status
        mutate(prev => prev ? { ...prev, isFavorited: newStatus } : prev);
      } else {
        showError('Failed to update favorite status');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showError('Failed to update favorite status');
    } finally {
      setFavoriteLoading(false);
    }
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




      const slotData = {
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
        category: res.category,
        isFavorited: res.isFavorited || false
      }
      
      // Set the initial favorite status
      setIsLiked(slotData.isFavorited);
      
      return slotData;
    } catch (e) {
      console.error(e)
      showError(`Failed to load game: ${e.message || "Unknown error"}`);
      return null
    }
  }

  // Auto-launch game when slot is loaded and user is authenticated
  createEffect(async () => {
    if (slot() && user() && !url() && !loading()) {
      await launchGame(playMode() === "demo");
    }
  });
  
  async function launchGame(isDemo = false) {
    if (loading()) return;
    
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
  }
  
  // Function to handle mode switching
  function switchPlayMode(newMode) {
    if (newMode !== playMode()) {
      setPlayMode(newMode);
      setURL(null);
      setSessionId(null);
      setFallbackMessage("");
      launchGame(newMode === "demo");
    }
  }



  return (
    <>
      <Title>Nova Casino | {slot()?.name || 'Slots'}</Title>

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
                

              </div>
            </>
          ) : (
            <div class='game'>
              <Show when={!loading()} fallback={<Loader />}>
                <p>Loading game...</p>
              </Show>
            </div>
          )
        ) : (
          <div class='game'>
            <p>Please login to play.</p>
          </div>
        )}

        <div class='slot-info'>
          <div class='game-details'>
            <div class='game-image'>
              <Show when={slot() && slot().img} fallback={
                <div class="image-placeholder">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                </div>
              }>
                <img src={slot().img} alt={slot().name} />
              </Show>
            </div>
            
            <div class='game-meta'>
              <div className='title-info'>
                <Show when={!slot.loading} fallback={<h1>Loading...</h1>}>
                  <h1>{slot()?.name}</h1>
                  <div class='provider-rtp'>
                    <span class='provider'>{slot()?.providerName || slot()?.provider}</span>
                    
                  </div>
                </Show>
              </div>
              
        
            </div>
          </div>

          <div class='middle-section'>
            <div class='play-mode-switch'>
              <div class='switch-container'>
                <button 
                  className={`mode-btn ${playMode() === 'real' ? 'active' : ''}`}
                  onClick={() => switchPlayMode('real')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="6" x2="12" y2="18" />
                    <path d="M16 8H10a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8" />
                  </svg>
                  REAL
                </button>
                <button 
                  className={`mode-btn ${playMode() === 'demo' ? 'active' : ''}`}
                  onClick={() => switchPlayMode('demo')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="10 8 16 12 10 16 10 8"></polygon>
                  </svg>
                  DEMO
                </button>
              </div>
              <Show when={isDemoMode()}>
                <div class='demo-indicator'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  Demo Mode Active
                </div>
              </Show>
            </div>
          </div>

          <div class='slot-logo'>
            <span>NOVA CASINO</span>
          </div>

          <div class='controls'>
            <button 
              className={`control-btn favorite-btn ${isLiked() ? 'liked' : ''} ${favoriteLoading() ? 'loading' : ''}`} 
              onClick={toggleLike} 
              title={user() ? (isLiked() ? "Remove from Favorites" : "Add to Favorites") : "Login to add favorites"}
              disabled={!user() || favoriteLoading()}
            >
              <Show when={favoriteLoading()} fallback={
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isLiked() ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              }>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
              </Show>
            </button>
            <button className={`control-btn fullwidth-btn ${isFullWidth() ? 'active' : ''}`} onClick={toggleFullWidth} title="Toggle Full Width">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </button>
            {url() && (
              <button className='control-btn fullscreen-btn' onClick={() => slotRef.requestFullscreen()} title="Enter Fullscreen">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

        <Show when={slot()?.provider}>
          <SlotsList 
            title="MORE FROM THIS PROVIDER"
            provider={slot()?.provider}
            limit={20}
            viewAllLink={`/slots?provider=${slot()?.provider}`}
            icon="/assets/icons/fire.svg"
            user={user()}
          />
        </Show>

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
          border: 1px solid rgba(139, 120, 221, 0.2);
          background-color: rgba(27, 23, 56, 0.4);
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
          backdrop-filter: blur(8px);
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
          background: rgba(139, 120, 221, 0.08);
          border: 1px solid rgba(139, 120, 221, 0.2);
          color: #a8a3c7;
        }
        
        .demo-btn:hover {
          background: rgba(139, 120, 221, 0.15);
          border-color: #8b78dd;
          color: #8b78dd;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(139, 120, 221, 0.2);
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
          background: rgba(27, 23, 56, 0.6);
          backdrop-filter: blur(12px);
          padding: 28px;
          border-radius: 16px;
          max-width: 500px;
          width: 90%;
          box-shadow: 
            0 10px 25px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(139, 120, 221, 0.2) inset,
            0 0 30px rgba(139, 120, 221, 0.1) inset;
          position: relative;
          z-index: 3;
          text-align: center;
          border: 1px solid rgba(139, 120, 221, 0.1);
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
          background: rgba(139, 120, 221, 0.08);
          border: 1px solid rgba(139, 120, 221, 0.2);
          color: #a8a3c7;
          box-shadow: 
            0 8px 15px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(139, 120, 221, 0.3) inset,
            0 -3px 0 rgba(0, 0, 0, 0.2) inset;
          letter-spacing: 0.5px;
          backdrop-filter: blur(8px);
        }
        
        .demo-btn-fancy:hover {
          background: rgba(139, 120, 221, 0.15);
          border-color: #8b78dd;
          transform: translateY(-3px);
          box-shadow: 
            0 12px 20px rgba(139, 120, 221, 0.2),
            0 0 0 1px rgba(139, 120, 221, 0.5) inset,
            0 -3px 0 rgba(0, 0, 0, 0.2) inset;
          color: #8b78dd;
        }
        
        .demo-btn-fancy:active {
          transform: translateY(0);
          box-shadow: 
            0 4px 10px rgba(139, 120, 221, 0.1),
            0 0 0 1px rgba(139, 120, 221, 0.3) inset,
            0 2px 0 rgba(0, 0, 0, 0.1) inset;
        }
        
        .or-divider {
          font-size: 14px;
          font-weight: 700;
          color: #8aa3b8;
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
          background-color: rgba(27, 23, 56, 1);
          background-image: linear-gradient(135deg, rgba(139, 120, 221, 0.1) 25%, rgba(139, 120, 221, 0.05) 25%, rgba(139, 120, 221, 0.05) 50%, rgba(139, 120, 221, 0.1) 50%, rgba(139, 120, 221, 0.1) 75%, rgba(139, 120, 221, 0.05) 75%, rgba(139, 120, 221, 0.05) 100%);
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
            rgba(20, 30, 45, 0.85) 0%,
            rgba(26, 35, 50, 0.8) 50%,
            rgba(32, 42, 60, 0.9) 100%
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
          background: rgba(139, 120, 221, 0.08);
          border: 1px solid rgba(139, 120, 221, 0.2);
          color: #a8a3c7;
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
          color: #a8a3c7;
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
          background: rgba(40, 25, 25, 0.9);
          border: 1px solid #F95555;
          color: #F95555;
          backdrop-filter: blur(8px);
        }
        
        .success-toast {
          background: rgba(25, 53, 22, 0.9);
          border: 1px solid #59E878;
          color: #59E878;
          backdrop-filter: blur(8px);
        }
        
        .info-toast {
          background: rgba(27, 23, 56, 0.9);
          border: 1px solid #8b78dd;
          color: #8b78dd;
          backdrop-filter: blur(8px);
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
          width: 100%;
          padding: 5px 10px;
          border-radius: 12px;
          border: 1px solid rgba(139, 120, 221, 0.2);
          background: rgba(27, 23, 56, 0.6);
          margin: 20px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s ease;
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          position: relative;
        }
        
        .slot-info:hover {
          border-color: rgba(139, 120, 221, 0.3);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
        }
        
        .full-width .slot-info {
          border-radius: 8px;
        }
        
        .game-details {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }
        
        .game-image {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(139, 120, 221, 0.2);
          background: rgba(139, 120, 221, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .game-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .image-placeholder {
          color: #a8a3c7;
          opacity: 0.6;
        }
        
        .game-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
          flex: 1;
        }
        
        .title-info h1 {
          color: white;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 18px;
          font-weight: 800;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }
        
        .provider-rtp {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
        }
        
        .provider {
          color: #a8a3c7;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .rtp-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: rgba(139, 120, 221, 0.15);
          border: 1px solid rgba(139, 120, 221, 0.3);
          border-radius: 6px;
          color: #8b78dd;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }
        
        .rtp-badge span {
          opacity: 0.8;
        }
        
        .rtp-badge strong {
          font-weight: 700;
        }
        
        .tags-container {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .new-tag, .jackpot-tag {
          display: inline-block;
          padding: 3px 6px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
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
          font-size: 16px;
          letter-spacing: 1px;
          color: white;
          text-transform: uppercase;
          background: linear-gradient(90deg, #a8a3c7 0%, #8b78dd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          user-select: none;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          top: 50%;
          transform: translate(-50%, -50%);
        }
        
        .middle-section {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-right: 6px;
        }
        
        .play-mode-switch {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          height: fit-content;
        }
        
        .switch-container {
          display: flex;
          background: rgba(139, 120, 221, 0.08);
          border: 1px solid rgba(139, 120, 221, 0.2);
          border-radius: 6px;
          padding: 2px;
          backdrop-filter: blur(8px);
          height: 32px;
          box-sizing: border-box;
        }
        
        .mode-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          border: none;
          border-radius: 4px;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          color: #a8a3c7;
          white-space: nowrap;
          height: 26px;
          box-sizing: border-box;
        }
        
        .mode-btn.active {
          background: rgba(139, 120, 221, 0.2);
          color: #8b78dd;
         
        }
        
        .mode-btn:hover:not(.active) {
          background: rgba(139, 120, 221, 0.1);
          color: #8b78dd;
        }
        
        .demo-indicator {
          display: flex;
          align-items: center;
          gap: 3px;
          color: #a8a3c7;
          font-size: 9px;
          font-weight: 600;
          opacity: 0.8;
          white-space: nowrap;
        }
        
        .controls {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .control-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(139, 120, 221, 0.08);
          border: 1px solid rgba(139, 120, 221, 0.3);
          border-radius: 6px;
          color: #a8a3c7;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(8px);
        }
        
        .control-btn:hover {
          background: rgba(139, 120, 221, 0.15);
          border-color: #8b78dd;
          transform: translateY(-2px);
          color: #8b78dd;
          box-shadow: 0 4px 12px rgba(139, 120, 221, 0.2);
        }
        
        .control-btn:active {
          transform: translateY(0px);
        }
        
        .control-btn.active {
          background: rgba(139, 120, 221, 0.2);
          color: #8b78dd;
          border-color: rgba(139, 120, 221, 0.5);
        }
        
        .control-btn.liked {
          background: rgba(39, 145, 64, 0.2);
          color: #59E878;
          border-color: rgba(89, 232, 120, 0.3);
        }
        
        .control-btn.liked:hover {
          background: rgba(39, 145, 64, 0.3);
          color: #59E878;
          box-shadow: 0 4px 12px rgba(89, 232, 120, 0.2);
        }
        
        .control-btn.loading {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .control-btn.loading svg {
          animation: spin 1s linear infinite;
        }
        
        .control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }



        @media only screen and (max-width: 1000px) {
          .slot-base-container {
            padding-bottom: 90px;
          }
        }
 
        @media only screen and (max-width: 768px) {
          .slot-info {
            flex-direction: column;
            gap: 16px;
            padding: 16px;
          }
          
          .game-details {
            width: 100%;
            justify-content: flex-start;
          }
          
          .slot-logo {
            font-size: 14px;
            position: static;
            transform: none;
            order: 1;
            text-align: center;
          }
          
          .middle-section {
            order: 2;
            width: 100%;
            justify-content: center;
            margin-right: 0;
            margin-bottom: 8px;
          }
          
          .play-mode-switch {
            gap: 3px;
            align-self: center;
          }
          
          .controls {
            width: 100%;
            justify-content: center;
            order: 3;
          }
          
          .toast {
            left: 20px;
            right: 20px;
            max-width: calc(100% - 40px);
          }
        }
        
        @media only screen and (max-width: 480px) {
          .game-details {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 12px;
          }
          
          .provider-rtp {
            justify-content: center;
            flex-wrap: wrap;
            gap: 8px;
          }
          
          .slot-logo {
            font-size: 12px;
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
          {/* aspect-ratio: 1150/637; */}
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
