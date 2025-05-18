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

  let params = useParams()
  const location = useLocation()
  const [user] = useUser()
  const [featured, setFeatured] = createSignal([])
  const [url, setURL] = createSignal()
  const [sessionId, setSessionId] = createSignal()
  const [loading, setLoading] = createSignal(false)
  const [isDemoMode, setIsDemoMode] = createSignal(false)
  const [fallbackMessage, setFallbackMessage] = createSignal("")
  const [slot, {mutate}] = createResource(() => {
    // Extract the slug from the full pathname
    // Remove '/slots/' from the beginning to get the full slug
    const fullPath = location.pathname;
    const fullSlug = fullPath.replace(/^\/slots\//, '');
    
    console.log("Full pathname:", fullPath);
    console.log("Extracted slug:", fullSlug);
    return fullSlug;
  }, fetchSlot)

  async function fetchSlot(slug) {
    try {
      setURL(null)
      setSessionId(null)
      
      console.log("Fetching slot with slug:", slug);
      let res = await api(`/slots/${slug}`, 'GET', null, false)
      if (!res.name) return null

      console.log("API response:", res);
      console.log("Featured games count:", res.featured ? res.featured.length : 0);
      setFeatured(res.featured || [])

      return {
        id: res.id,
        name: res.name,
        slug: res.slug,
        img: res.img,
        provider: res.provider,
        providerName: res.providerName || res.provider,
        rtp: res.rtp,
        isNew: res.isNew,
        hasJackpot: res.hasJackpot,
        category: res.category
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }

  async function launchGame(isDemo = false) {
    if (loading() || !slot() || !user()) return;
    
    try {
      setLoading(true);
      
      // Extract the slug from the full pathname
      const fullPath = location.pathname;
      const fullSlug = fullPath.replace(/^\/slots\//, '');
      
      // Use the new play endpoint instead of embed
      const demoParam = isDemo ? '?demo=true' : '';
      let gameSession = await authedAPI(`/slots/play/${fullSlug}${demoParam}`, 'POST', null, false);
      
      if (!gameSession.url) {
        console.error('Failed to get game URL');
        setLoading(false);
        return;
      }
      
      setURL(gameSession.url);
      setSessionId(gameSession.sessionId);
      
      // Check if we got a demo version (either requested or as fallback)
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
    }
  }

  createEffect(async () => {
    if (!url() && slot() && user() && !loading()) {
      launchGame(false);
    }
  })

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

      <div class='slot-base-container'>
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
              <iframe src={url()} className='game' allow="fullscreen; autoplay" ref={slotRef}/>
            </>
          ) : (
            <div class='game'>
              <Show when={!loading()} fallback={<Loader />}>
                <button className='play-btn' onClick={() => launchGame(false)}>Play Now</button>
                <button className='demo-btn' onClick={() => launchGame(true)}>Try Demo</button>
              </Show>
            </div>
          )
        ) : (
          <div class='game'>
            <p>Please login to play.</p>
          </div>
        )}

        <div class='slot-info'>
          <GameInfo type='RTP' rtp={slot()?.rtp || 95} margin='unset'/>

          <div className='title-container'>
            <Show when={!slot.loading} fallback={<h1>Loading...</h1>}>
              <h1>{slot()?.name}</h1>
              <p>{slot()?.providerName || slot()?.provider}</p>
              {slot()?.category && <span className="category">{slot()?.category}</span>}
              {slot()?.isNew && <span className="new-tag">NEW</span>}
              {slot()?.hasJackpot && <span className="jackpot-tag">JACKPOT</span>}
            </Show>
          </div>

          <div class='controls'>
            {url() && (
              <button className='fullscreen' onClick={() => slotRef.requestFullscreen()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
                  <path
                    d="M20.5102 0V6.83674H18.2313V3.88554L14.4825 7.64575L12.8645 6.02772L16.6247 2.27891H13.6735V0H20.5102ZM0 0V6.83674H2.27891V3.88554L6.02772 7.64575L7.64575 6.02772L3.88554 2.27891H6.83674V0H0ZM20.5102 20.5102V13.6735H18.2313V16.6247L14.4825 12.8759L12.8759 14.4825L16.6247 18.2313H13.6735V20.5102H20.5102ZM6.83674 20.5102V18.2313H3.88554L7.63435 14.4825L6.02772 12.8645L2.27891 16.6247V13.6735H0V20.5102H6.83674Z"
                    fill="#9189D3"/>
                </svg>

                Fullscreen
              </button>
            )}
          </div>
        </div>

        <div className='featured-section'>
          <div className='featured-header'>
            <div className='featured-title'>
              <img src='/assets/icons/fire.svg' height='19' width='19' alt=''/>
              <span className='white bold'>MORE FROM THIS PROVIDER</span>
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

          <div className='slots-container'>
            <div className='slots' ref={slotsRef}>
              <Show when={!slot.loading} fallback={<Loader small={true}/>}>
                <For each={featured()}>{(slot, index) =>
                  <FancySlotBanner {...slot}/>
                }</For>
              </Show>
            </div>
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
        }

        .game {
          width: 100%;
          aspect-ratio: 1150/637;

          outline: unset;
          border: unset;

          border-radius: 15px;
          border: 1px solid #3F3B77;
          background: #29254E;
          
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          
          font-weight: 700;
          color: white;
        }
        
        .play-btn, .demo-btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-family: Geogrotesque Wide, sans-serif;
          font-weight: 700;
          cursor: pointer;
          min-width: 150px;
          text-align: center;
        }
        
        .play-btn {
          background: linear-gradient(180deg, #59E878 0%, #26A240 100%);
          color: #0D2611;
          border: none;
        }
        
        .demo-btn {
          background: #342E5F;
          border: 1px solid #494182;
          color: #9189D3;
        }

        .demo-warning {
          width: 100%;
          padding: 10px 15px;
          margin-bottom: 10px;
          background: rgba(254, 215, 102, 0.1);
          border: 1px solid #FED766;
          border-radius: 8px;
          color: #FED766;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
        }
        
        .demo-warning svg {
          min-width: 24px;
          height: 24px;
          stroke: #FED766;
        }
        
        .slot-info {
          height: 65px;

          border-radius: 8px;
          border: 1px solid rgba(134, 111, 234, 0.15);
          background: linear-gradient(0deg, rgba(64, 57, 118, 0.65) 0%, rgba(64, 57, 118, 0.65) 100%), radial-gradient(60% 60% at 50% 50%, rgba(147, 126, 236, 0.15) 0%, rgba(102, 83, 184, 0.15) 100%);

          margin: 20px 0;

          display: flex;
          align-items: center;
          gap: 12px;
          
          padding: 0 16px;
        }

        .title-container {
          color: #9189D3;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 16px;
          font-weight: 600;
          text-transform: capitalize;
          display: flex;
          flex-direction: column;
        }

        .title-container h1 {
          color: white;
          font-size: 18px;
          font-weight: 800;
          margin: 0;
        }
        
        .category {
          font-size: 12px;
          color: #9189D3;
          margin-top: 2px;
        }
        
        .new-tag, .jackpot-tag {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          margin-right: 4px;
          margin-top: 4px;
        }
        
        .new-tag {
          background-color: #59E878;
          color: #0D2611;
        }
        
        .jackpot-tag {
          background: linear-gradient(180deg, #FFC700 0%, #FF7A00 100%);
          color: #3A2800;
        }
        
        .controls {
          margin-left: auto;
        }

        .fullscreen {
          color: #9189D3;
          font-family: Geogrotesque Wide, sans-serif;
          font-size: 12px;
          font-weight: 700;

          background: unset;
          border: unset;
          outline: unset;

          cursor: pointer;

          display: flex;
          gap: 8px;
          align-items: center;
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
          font-size: 16px;
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
          background: rgba(29, 24, 62, 0.15);
          padding: 12px;
          margin-bottom: 30px;
        }

        .slots {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 4px;
          scroll-behavior: smooth;
          -ms-overflow-style: none;
          scrollbar-width: none;
          min-height: 195px;
        }

        .slots::-webkit-scrollbar {
          display: none;
        }

        .slot {
          min-width: 133px;
          width: 133px;
          height: 195px;
          border-radius: 6px;

          background-size: cover;
          background-repeat: no-repeat;

          position: relative;
        }

        .arrow {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: rgba(84, 76, 146, 0.4);
          border: 1px solid rgba(134, 111, 234, 0.3);
          transition: background-color 0.2s ease, transform 0.2s ease;
        }
        
        .arrow:hover {
          background: rgba(84, 76, 146, 0.6);
          transform: translateY(-2px);
        }

        @media only screen and (max-width: 1000px) {
          .slot-base-container {
            padding-bottom: 90px;
          }
        }
      `}</style>
    </>
  );
}

export default Slot;
