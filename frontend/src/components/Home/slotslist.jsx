import {createResource, createSignal, For, Show} from "solid-js";
import {A} from "@solidjs/router";
import {api, authedAPI} from "../../util/api";
import Loader from "../Loader/loader";
import BlurImage from "../UI/BlurImage";
import FavoriteButton from "../UI/FavoriteButton";
import { BsDiamond } from 'solid-icons/bs';
import { AiOutlineEye, AiOutlineArrowLeft, AiOutlineArrowRight } from 'solid-icons/ai';

function SlotsList(props) {
  let slotsRef
  const [slots, setSlots] = createSignal([])
  
  // Get props with defaults
  const getTitle = () => props.title || 'Slots';
  const getType = () => props.type || null; // 'video-slots', 'live'
  const getShowNewOnly = () => props.showNewOnly || false; // for new releases
  const getShowFeaturedOnly = () => props.showFeaturedOnly || false; // for featured
  const getShowPopular = () => props.showPopular || false; // for popular (sort by popularity)
  const getShowFavoritesOnly = () => props.showFavoritesOnly || false; // for user favorites
  const getProvider = () => props.provider || null; // filter by provider
  const getLimit = () => props.limit || 25;
  const getViewAllLink = () => props.viewAllLink || '/slots';
  const getIcon = () => props.icon || null; // Icon path
  const getUser = () => props.user || null; // User for authentication check
  
  const [slotsInfo] = createResource(fetchSlots)

  async function fetchSlots() {
    try {
      // Build query parameters
      let queryParams = new URLSearchParams();
      queryParams.append('limit', getLimit().toString());
      
      // Add type filter
      if (getType()) {
        queryParams.append('type', getType());
      }
      
      // Add new releases filter
      if (getShowNewOnly()) {
        queryParams.append('type', 'video-slots'); // New releases are video slots
        queryParams.append('isNew', 'true'); // Filter for new releases
      }
      
      // Add popular sorting
      if (getShowPopular()) {
        queryParams.append('sortBy', 'popularity');
        queryParams.append('sortOrder', 'DESC');
      }
      
      // Add provider filter
      if (getProvider()) {
        queryParams.append('provider', getProvider());
      }
      
      let endpoint = '/slots';
      
      // Use featured endpoint for featured slots
      if (getShowFeaturedOnly()) {
        endpoint = '/slots/featured';
        queryParams = new URLSearchParams(); // Featured endpoint doesn't need other params
        queryParams.append('limit', getLimit().toString());
      }
      
      // Use favorites endpoint for user favorites
      if (getShowFavoritesOnly()) {
        endpoint = '/slots/favorites';
        queryParams = new URLSearchParams(); // Favorites endpoint doesn't need other params
        queryParams.append('limit', getLimit().toString());
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      
      // Use authedAPI for favorites endpoint, api for others
      let res;
      if (getShowFavoritesOnly()) {
        res = await authedAPI(url, 'GET', null, false);
      } else {
        res = await api(url, 'GET', null, false);
      }
      
      // All endpoints now return consistent format: { data, total, limit, offset }
      if (!Array.isArray(res.data)) return null;
      
      setSlots(res.data);
      return res;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  function scrollGames(direction) {
    slotsRef.scrollBy({
      left: slotsRef.clientWidth * direction,
      behavior: 'smooth'
    })
  }

  // Don't render if loading, error, or no games available
  const shouldRender = () => {
    if (slotsInfo.loading) return false
    if (!slotsInfo()) return false
    
    // For favorites, don't render if user is not authenticated
    if (getShowFavoritesOnly() && !getUser()) return false
    
    if (!slotsInfo()?.total || slotsInfo()?.total === 0) return false
    if (!slots() || slots().length === 0) return false
    return true
  }

  return (
    <Show when={shouldRender()}>
      <div class='games-container'>
        <div class='games'>
          <div class='games-header'>
            <div class='header-content'>
              <div class='header-left'>
                <Show when={getIcon()}>
                  <div class='header-icon'>
                    <img src={getIcon()} alt={getTitle()} />
                  </div>
                </Show>
                
                <div class='header-text'>
                  <h2 class='title'>{getTitle()}</h2>
                  <span class='count'>{slotsInfo()?.total || 0} games available</span>
                </div>
              </div>

              <div class='header-right'>
                <div class='viewall-btn'>
                  <AiOutlineEye size={14} />
                  <span>See All</span>
                  <A href={getViewAllLink()} class='gamemode-link'/>
                </div>
                
                <div class='nav-controls'>
                  <button class='nav-btn' onClick={() => scrollGames(-1)} type="button">
                    <AiOutlineArrowLeft size={16} />
                  </button>
                  
                  <button class='nav-btn' onClick={() => scrollGames(1)} type="button">
                    <AiOutlineArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div class='header-divider'></div>
          </div>

          <div class='slots' ref={slotsRef}>
            <For each={slots()}>{(slot, index) =>
              <div className='slot'>
                <BlurImage 
                  src={`${slot.img}`}
                  blurhash={slot.blurhash}
                  style={{ 'border-radius': '6px', 'pointer-events': 'none' }}
                />
                <div class='slot-overlay'>
                  <div class='favorite-container'>
                    <FavoriteButton 
                      slug={slot.slug}
                      isAuthenticated={!!getUser()}
                      isFavorited={slot.isFavorited}
                      size={14}
                    />
                  </div>
                </div>
                <A href={`/slots/${slot.slug}`} class='gamemode-link'/>
              </div>
            }</For>
            
            {/* View All card at the end */}
            <div className='slot view-all-slot'>
              <div class='view-all-content'>
                <div class='view-all-icon'>
                  <AiOutlineEye size={24} />
                </div>
                <div class='view-all-text'>
                  <span class='view-all-title'>View All</span>
                  <span class='view-all-subtitle'>{slotsInfo()?.total || 0} games</span>
                </div>
              </div>
              <A href={getViewAllLink()} class='gamemode-link'/>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .games-container {
          width: 100%;
          margin-top: 1.5rem;
        }

        .games {
          width: 100%;
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
          background: linear-gradient(90deg, rgb(31 36 68) 0%, rgba(78, 205, 196, 0.1) 30%, transparent 100%);
        }



        .viewall-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          
          border: 1px solid rgb(56 50 93);
          border-radius: 8px;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .viewall-btn:hover {
          border-color: rgb(31 36 68);
    background: rgb(20 16 43);
    transform: translateY(-1px);
}

        .viewall-btn svg {
          opacity: 0.8;
          color: #4ecdc4;
        }

        .viewall-btn:hover svg {
          opacity: 1;
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

        .slots {
          display: flex;
    gap: 1rem;
    padding: 10px 0 0 0;
    border-radius: 12px;
    min-height: 195px;
    overflow-x: auto;
    scrollbar-width: none;
        }
        
        .slots::-webkit-scrollbar {
          display: none;
        }

        .slot {
          min-width: 146px;
          width: 146px;
          height: 195px;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        
        .slot:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 
            0 8px 16px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(78, 205, 196, 0.2),
            0 0 20px rgba(78, 205, 196, 0.1);
        }

        .view-all-slot {
          background: linear-gradient(135deg, rgb(78 127 205 / 10%) 0%, rgb(26 31 50 / 80%) 100%);
          border: 2px dashed rgb(95 78 205 / 30%);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .view-all-slot:hover {
    background: rgb(18 16 50 / 10%);
    transform: translateY(-2px);
        }

        .view-all-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          text-align: center;
          padding: 1rem;
        }

        .view-all-icon {
          width: 48px;
          height: 48px;
          background: rgb(78 127 205 / 15%);
          border: 1px solid rgb(95 78 205 / 30%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8aa3b8;
          transition: all 0.3s ease;
        }

        .view-all-slot:hover .view-all-icon {
         
          border-color: rgb(95 78 205 / 50%);
          transform: scale(1.1);
        }

        .view-all-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .view-all-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #ffffff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .view-all-subtitle {
          font-size: 0.75rem;
          color: #8aa3b8;
          font-weight: 500;
        }

        .slot-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 12;
        }

        .favorite-container {
          position: absolute;
          top: 8px;
          right: 8px;
          pointer-events: auto;
        }

        .gamemode-link {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
          text-decoration: none;
        }

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
            justify-content: space-between;
          }

          .title {
            font-size: 1rem;
          }

          .slots {
            gap: 0.75rem;
            padding: 0.75rem;
          }

          .slot {
            min-width: 130px;
            width: 130px;
            height: 170px;
          }

          .view-all-icon {
            width: 40px;
            height: 40px;
          }

          .view-all-title {
            font-size: 0.8rem;
          }

          .view-all-subtitle {
            font-size: 0.7rem;
          }
        }

        @media (max-width: 480px) {
          .header-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .header-right {
            flex-direction: column;
            gap: 0.5rem;
          }

          .viewall-btn {
            align-self: stretch;
            justify-content: center;
          }

          .nav-controls {
            align-self: stretch;
            justify-content: center;
          }

          .slots {
            gap: 0.5rem;
            padding: 0.5rem;
          }

          .slot {
            min-width: 120px;
            width: 120px;
            height: 150px;
          }

          .view-all-icon {
            width: 36px;
            height: 36px;
          }

          .view-all-content {
            gap: 0.5rem;
            padding: 0.75rem;
          }

          .view-all-title {
            font-size: 0.75rem;
          }

          .view-all-subtitle {
            font-size: 0.65rem;
          }
        }
      `}</style>
    </Show>
  );
}

export default SlotsList;
