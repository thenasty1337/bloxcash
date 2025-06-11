import {createResource, createSignal, createMemo, For, Show, onMount, onCleanup} from "solid-js";
import {A} from "@solidjs/router";
import {api, authedAPI} from "../../util/api";
import Loader from "../Loader/loader";
import BlurImage from "../UI/BlurImage";
import FavoriteButton from "../UI/FavoriteButton";
import { BsDiamond } from 'solid-icons/bs';
import { AiOutlineEye, AiOutlineArrowLeft, AiOutlineArrowRight } from 'solid-icons/ai';
import './slotslist.css';

// Global cache for API requests to prevent duplicate calls
const apiCache = new Map();
const requestDeduplication = new Map();

// Cache for 30 seconds to prevent duplicate requests
const CACHE_DURATION = 30000;

function getCacheKey(endpoint, queryParams) {
  return `${endpoint}?${queryParams.toString()}`;
}

function getCachedResponse(cacheKey) {
  const cached = apiCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCacheResponse(cacheKey, data) {
  apiCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
}

// Lightweight image component optimized for performance
const OptimizedSlotImage = (props) => {
  return (
    <img
      src={props.src}
      alt={props.alt || "Slot game"}
      loading="lazy"
      decoding="async"
      style={{ 
        'border-radius': '6px', 
        'pointer-events': 'none',
        'width': '100%',
        'height': '100%',
        'object-fit': 'cover'
      }}
      onError={(e) => {
        // Simple fallback without complex operations
        e.target.src = '/assets/slots/default.png';
      }}
    />
  );
};

function SlotsList(props) {
  let slotsRef
  let containerRef
  const [slots, setSlots] = createSignal([])
  const [isVisible, setIsVisible] = createSignal(false)

  
  // Optimize prop access by extracting values once instead of memoizing
  const title = props.title || 'Slots';
  const type = props.type || null;
  const showNewOnly = props.showNewOnly || false;
  const showFeaturedOnly = props.showFeaturedOnly || false;
  const showPopular = props.showPopular || false;
  const showFavoritesOnly = props.showFavoritesOnly || false;
  const provider = props.provider || null;
  const limit = props.limit || 25;
  const viewAllLink = props.viewAllLink || '/slots';
  const icon = props.icon || null;
  const user = props.user || null;
  
  // Intersection Observer for lazy loading
  onMount(() => {
    if (!containerRef) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only load once when visible
        }
      },
      { 
        rootMargin: '100px', // Load when 100px away from viewport
        threshold: 0.1 
      }
    );
    
    observer.observe(containerRef);
    
    onCleanup(() => {
      observer.disconnect();
    });
  });
  
  // Optimized fetch function with caching and deduplication
  const fetchSlots = async () => {
    if (!isVisible()) {
      return null; // Don't fetch until visible
    }
    
    const fetchStart = performance.now();
    
    try {
      // Build query parameters
      let queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());
      
      // Add type filter
      if (type) {
        queryParams.append('type', type);
      }
      
      // Add new releases filter
      if (showNewOnly) {
        queryParams.append('type', 'video-slots');
        queryParams.append('isNew', 'true');
      }
      
      // Add popular sorting
      if (showPopular) {
        queryParams.append('sortBy', 'popularity');
        queryParams.append('sortOrder', 'DESC');
      }
      
      // Add provider filter
      if (provider) {
        queryParams.append('provider', provider);
      }
      
      let endpoint = '/slots';
      
      // Use featured endpoint for featured slots
      if (showFeaturedOnly) {
        endpoint = '/slots/featured';
        queryParams = new URLSearchParams();
        queryParams.append('limit', limit.toString());
      }
      
      // Use favorites endpoint for user favorites
      if (showFavoritesOnly) {
        endpoint = '/slots/favorites';
        queryParams = new URLSearchParams();
        queryParams.append('limit', limit.toString());
      }
      
      const cacheKey = getCacheKey(endpoint, queryParams);
      
      // Check cache first
      const cachedResponse = getCachedResponse(cacheKey);
      if (cachedResponse) {
        setSlots(cachedResponse.data || []);
        return cachedResponse;
      }
      
      // Check if the same request is already in progress
      if (requestDeduplication.has(cacheKey)) {
        const existingRequest = await requestDeduplication.get(cacheKey);
        setSlots(existingRequest.data || []);
        return existingRequest;
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `${endpoint}?${queryString}` : endpoint;
      
      // Create the request promise and store it for deduplication
      const requestPromise = (async () => {
        let res;
        if (showFavoritesOnly) {
          res = await authedAPI(url, 'GET', null, false);
        } else {
          res = await api(url, 'GET', null, false);
        }
        
        if (!Array.isArray(res.data)) {
          res.data = [];
        }
        
        return res;
      })();
      
      requestDeduplication.set(cacheKey, requestPromise);
      
      try {
        const res = await requestPromise;
        
        // Cache the response
        setCacheResponse(cacheKey, res);
        
        const fetchTime = performance.now() - fetchStart;
        if (fetchTime > 16) {
          console.warn(`🐌 Slow SlotsList fetch for ${title}: ${fetchTime.toFixed(2)}ms`);
        }
        
        setSlots(res.data);
        return res;
      } finally {
        // Remove from deduplication map after completion
        requestDeduplication.delete(cacheKey);
      }
    } catch (e) {
      console.error(`❌ SlotsList fetch error for ${title}:`, e);
      requestDeduplication.delete(cacheKey);
      return null;
    }
  };

  // Only create resource when visible
  const [slotsInfo] = createResource(() => isVisible(), fetchSlots)

  // Optimized scroll function without memoization
  const scrollGames = (direction) => {
    if (slotsRef) {
      slotsRef.scrollBy({
        left: slotsRef.clientWidth * direction,
        behavior: 'smooth'
      });
    }
  };

  // Optimized render conditions without excessive memoization
  const shouldRender = () => true;

  const shouldRenderContent = () => {
    if (!isVisible()) return false;
    if (slotsInfo.loading) return false;
    if (!slotsInfo()) return false;
    
    // For favorites, don't render if user is not authenticated
    if (showFavoritesOnly && !user) return false;
    
    const data = slotsInfo();
    if (!data?.total || data.total === 0) return false;
    if (!slots() || slots().length === 0) return false;
    return true;
  };

  // Simple count calculation
  const totalCount = () => slotsInfo()?.total || 0;

  // Optimized slot rendering component to reduce DOM complexity
  const SlotCard = (props) => {
    const slot = props.slot;
    return (
      <div class='slot'>
        <OptimizedSlotImage 
          src={slot.img}
          alt={slot.name || 'Slot game'}
        />
        <div class='slot-overlay'>
          <FavoriteButton 
            slug={slot.slug}
            isAuthenticated={!!user}
            isFavorited={slot.isFavorited}
            size={14}
          />
        </div>
        <A href={`/slots/${slot.slug}`} class='gamemode-link'/>
      </div>
    );
  };

  return (
    <Show when={shouldRender()}>
      <div ref={containerRef} class='games-container'>
        <Show when={shouldRenderContent()}>
          <div class='games'>
              <div class='games-header'>
                <div class='header-content'>
                  <div class='header-left'>
                    <Show when={icon}>
                      <div class='header-icon'>
                        <img src={icon} alt={title} loading="lazy" decoding="async" />
                      </div>
                    </Show>
                    
                    <div class='header-text'>
                      <h2 class='title'>{title}</h2>
                      <span class='count'>{totalCount()} games available</span>
                    </div>
                  </div>

                  <div class='header-right'>
                    <div class='viewall-btn'>
                      <AiOutlineEye size={14} />
                      <span>See All</span>
                      <A href={viewAllLink} class='gamemode-link'/>
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
                {/* Use a simpler For loop with optimized slot rendering */}
                <For each={slots().slice(0, Math.min(slots().length, 12))} fallback={null}>
                  {(slot) => <SlotCard slot={slot} />}
                </For>
                
                {/* View All card at the end */}
                <div class='slot view-all-slot'>
                  <div class='view-all-content'>
                    <div class='view-all-icon'>
                      <AiOutlineEye size={24} />
                    </div>
                    <div class='view-all-text'>
                      <span class='view-all-title'>View All</span>
                      <span class='view-all-subtitle'>{totalCount()} games</span>
                    </div>
                  </div>
                  <A href={viewAllLink} class='gamemode-link'/>
                </div>
              </div>
            </div>
        </Show>
        
        <Show when={!shouldRenderContent() && isVisible() && slotsInfo.loading}>
          <div class='games'>
            <div class='games-header'>
              <div class='header-content'>
                <div class='header-left'>
                  <Show when={icon}>
                    <div class='header-icon'>
                      <img src={icon} alt={title} loading="lazy" decoding="async" />
                    </div>
                  </Show>
                  
                  <div class='header-text'>
                    <h2 class='title'>{title}</h2>
                    <span class='count'>Loading...</span>
                  </div>
                </div>

                <div class='header-right'>
                  <div class='viewall-btn skeleton-shimmer'>
                    <AiOutlineEye size={14} />
                    <span>See All</span>
                  </div>
                  
                  <div class='nav-controls'>
                    <button class='nav-btn' disabled type="button">
                      <AiOutlineArrowLeft size={16} />
                    </button>
                    
                    <button class='nav-btn' disabled type="button">
                      <AiOutlineArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div class='header-divider'></div>
            </div>

            <div class='slots'>
              {/* Generate fewer skeleton cards for better performance */}
              <For each={Array(Math.min(limit, 4)).fill(0)} fallback={null}>
                {() => (
                  <div class='slot skeleton-slot'>
                    <div class='skeleton-image'></div>
                  </div>
                )}
              </For>
              
              {/* Skeleton View All card */}
              <div class='slot view-all-slot skeleton-slot'>
                <div class='view-all-content'>
                  <div class='view-all-icon skeleton-shimmer'>
                    <AiOutlineEye size={24} />
                  </div>
                  <div class='view-all-text'>
                    <span class='view-all-title skeleton-shimmer'>View All</span>
                    <span class='view-all-subtitle skeleton-shimmer'>Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </div>
    </Show>
  );
}

export default SlotsList;
